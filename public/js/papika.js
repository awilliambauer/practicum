/**!
 * Papika telemetry client library.
 * Copyright 2015 Eric Butler.
 * Revision Id: ead1751ae793571d302686684075d41c8103b3b6
 */

if (typeof module !== 'undefined' && module.exports) {
    fetch = require('node-fetch');
}

var papika = function(){
    "use strict";
    var mdl = {};

    var PROTOCOL_VESRION = 1;
    var REVISION_ID = 'ead1751ae793571d302686684075d41c8103b3b6';

    var uuid_regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    function is_uuid(str) {
        return uuid_regex.test(str);
    }
    mdl.is_uuid = is_uuid;

    function send_post_request(url, params) {
        return fetch(url, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        }).then(function(response) {
            if (response.status === 200) {
                return response.json();
            } else {
                throw new Error(response.status + ' ' + response.statusText);
            }
        });
    }

    function send_nonsession_request(url, data, release_id, release_key) {
        var sdata = JSON.stringify(data);
        return send_post_request(url, {
            version: PROTOCOL_VESRION,
            data: sdata,
            release: release_id,
            checksum: ''
        });
    }

    function send_session_request(url, data, session_id, session_key) {
        var sdata = JSON.stringify(data);
        return send_post_request(url, {
            version: PROTOCOL_VESRION,
            data: sdata,
            session: session_id,
            checksum: ''
        });
    }

    function query_user_id(baseUri, username, release_id, release_key) {
        var data = {
            username: username
        };
        return send_nonsession_request(baseUri + '/api/user', data, release_id, release_key);
    }

    function query_experimental_condition(baseUri, args, release_id, release_key) {
        var data = {
            user_id: args.user,
            experiment_id: args.experiment
        };
        return send_nonsession_request(baseUri + '/api/experiment', data, release_id, release_key);
    }

    function log_session(baseUri, args, release_id, release_key) {
        var data = {
            user_id: args.user,
            release_id: release_id,
            client_time: new Date().toISOString(),
            detail: JSON.stringify(args.detail),
            library_revid: REVISION_ID,
        };
        return send_nonsession_request(baseUri + '/api/session', data, release_id, release_key);
    }

    function log_events(baseUri, events, session_id, session_key) {
        return send_session_request(baseUri + '/api/event', events, session_id, session_key);
    }

    mdl.TelemetryClient = function(baseUri, release_id, release_key) {
        if (!is_uuid(release_id)) throw Error('release id is not a uuid!');
        if (typeof release_key !== 'string') throw Error('release key is not a string!');
        if (typeof baseUri !== 'string') throw Error('baseUri is not a string!');

        var self = {};

        var session_sequence_counter = 1;
        var task_id_counter = 1;
        var p_session_id = undefined;
        var p_event_log = new Promise(function(resolve){resolve();});
        var event_log_lock = false;
        var events_to_log = [];

        function flush_event_log() {
            // block until the current operation has finished
            p_event_log.then(function() {
                // if something else was already waiting to send events (and beat us) then give up
                if (event_log_lock || events_to_log.length === 0) return;
                // else stop anything else waiting to send events
                event_log_lock = true;

                p_event_log = p_session_id.then(function(session) {
                    var log_to = events_to_log.length;

                    return log_events(baseUri, events_to_log, session.session_id, session.session_key).then(function() {
                        // success! throw out the events we successfully logged
                        events_to_log.splice(0, log_to);
                        event_log_lock = false;
                    }, function() {
                        // error! end the promise anyway, but keep the failed events around
                        event_log_lock = false;
                    });
                });
            });
        }

        self.log_session = function(args) {
            if (p_session_id) throw Error('session already logged!');
            if (!args) throw Error("no session data!");
            if (!is_uuid(args.user)) throw Error("bad/missing session user id!");
            if (typeof args.detail === 'undefined') throw Error("bad/missing session detail object!");

            p_session_id = log_session(baseUri, args, release_id, release_key);
            return p_session_id;
        };

        self.query_user_id = function(args) {
            if (typeof args.username !== 'string') throw Error('bad/missing username!');
            return query_user_id(baseUri, args.username, release_id, release_key).then(function(result) {
                return result.user_id;
            });
        }

        self.query_experimental_condition = function(args) {
            if (!is_uuid(args.user)) throw Error('bad/missing user id!');
            if (!is_uuid(args.experiment)) throw Error('bad/missing experiment id!');
            return query_experimental_condition(baseUri, args, release_id, release_key).then(function(result) {
                return result.condition;
            });
        }

        self.log_event = function(args) {
            // TODO add some argument checking and error handling
            if (!p_session_id) throw Error('session not yet logged!');
            if (typeof args.type !== 'number') throw Error('bad/missing type!');
            if (typeof args.detail === 'undefined') throw Error("bad/missing session detail object!");
            var detail = JSON.stringify(args.detail);

            var data = {
                type_id: args.type,
                session_sequence_index: session_sequence_counter,
                client_time: new Date().toISOString(),
                detail: detail,
            };
            if (args.task_start) data.task_start = args.task_start;
            if (args.task_event) data.task_event = args.task_event;
            events_to_log.push(data);
            session_sequence_counter += 1;

            // TODO maybe wait and batch flushes (with a timeout if it doesn't fill up)
            flush_event_log();
        }

        self.start_task = function(args) {
            if (!is_uuid(args.group)) throw Error('bad/missing group!');

            var task_id = task_id_counter;
            task_id_counter += 1;
            var task_sequence_counter = 1;

            args.task_start = {
                task_id: task_id,
                group_id: args.group
            };
            self.log_event(args);

            return {
                log_event: function(args) {
                    args.task_event = {
                        task_id: task_id,
                        task_sequence_index: task_sequence_counter
                    };
                    task_sequence_counter += 1;
                    self.log_event(args);
                }
            };
        }

        return self;
    };

    return mdl;
}();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = papika;
}


