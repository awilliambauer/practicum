
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

    /// Initialize the logging system
    /// This should be invoked before any other function.
    /// No other logging functions should be called unless this succeeds.
    self.initialize = function(filename, release_id, username) {
        // TODO
    };

    self.save_user_data = function(savedata) {
       for (const k in savedata) {
           window.localStorage[k] = JSON.stringify(savedata[k]);
       }
    };

    /// Logs a (non-task) event and returns a promise that is fulfilled when the event is successfully logged.
    self.log_event_with_promise = function(data) {
        // TODO
    };

    /// Starts a task.
    /// The returned object should be passed to log_task_event as the first argument.
    self.start_task = function(problemConfig) {
        // TODO
    };

    /// Logs a task event.
    /// `task_logger` should be the object returned by start_task.
    self.log_task_event = function(task_logger, data) {
        // TODO
    };

    return self;
})();

