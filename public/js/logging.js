
var Logging = (function() {
    var self = {};

    self.ID = {
        TaskStart: 2,
        TaskEnd: 3,
        SubtaskStart: 4,

        Consent: 11,
        FadeLevel: 12,
        CheckSolutionButton: 13,
        NextButton: 14,
        QuestionAnswer: 15,
        BottomOutHint: 16,
    };

    var telemetry_client;
    var userid;
    var condition;
    var savedata;

    // HACK hooray hardcoded configuration
    var EXPERIMENT_ID = '240c0a18-6ad4-11e5-b551-0f481f7c36e1';

    /// Initialize the logging system, fetching the user id and logging the session.
    /// This should be invoked before any other function.
    /// Will return a promise with the following items:
    /// - saved user data
    /// - experimental condition
    /// No other logging functions should be called unless this succeeds.
    self.initialize = function(base_uri, release_id, username) {
        telemetry_client = papika.TelemetryClient(base_uri, release_id, '');

        return telemetry_client.query_user_id({username:username})
            .then(function(_userid) {
                userid = _userid;
                return telemetry_client.log_session({
                    user: userid,
                    detail: null
                });
            }).then(function() {
                return telemetry_client.query_user_data({user:userid});
            }).then(function(_savedata) {
                savedata = _savedata;
                return telemetry_client.query_experimental_condition({user:userid, experiment:EXPERIMENT_ID});
            }).then(function(_condition) {
                condition = _condition;
            }).then(function() {
                return {
                    condition: condition,
                    savedata: savedata
                };
            });
    };

    self.save_user_data = function(savedata) {
        return telemetry_client.save_user_data({user:userid, savedata:savedata});
    };

    /// Logs a (non-task) event and returns a promise that is fulfilled when the event is scuessfully logged.
    self.log_event_with_promise = function(data) {
        data.category = 0; // dummy category to conform to updated protocol
        return telemetry_client.log_event(data, true);
    };

    /// Starts a task.
    /// The returned object should be passed to log_task_event as the first argument.
    self.start_task = function(problemConfig) {
        return telemetry_client.start_task({
            type: self.ID.TaskStart,
            detail: null,
            group: problemConfig.id,
            category: 0 // dummy category to conform to updated protocol
        });
    };

    /// Logs a task event.
    /// `task_logger` should be the object returned by start_task.
    self.log_task_event = function(task_logger, data) {
        data.category = 0; // dummy category to conform to updated protocol
        task_logger.log_event(data);
    };

    return self;
})();

