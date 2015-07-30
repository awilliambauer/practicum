
var array = (function() {
    "use strict";

    var logger;
    var simulatorInterface;
    var config;
    var state;
    var fadeLevel;
    var waitingForResponse;
    var responseType;
    var numTries;

    function reset() {
        // TODO unimplemented
    }

    function initialize(problemConfig, simulatorInterface_, initialState, task_logger, fading) {

        // add problem AST
        $("#problem_space > pre").html(on_convert(initialState.ast, 0));

        logger = task_logger;
        simulatorInterface = simulatorInterface_;

        config = problemConfig;
        state = initialState;
        waitingForResponse = false;
        responseType = "";
        numTries = 0;

        // hold onto the task logger for logging UI event
        logger = task_logger;

        //fadeLevel = fading;
        fadeLevel = 0;

        // move to the next step if they hit enter or click next
        $("#nextstep").click(step);
        $(document).off("keydown");
        $(document).keydown(function(e) {
            if (e.keyCode === 13) {
                e.preventDefault(); // stop enter from also clicking next button (if button has focus)
                step();
                return false; // stop enter from also clicking next button (if button has focus)
            }
        });

        d3.select("#submitButton").on("click", checkSolution);

        console.log(state);
    }

    function step() {
        // FIXME
        if (waitingForResponse) {
            throw new Error("unimplemented!");

            numTries = numTries + 1;
            switch (responseType) {
                case 'add_variable':
                    // FIXME do something
                    break;
            }
        } else {
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
        addVaraibleBank();
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

    function addVaraibleBank() {
        // clear the variable bank so we can re-draw it
        d3.select("#variable_list").node().innerHTML = "";

        // add all of the currently defined variables to the variable bank
        for (var variable in state.state.vars) {

            console.log(state.state.vars[variable]);

            if (state.state.vars[variable].hasOwnProperty("type") && state.state.vars[variable].type == "array") {
                var listItem = d3.select("#variable_list").append("li").attr("class", "variable_list_item");
                var listTable = listItem.append("table").attr("class", "variable_list_table");
                var listRow = listTable.append("tr");

                var listCell1 = listRow.append("td").attr("class", "bank_variable_label");
                listCell1.append("span").attr("class", "bank_variable").text("arr");
                listCell1.append("span").text(" :");

                var listCell2 = listRow.append("td");
                var arrayTable = listCell2.append("table").attr("class", "bank_variable_array");

                var indexRow = arrayTable.append("tr");
                var index = 0;
                for (var arrayIndex in state.state.vars[variable].value) {
                    indexRow
                        .append("td")
                        .attr("class", "bank_variable_array_index")
                        .text(index)
                    ;
                    index++;
                }

                var valueRow = arrayTable.append("tr");
                for (var arrayIndex in state.state.vars[variable].value) {
                    valueRow
                        .append("td")
                        .attr("class", "bank_variable_array_value")
                        .text(state.state.vars[variable].value[arrayIndex].value)
                    ;
                }
            }
            else {
                var listItem = d3.select("#variable_list")
                        .append("li")
                        .attr("class", "variable_list_item")
                    ;

                listItem
                    .append("span")
                    .attr("class", "bank_variable")
                    .text(variable)
                ;

                listItem
                    .append("span")
                    .text(" :")
                ;

                listItem
                    .append("span")
                    .attr("class", "bank_variable_value")
                    .text(state.state.vars[variable])
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
