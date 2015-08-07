var if_else = (function() {
    "use strict";

    var AST;
    var state;
    var callback;
    var AST_INSTALLED_INTO_DOM = false;
    var fadeLevel;
    var waitingForResponse;
    var responseType;
    var numTries;
    var logger;
    var needToReset;
    var config;

    // This function is called when the main page wants
    // to load a new problem.
    function reset() {
        AST_INSTALLED_INTO_DOM = false;

        // HACK, ugly. This global in html_generator needs to get
        // reset to one when loading a new problem.
        LINENUM = 1;
    }

    var OLD_if_else_make_initial_state = function (problemConfig, altState) {
        var state = problemConfig.initialState;
        state.AST = java_parsing.parse_method(state.problemText);
        problemConfig.alternateStartingStates.forEach(function(x) {
            x.AST = java_parsing.parse_method(x.problemText);
        });
        if (altState) {
            state = altState;
        }
        createStartingStatesDropdown(problemConfig, state);
        return state;
    };

    function createStartingStatesDropdown(problemConfig, state) {
        // fill in dropdowns in nav
        d3.selectAll("#methodCallDropdown")
            .selectAll("li")
            .data(problemConfig.content.variants)
            .enter()
            .append("li")
            .append("a")
            .attr("class", "monospace")
            .text(function(s) { return state.AST.name + "(" + getArgString(s.arguments) + ")"; })
            .on("click", function(s) {
                if (s !== state.variant) {
                    csed.loadProblem(problemConfig, s);
                }
            })
        ;

        d3.select("#methodCall")
            .text(function() { return state.AST.name + "(" + getArgString(state.initialization) + ")"} )
        ;
    }

    // fills in the problem space with the text of the specific problem we're working on,
    // we will just have to replace "example.txt" with whatever file they store the problem
    // text in
    // fills in the problem space with the text of the specific problem we're working on,
    // we will just have to replace "example.txt" with whatever file they store the problem
    // text in
    function initialize(problemConfig, callbackObject, initialState, task_logger, fading) {
        if (!AST_INSTALLED_INTO_DOM) {
            AST = initialState.AST;
            $("#problem_space > pre").html(on_convert(AST));
            AST_INSTALLED_INTO_DOM = true;
        }
        config = problemConfig;
        state = initialState;
        callback = callbackObject;
        waitingForResponse = false;
        responseType = "";
        numTries = 0;

        // hold onto the task logger for logging UI event
        logger = task_logger;

        fadeLevel = fading;

        // log the level of fading for this problem
        Logging.log_task_event(logger, {
            type: Logging.ID.FadeLevel,
            detail: {fadeLevel:fadeLevel},
        });

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

        //if users attempt to check a submitted answer
        d3.select("#submitButton").on("click", checkSolution);

        d3.select("#newProblem").on("click", function () {csed.loadProblem(problemConfig.nextProblem)});

        if (needToReset) {
            resetUI();
            needToReset = false;
        }

        createStartingStatesDropdown(problemConfig, state);
    }

    // gets the initial values that the method will be called with
    function getArgString(args) {
        var callVals = [];
        for (var variable in args) {
            callVals.push(args[variable]);
        }
        return callVals;
    }

    function step() {
        // log that the "next" button was clicked
        Logging.log_task_event(logger, {
            type: Logging.ID.NextButton,
            detail: {},
        });

        if (waitingForResponse) {
            numTries = numTries + 1;
            if (responseType === "add_variable" || responseType === "update_variable") {
                checkVariableBankAnswer();
            }
            else if (responseType === "next_line") {
                checkNextLineClickAnswer();
            }
            else if (responseType === "cross_out") {
                checkCrossOutAnswer();
            }
            else if (responseType === "conditional") {
                checkConditionalAnswer();
            }
        }
        else {
            state = callback.getNextState(fadeLevel);
            stepWithState();
        }
    }

    function stepWithState() {
        // set up variables for handling interactivity
        if (fadeLevel > 0 && state.hasOwnProperty("askForResponse")) {
            waitingForResponse = true;
            responseType = state.askForResponse;
        }

        // update the UI
        addPrompt();
        addVaraibleBank();
        addHighlighting();
    }

    // remove all highlighting from the UI if the user switches method calls
    function resetUI() {
        d3.select("#promptText").node().innerHTML = "Press Enter or click Next to start!";
        d3.select("#variable_list").node().innerHTML = "";
        d3.selectAll(".block_highlight").each(function() {
            d3.select(this).classed("block_highlight", false);
        });
        d3.selectAll(".highlight").each(function() {
            d3.select(this).classed("highlight", false);
        });
        d3.selectAll(".grey_out").each(function() {
            d3.select(this).classed("grey_out", false);
        });
        d3.selectAll(".cross_out").each(function() {
            d3.select(this).classed("cross_out", false);
        });
    }

    // Extracts prompt from state and creates HTML
    function addPrompt() {
        if(state.hasOwnProperty("prompt")) {
            var prompt =  state.prompt;
            d3.select("#promptText").node().innerHTML = prompt;

            // check if we need to add "yes" and "no" radio buttons to the prompt
            if (fadeLevel > 0 && state.hasOwnProperty("askForResponse") && state.askForResponse === "conditional") {
                var yesNoButtonDiv = d3.select("#promptText")
                    .append("div")
                    .attr("class", "yes_no_buttons");

                yesNoButtonDiv
                    .append("input")
                    .attr("type", "radio")
                    .attr("class", "radio")
                    .attr("name", "yes_no_radio")
                    .attr("id", "yes_radio")
                    .attr("value", "yes");

                yesNoButtonDiv
                    .append("label")
                    .text("Yes")
                    .attr("for", "yes_radio")
                    .style("padding-right","30px");

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
                    .text("No");
            }

        }
    }

    function addVaraibleBank() {
        // clear the variable bank so we can re-draw it
        d3.select("#variable_list").node().innerHTML = "";

        // add all of the currently defined variables to the variable bank
        for (var variable in state.state.vars) {

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

    function addHighlighting() {
        for (var variable in state.variables.in_scope) {
            var varObject = state.variables.in_scope[variable];

            if (varObject.hasOwnProperty("value")) {
                var objectToVisualize = varObject["value"];

                if (objectToVisualize.hasOwnProperty("type")) {
                    if (objectToVisualize.type === "codeBlock") {
                        highlightCodeBlocks(objectToVisualize.blockIds);
                    }
                }
                else if (varObject.hasOwnProperty("type")) {
                    if (varObject.type === "arguments") {
                        highlightArguments();
                    }
                    else if (varObject.type === "variableBank") {
                        if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") && state.askForResponse === "add_variable") {

                            interactiveVariableBank(varObject.value, true);
                        }
                        else if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") && state.askForResponse === "update_variable") {

                            interactiveVariableBank(varObject.value, false);
                        }
                        else {
                            highlightVariableBank(varObject.value);
                        }
                    }
                    else if (varObject.type === "codeLine") {
                        if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") && state.askForResponse === "next_line") {

                            interactiveGrayOutPreviousLines();
                            interactiveLines();
                        }
                        else {
                            grayOutPreviousLines(varObject.value);
                            highlightLine(varObject.value);
                        }
                    }
                    else if (varObject.type === "crossedOutLines") {
                        if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") && state.askForResponse === "cross_out") {

                            interactiveCrossOutLines();
                        }
                        else {
                            crossOutLines(varObject.value);
                        }
                    }
                }
            }
        }
    }

    function highlightCodeBlocks(blockIds) {
        for (var i = 0; i < blockIds.length; i++) {
            var idString = "#java-ast-" + blockIds[i];
            d3.select(idString).attr("class", "block_highlight");
        }
    }

    function highlightArguments() {
        var argumentText = d3.select("#methodCall").node().innerHTML;
        var openParenIndex = argumentText.indexOf("(");
        argumentText = argumentText.substring(0,openParenIndex+1) + "<span class='highlight'>" + argumentText.substring(openParenIndex+1);
        var closeParenIndex = argumentText.indexOf(")");
        argumentText = argumentText.substring(0,closeParenIndex) + "</span>" + argumentText.substring(closeParenIndex);
        d3.select("#methodCall").node().innerHTML = argumentText;
    }

    // highlights the variables passed in to this function in the variable bank
    function highlightVariableBank(variables) {
        d3.selectAll(".variable_list_item").each(function(d,i) {
            var varName = d3.select(this).select(".bank_variable").node().innerHTML;
            for (var key in variables) {
                if (varName === key) {
                    d3.select(this)
                        .select(".bank_variable_value")
                        .attr("class","bank_variable_value just_updated_value")
                    ;
                }
            }
        });
    }

    // adds input boxes to the variable bank so the user can add new variables
    function interactiveVariableBank(variables, newVariable) {
        d3.selectAll(".variable_list_item").each(function(d,i) {
            var varName = d3.select(this).select(".bank_variable").node().innerHTML;
            for (var key in variables) {
                if (varName === key) {
                    // store the current value
                    var currentValue = d3.select(this)
                        .select(".bank_variable_value")
                        .node()
                        .innerHTML
                    ;

                    // remove the current value
                    d3.select(this)
                        .select(".bank_variable_value")
                        .node()
                        .innerHTML = ""
                    ;

                    // add an input box for the value
                    var inputField = d3.select(this)
                        .select(".bank_variable_value")
                        .append("input")
                        .attr("class", "varValue")
                    ;

                    // show the current value in the input box
                    if (!newVariable) {
                        inputField .property("value", currentValue);
                    }
                }
            }
        });
    }

    // grays out the lines that we have already passed
    function grayOutPreviousLines(lineNum) {
        for (var line = 1; line < lineNum; line++) {
            var list = document.getElementsByClassName(String(line))[0]; // Gets li element to highlight
            $("." + line).addClass("grey_out");
            $("." + line + " *").removeAttr("style");
        }
    }

    // grays out the lines that we had already passed before the beginning of this interactive step
    function interactiveGrayOutPreviousLines() {
        var previousLineToExecute = d3.select("li.highlight");

        for (var line = 1; line < previousLineToExecute; line++) {
            var list = document.getElementsByClassName(String(line))[0]; // Gets li element to highlight
            $("." + line).addClass("grey_out");
            $("." + line + " *").removeAttr("style");
        }
    }

    // highlights the line of code passed in as a parameter
    function highlightLine(lineNum) {
        $("#problem_space li").removeClass("highlight");
        $("." + lineNum).addClass("highlight");
    }

    // makes all the lines clickable so that the user can select the next line
    function interactiveLines() {
        // remove previous line highlighting
        d3.select("li.highlight").classed("highlight", false);

        // make all lines clickable
        d3.select("#problem_space").selectAll("li").each(function () {
            var currentClassList = d3.select(this).attr("class");
            var newClassList = currentClassList + " clickable";
            d3.select(this)
                .attr("class", newClassList)
                .on("click", function() {
                    // highlight this line
                    d3.select(this).classed("highlight", true);
                    // remove "clickable" class from all lines
                    d3.selectAll(".clickable").each(function() {
                        d3.select(this)
                            .classed("clickable", false)
                            .on("click", null)
                        ;
                    });
                    // call step to respond to the user answer
                    step();
                })
            ;
        });
    }

    // crosses out all the lines in the object passed in as a parameter
    function crossOutLines(lineNums) {
        d3.selectAll(".cross_out").each(function() {
            d3.select(this).classed("cross_out", false);
        });

        for (var lineNum in lineNums) {
            var list = document.getElementsByClassName(lineNum)[0];
            $(list).addClass("cross_out");
        }
    }

    // makes all the lines clickable (with cross-out styling) so that the user can cross out lines
    function interactiveCrossOutLines() {
        // make all lines cross-out-able
        d3.select("#problem_space").selectAll("li").each(function () {
            var currentClassList = d3.select(this).attr("class");
            var newClassList = currentClassList + " cross_out_able";
            d3.select(this)
                .attr("class", newClassList)
                .on("click", function() {
                    if($(this).hasClass("cross_out")) {
                        // un-higlight this line
                        d3.select(this).classed("cross_out", false);
                    }
                    else {
                        // highlight this line
                        d3.select(this).classed("cross_out", true);
                    }
                })
            ;
        });
    }

    // checks that the answer(s) the user entered into the variable bank are correct
    function checkVariableBankAnswer() {
        var correctAnswerObject = callback.getCorrectAnswer();
        var allCorrectVariables = correctAnswerObject.rhs;
        var correctVariables = {}; // for logging
        var userVariables = {}; // for logging
        var correctArray = [];

        d3.selectAll(".variable_list_item").each(function(d,i) {
            // only want to check the variables that currently have inputs (interactive)
            var input = d3.select(this).select(".bank_variable_value").select(".varValue");
            if (input.node() !== null) {
                var varName = d3.select(this).select(".bank_variable").node().innerHTML;
                var userValue = input.property("value");
                for (var key in allCorrectVariables) {
                    if (varName === key) {
                        correctVariables[key] = parseInt(allCorrectVariables[key]);
                        userVariables[key] = parseInt(userValue);
                        if (parseInt(userValue) === parseInt(allCorrectVariables[key])) {
                            correctArray.push(true);
                        }
                        else {
                            correctArray.push(false);
                        }
                    }
                }
            }

        });

        var correct = true;
        for (var i = 0; i < correctArray.length; i++) {
            if (!correctArray[i]) {
                correct = false;
            }
        }

        // log information about this question answer attempt
        Logging.log_task_event(logger, {
            type: Logging.ID.QuestionAnswer,
            detail: {
                type: "variable_bank",
                correctAnswer: correctVariables,
                userAnswer: userVariables,
                correct: correct
            },
        });

        respondToAnswer(correct, "variable_bank", correctVariables);
    }

    function checkNextLineClickAnswer() {
        var correctAnswerObject = callback.getCorrectAnswer();
        var correctLine = correctAnswerObject.rhs;
        var userLine;
        var correct = false;

        var highlightedLine = d3.select("li.highlight");
        if (highlightedLine.node() !== null) {
            var classList = highlightedLine.attr("class");
            classList = classList.replace("highlight", "");
            classList = classList.replace(/ /g,'');
            userLine = parseInt(classList);

            if (userLine === correctLine) {
                correct = true;
            }
        }

        // log information about this question answer attempt
        Logging.log_task_event(logger, {
            type: Logging.ID.QuestionAnswer,
            detail: {
                type: "next_line",
                correctAnswer: correctLine,
                userAnswer: userLine,
                correct: correct
            },
        });

        respondToAnswer(correct, "next_line", correctLine);
    }

    function checkCrossOutAnswer() {
        var correctAnswerObject = callback.getCorrectAnswer();
        var correctCrossOuts = correctAnswerObject.rhs;

        // use object as set, all values are placeholder
        var userCrossOuts = {};
        d3.selectAll("li.cross_out").each(function() {
            var classList = d3.select(this).attr("class");
            classList = classList.replace("cross_out_able", "");
            classList = classList.replace("cross_out", "");
            classList = classList.replace(/ /g,'');
            userCrossOuts[parseInt(classList)] = 1;
        });

        var correct = false;
        if (JSON.stringify(userCrossOuts) === JSON.stringify(correctCrossOuts)) {
            correct = true;
        }

        // mare the lines un-cross-out-able
        if (correct || numTries === 3) {
            d3.selectAll(".cross_out_able").each(function() {
                d3.select(this)
                    .classed("cross_out_able", false)
                    .on("click", null)
                ;
            });
        }

        // log information about this question answer attempt
        Logging.log_task_event(logger, {
            type: Logging.ID.QuestionAnswer,
            detail: {
                type: "cross_out",
                correctAnswer: correctCrossOuts,
                userAnswer: userCrossOuts,
                correct: correct
            },
        });

        respondToAnswer(correct, "cross_out", correctCrossOuts);
    }

    function checkConditionalAnswer() {
        var correctAnswerObject = callback.getCorrectAnswer();

        if (d3.select('input[name="yes_no_radio"]:checked').node() === null) {
            if (d3.select("#errorMessage").node() === null) {
                var errorMessage = "<span id='errorMessage' style='color: red;'>Try entering an answer first!<br></span>";
                d3.select("#prompt").node().innerHTML = errorMessage + d3.select("#prompt").node().innerHTML;
            }
        }
        else {
            if (d3.select("#errorMessage").node() !== null) {
                d3.select("#errorMessage").remove();
            }

            var userAnswer = d3.select('input[name="yes_no_radio"]:checked').node().value;

            var correctAnswer = "no";
            if (correctAnswerObject.result) {
                correctAnswer = "yes";
            }

            var correct = false;
            if (correctAnswer === userAnswer) {
                correct = true;
            }

            // log information about this question answer attempt
            Logging.log_task_event(logger, {
                type: Logging.ID.QuestionAnswer,
                detail: {
                    type: "conditional",
                    correctAnswer: correctAnswer,
                    userAnswer: userAnswer,
                    correct: correct
                },
            });

            respondToAnswer(correct, "conditional", correctAnswer);
        }
    }

    function respondToAnswer(correct, type, correctAnswer) {
        if (!correct && numTries === 3) {
            // log that the user received a bottom-out hint
            Logging.log_task_event(logger, {
                type: Logging.ID.BottomOutHint,
                detail: {
                    type: type,
                    correctAnswer: correctAnswer
                },
            });
        }

        if (correct || numTries === 3) {
            waitingForResponse = false;
            responseType = "";
            numTries = 0;
        }

        // Get the response based on whether or not the answer was
        // correct, and display the response
        state = callback.respondToAnswer(correct);
        stepWithState();
    }

    // checks the solution entered into the solution box against the correct solution
    function checkSolution() {
        var userSolution = d3.select("#inputBox").node().value;
        var solutionState = callback.getFinalState();
        var correctSolution = solutionState.variables.in_scope.theProblemSolutionIsTheTextThatThisPrintlnStatementPrintsOut.value;

        var correct = false;
        if (String(userSolution) === String(correctSolution)) {
            correct = true;
        }

        $("#inputBox").on("animationend", function () {$("#inputBox").attr("class", "");});
        if (correct) {
            d3.select("#inputBox").attr("class", "correct");
            if (config.nextProblem) {
                d3.select("#newProblem").classed("hidden", false);
            }
        }
        else {
            d3.select("#inputBox").attr("class", "incorrect");
        }

        // log the "check" button click, along with the answer correctness
        Logging.log_task_event(logger, {
            type: Logging.ID.CheckSolutionButton,
            detail: {correct:correct},
        });
    }

    return {
        "create_initial_state": if_else_make_initial_state,
        "template_url": "if_else/if_else_problem_template.html",
        "template_id": "if_else-problem-template",
        "reset":  reset,
        "initialize": initialize
    };

})();

(function(csed) {
    csed.if_else = if_else;
}) (csed);

