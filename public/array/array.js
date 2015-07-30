
var array = (function() {
    "use strict";

    var simulatorInterface;
    var logger;
    var state;

    function reset() {
        // TODO unimplemented
    }

    function step() {
        // log that the "next" button was clicked
        Logging.log_task_event(logger, {
            type: Logging.ID.NextButton,
            detail: {},
        });

        // FIXME
        if (false /*waitingForResponse*/) {
            throw new Error("unimplemented!");

            numTries = numTries + 1;
            switch (responseType) {
                case 'add_variable':
                    // FIXME do something
                    break;
            }
        } else {
            // HACK FIXME
            var fadeLevel = 0;
            state = simulatorInterface.getNextState(fadeLevel);
            stepWithState();
        }
    }

    function stepWithState() {
        // set up variables for handling interactivity
        if (state.hasOwnProperty("askForResponse")) {
            throw new Error("unimplemented, I don't know how to wait for responses yet!");
        }

        console.log(state);

        // update the UI
        addPrompt();
        // FIXME
        //addVaraibleBank();
        //addHighlighting();
    }

    // Extracts prompt from state and creates HTML
    function addPrompt() {
        if (state.hasOwnProperty("prompt")) {
            var prompt =  state.prompt;
            d3.select("#prompt").node().innerHTML = prompt;

            // check if we need to add "yes" and "no" radio buttons to the prompt
            if (state.hasOwnProperty("askForResponse") && state.askForResponse === "conditional") {
                var yesNoButtonDiv = d3.select("#prompt")
                    .append("div")
                    .attr("class", "yes_no_buttons")
                    ;

                yesNoButtonDiv
                    .append("input")
                    .attr("type", "radio")
                    .attr("class", "radio")
                    .attr("name", "yes_no_radio")
                    .attr("id", "yes_radio")
                    .attr("value", "yes")
                    ;

                yesNoButtonDiv
                    .append("label")
                    .text("Yes")
                    .attr("for", "yes_radio")
                    .style("padding-right","30px")
                    ;

                yesNoButtonDiv
                    .append("input")
                    .attr("type", "radio")
                    .attr("class", "radio")
                    .attr("name", "yes_no_radio")
                    .attr("value", "no")
                    .attr("id", "no_radio")
                    ;

                yesNoButtonDiv
                    .append("label")
                    .attr("for", "no_radio")
                    .text("No")
                    ;
            }

        }
    }

    function checkSolution() {
        var userSolution = d3.select("#inputBox").node().value;
        var solutionState = simulatorInterface.getFinalState();
        var correctSolution = solutionState.result;

        var correct = false;
        // FIXME totally wrong!
        if (String(userSolution) === String(correctSolution)) {
            correct = true;
        }

        $("#inputBox").on("animationend", function () {$("#inputBox").attr("class", "");});
        if (correct) {
            d3.select("#inputBox").attr("class", "correct");
            if (config.nextProblem) {
                d3.select("#newProblem").classed("hidden", false);
            }
        } else {
            d3.select("#inputBox").attr("class", "incorrect");
        }
    }

    function initialize(problemConfig, simulatorInterface_, initialState, task_logger, fading) {
        logger = task_logger;
        simulatorInterface = simulatorInterface_;

        $("#nextstep").click(step);
        d3.select("#submitButton").on("click", checkSolution);
    }

    return {
        create_initial_state: array_make_initial_state,
        template_url: "array/problemTemplate.html",
        template_id: "array-problem-template",
        initialize: initialize,
        reset: reset
    };

})();

// Register this problem type with the csed global.
(function(csed) {
    csed.array = array;
}) (csed);
