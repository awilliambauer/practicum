
var Logging = (function() {
    var self = {};

    self.ID = {
        TaskStart: 2,
        TaskEnd: 3,

        Consent: 11,
        FadeLevel: 12,
        CheckSolutionButton: 13,
        NextButton: 14,
        QuestionAnswer: 15,
        BottomOutHint: 16
    };

    var telemetry_client;
    var userid_promise;

    /// Initialize the logging system, fetching the user id and logging the session.
    /// This should be called before any other function, but other functions are safe to call immediately after this.
    self.initialize = function(base_uri, release_id, username) {
        telemetry_client = papika.TelemetryClient(base_uri, release_id, '');

        userid_promise = telemetry_client.query_user_id({username:username})
            .then(function(userid) {
                telemetry_client.log_session({
                    user: userid,
                    detail: null
                });
                return userid;
            });
    };

    /// Logs a (non-task) event and returns a promise that is fulfilled when the event is scuessfully logged.
    self.log_event_with_promise = function(data) {
        return userid_promise.then(function() {
            return telemetry_client.log_event(data, true);
        });
    }

    /// Starts a task.
    /// The returned object should be passed to log_task_event as the first argument.
    self.start_task = function(problemConfig) {
        return userid_promise.then(function() {
             return telemetry_client.start_task({
                type: self.ID.TaskStart,
                detail: null,
                group: problemConfig.id
            });
        });
    };

    /// Logs a task event.
    /// `task_logger` should be the object returned by start_task.
    self.log_task_event = function(task_logger, data) {
        task_logger.then(function(task) {
            task.log_event(data);
        });
    };

    return self;
})();

