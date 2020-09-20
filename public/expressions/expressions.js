/*
 @authors Arnavi Chheda
 Ashley Donaldson
 Cat Johnson
 Solai Ramanathan
 Eleanor O'Rourke
 Whitaker Brand

 This JS file handles all interactivity and stepping through of expressions problems.

 Exports a variable named expressions, and also installs that variable into the
 'csed' global at csed.expressions
 */
var expressions = (function() {
    // the object that's used to communicate with the simulator
    var callback;

    // the current state object
    var state;

    // whether or not this is the first time the user is clicking the "step" button
    var firstStep = true;

    // current fading level. this is instantiated in the initialize function
    var fadeLevel;

    // boolean indiciating whether the UI is waiting for a response from the user
    var waitingForResponse;

    // if the UI is waiting for a response, this string holds the type of response
    // it's waiting for
    var responseType;

    // the number of times the user has tried to answer this question. limit 3
    var numTries;

    // the length of the expression calculation result, so we can make the
    // text box the right size (hacky)
    var resultSize;

    var logger;

    var config;

    // Callback function for navigation javascript -- called before problem load.
    var reset = function() {
        firstStep = true;
        state = {};
    };

    // Callback function for navigation javascript. Installs a problem into the page
    var initialize = function(problemConfig, callbackObject, initial_state, task_logger, fading) {
        config = problemConfig;
        callback = callbackObject;
        state = initial_state;
        fadeLevel = fading;
        waitingForResponse = false;
        numTries = 0;
        // hold onto the task logger for logging UI event
        logger = task_logger;

        var expressionHeader = document.getElementById("expressionHeader");
        var expression = state.problemLines[0];
        var expresionHeaderString = "<span style='font-weight: bold;'>Problem: </span>";
        expresionHeaderString += buildExpressionString(expression, {standard:[], paren:[]}, false, false);
        expresionHeaderString += "<span style='font-weight: bold; padding-left: 30px;'>Solution: </span>";
        expressionHeader.innerHTML = expresionHeaderString + expressionHeader.innerHTML;

        //if users attempt to check a submitted answer
        d3.select("#submitButton").on("click", checkSolution);

        d3.select("#newProblem").on("click", function () {csed.loadProblem(problemConfig.nextProblem)});

        //if users attempt to step through the breakdown of the problem
        d3.select("#nextstep").on("click", step);

        // remove existing keydown handler to avoid duplicate calls to step
        $(document).off("keydown");
        // call step when you press the "enter" key
        $(document).keydown(function(e) {
            if (e.keyCode == 13) {
                e.preventDefault(); // stop enter from also clicking next button (if button has focus)
                step();
                return false; // stop enter from also clicking next button (if button has focus)
            }
        });

        // log the level of fading for this problem
        Logging.log_task_event(logger, {
            type: Logging.ID.FadeLevel,
            detail: {fadeLevel:fadeLevel},
        });
    };

    function step() {
        //console.log("step");
        // log that the "next" button was clicked
        Logging.log_task_event(logger, {
            type: Logging.ID.NextButton,
            detail: {},
        });

        if (waitingForResponse) {
            var responseValue;
            if (responseType === "enter") {
                responseValue = d3.select("#answer").property("value");
                if (responseValue === "") {
                    d3.select("#errorMessage").style("visibility", "visible");
                }
                else {
                    d3.select("#errorMessage").style("visibility", "hidden");
                    checkAnswer(responseType, responseValue);
                }

            }
            else if (responseType === "question") {
                if (d3.select('input[name="yes_no_radio"]:checked').node() === null) {
                    d3.select("#errorMessage").style("visibility", "visible");
                }
                else {
                    d3.select("#errorMessage").style("visibility", "hidden");
                    responseValue = d3.select('input[name="yes_no_radio"]:checked').node().value;
                    checkAnswer(responseType, responseValue);
                }
            }
            else if (responseType === "click") {
                d3.select("#errorMessage").style("visibility", "visible");
            }
        }
        else {
            stepNextState();
        }
    }

    function stepNextState() {
        state = callback.getNextState(fadeLevel);

        var stepHolder;
        if (firstStep) {
            document.getElementById("nextstep").innerHTML = "Next";

            stepHolder = document.createElement("div");
            stepHolder.setAttribute("id", "steps");
            document.getElementById("stepshell").appendChild(stepHolder);

            firstStep = false;
        }
        else {
            stepHolder = document.getElementById("steps");
            stepHolder.innerHTML = "";
        }

        addStepHTML();
    }

    function stepWithState() {
        var stepHolder = document.getElementById("steps");
        stepHolder.innerHTML = "";
        document.getElementById("nextstep").style.visibility = "visible";
        addStepHTML();
    }

    function addStepHTML() {
        var highlighting = getCurrentHighlighting();
        for (var i = 0; i < state.state.problemLines.length; i++) {
            var expression = state.state.problemLines[i];

            var lineHTML = document.createElement("div");
            lineHTML.setAttribute("id", "firststep");
            lineHTML.classList.add("expressionStatement");

            // display the prompt text next to the last line
            if (i === state.state.problemLines.length - 1) {
                var promptHTML = document.createElement("p");
                promptHTML.classList.add("step");
                promptHTML.innerHTML = formatPrompt(state.prompt);
                lineHTML.appendChild(promptHTML);
            }

            // HACK to make the next button disappear at the end of the problem
            // also, fill in the solution box after the last step
            var lastLine = state.state.problemLines.length - 1;
            if (state.prompt.indexOf("This is the answer!") !== -1 && i === lastLine) {
                d3.select("#nextstep").style("visibility", "hidden");
                $("#inputBox").val(buildExpressionString(state.state.problemLines[lastLine], highlighting[lastLine], false).trim());
                $("#submitButton").click();
            }

            var expressionHTML = document.createElement("div");
            expressionHTML.classList.add("exp");

            // check if we need to add interactivity to the UI
            if (fadeLevel > 0 && state.hasOwnProperty("askForResponse")) {
                // if we're asking for a click response, only make the last line of the problem click-able
                if (state["askForResponse"] === "click" && i === state.state.problemLines.length -1) {
                    // make the expression string click-able
                    expressionHTML.innerHTML = buildExpressionString(expression, highlighting[i], true);
                    lineHTML.appendChild(expressionHTML);
                    document.getElementById("steps").appendChild(lineHTML);
                    waitingForResponse = true;
                    responseType = "click";
                    addExpressionOnClickListeners(expression);
                }
                else if (state["askForResponse"] === "enter") {
                    // add an input to allow the user to enter a calculation result
                    expressionHTML.innerHTML = buildExpressionString(expression, highlighting[i], false);
                    lineHTML.appendChild(expressionHTML);
                    document.getElementById("steps").appendChild(lineHTML);
                    waitingForResponse = true;
                    responseType = "enter";
                }
                else if (state["askForResponse"] === "question") {
                    // add yes/no radio buttons to the prompt so the user can answer the question
                    expressionHTML.innerHTML = buildExpressionString(expression, highlighting[i], false);
                    lineHTML.appendChild(expressionHTML);
                    document.getElementById("steps").appendChild(lineHTML);
                    waitingForResponse = true;
                    responseType = "question";
                    addResponseButtonsToPrompt();

                }
                else {
                    expressionHTML.innerHTML = buildExpressionString(expression, highlighting[i], false);
                    lineHTML.appendChild(expressionHTML);
                    document.getElementById("steps").appendChild(lineHTML);
                }
            }
            else {
                expressionHTML.innerHTML = buildExpressionString(expression, highlighting[i], false);
                lineHTML.appendChild(expressionHTML);
                document.getElementById("steps").appendChild(lineHTML);
            }
        }
    }

    // make the prompt text lay out nicely.
    function formatPrompt(promptText) {
        var brIndex = promptText.lastIndexOf("<br>");
        if (brIndex > 0) {
            var firstPart = promptText.substring(0, brIndex + 4);
            var secondPart = promptText.substring(brIndex + 4);
        }
        else {
            firstPart = "";
            secondPart = promptText;
        }

        if (secondPart.length > 50 && secondPart.length < 80) {
            var index = secondPart.indexOf(" ", 25);
            secondPart = secondPart.substring(0,index) + "<br>" + secondPart.substring(index+1);
        }

        promptText = firstPart + secondPart;
        return promptText;
    }

    // look at the current variables in scope to determine which rows and cells should be highlighted
    function getCurrentHighlighting() {
        var highlighting = [{standard:[], paren:[]}]; // HACK hideous workaround to get highlighting applied inside parens
        for (var i = 0; i < state.state.problemLines.length; i++) {
            highlighting.push({standard:[], paren:[]});
        }

        for (var variable in state.variables.in_scope) {
            var varObject = state.variables.in_scope[variable];
            if (varObject.hasOwnProperty("value")) {
                var objectToVisualize = varObject["value"];

                if (objectToVisualize.hasOwnProperty("type")) {
                    if (objectToVisualize.type == "lineCell") {
                        if (objectToVisualize.isParen) {
                            highlighting[objectToVisualize.line].paren.push({parenCell:objectToVisualize.parenCell, cell:objectToVisualize.cell});
                        } else {
                            highlighting[objectToVisualize.line].standard.push(objectToVisualize.cell);
                        }
                    } else if (objectToVisualize.type == "result") {
                        if (fadeLevel > 0) {
                            resultSize = String(objectToVisualize.value).length + 2;
                            if (objectToVisualize.isParen) {
                                highlighting[objectToVisualize.line].paren.push({parenCell:objectToVisualize.parenCell, cell:"result_" + objectToVisualize.cell});
                            } else {
                                highlighting[objectToVisualize.line].standard.push("result_" + objectToVisualize.cell);
                            }
                        }
                        else {
                            if (objectToVisualize.isParen) {
                                highlighting[objectToVisualize.line].paren.push({parenCell:objectToVisualize.parenCell, cell:objectToVisualize.cell});
                            } else {
                                highlighting[objectToVisualize.line].standard.push(objectToVisualize.cell);
                            }
                        }
                    } else {
                        console.error("Unsupported variable type: " + objectToVisualize.type);
                    }
                }
            }
        }

        return highlighting;
    }

    // create the expression HTML from the array of objects
    function buildExpressionString(expression, highlighting, makeClickable) {
        var expressionString = "";
        for (var i = 0; i < expression.length; i++) {
            var value = getExpressionValue(expression[i]);
            if (expression[i].type === "paren_expr") {
                if (highlighting.paren.some(function (e) {
                        return e.parenCell === i;
                    })) {
                    expressionString += "(";
                    for (var j = 0; j < expression[i].value.length; j++) {
                        if (highlighting.paren.some(function (e) {
                                return e.cell === j;
                            })) {
                            expressionString += getHighlightedHTML(getExpressionValue(expression[i].value[j]), i + "_" + j, false);
                        } else if (highlighting.paren.some(function (e) {
                                return e.cell === "result_" + j;
                            })) {
                            expressionString += "<input type=text id=answer size=" + resultSize + "/> ";
                        } else if (makeClickable) {
                            expressionString += getHighlightedHTML(getExpressionValue(expression[i].value[j]), i + "_" + j, true);
                        } else {
                            expressionString += getExpressionValue(expression[i].value[j]) + " ";
                        }
                    }
                    expressionString = expressionString.trim(); // get rid of trailing space before )
                    expressionString += ") ";
                } else if (makeClickable) {
                    expressionString += "(";
                    for (var j = 0; j < expression[i].value.length; j++) {
                        expressionString += getHighlightedHTML(getExpressionValue(expression[i].value[j]), i + "_" + j, true);
                    }
                    expressionString = expressionString.trim(); // get rid of trailing space before )
                    expressionString += ") ";
                } else {
                    expressionString += value + " ";
                }
            } else {
                if (highlighting.standard.length > 0 && highlighting.standard.indexOf(i) >= 0) {
                    expressionString += getHighlightedHTML(value, i, false);
                }
                else if (highlighting.standard.indexOf("result_" + i) >= 0) {
                    expressionString += "<input type=text id=answer size=" + resultSize + "/> ";
                }
                else if (makeClickable) {
                    expressionString += getHighlightedHTML(value, i, true);
                }
                else {
                    expressionString += value + " ";
                }
            }
        }
        return expressionString;
    }

    function getHighlightedHTML(value, i, makeClickable) {
        if (makeClickable) {
            if (value === "%" || value === "*" || value === "/" || value === "+" || value === "-") {
                return "<span class='clickableOperand' id='expression_" + i + "'>" + value + "</span> ";
            }
            else {
                return "<span class='clickable' id='expression_" + i + "'>" + value + "</span> ";
            }
        } else {
            if (value === "%" || value === "*" || value === "/" || value === "+" || value === "-") {
                return "<span class='clickedOperand'>" + value + "</span> ";
            }
            else {
                return "<span class='clicked'>" + value + "</span> ";
            }
        }
    }

    // gets the value at a particular index
    // formats it based on int/double/String type
    function getExpressionValue(elem) {
        if (elem.type == 'double' && elem.value % 1 == 0) {
            return elem.value + ".0";
        } else if (elem.type === 'string') {
            return "\"" + elem.value + "\"";
        } else if(elem.type === 'paren_expr') {
            return "(" + elem.value.map(getExpressionValue).join(" ") + ")";
        } else {
            return elem.value;
        }
    }

    // for clickable expression strings, adds the event listeners to ask
    // the simulator if the response was correct or not
    function addExpressionOnClickListeners(expression) {
        for (var i = 0; i < expression.length; i++) {
            if (expression[i].type === "paren_expr") {
                for (var j = 0; j < expression[i].value.length; j++) {
                    d3.select("#expression_" + i + "_" + j).on("click", function () {
                        var id = d3.select(this).attr("id");
                        var index = id.substring(id.indexOf("_") + 1);
                        d3.select("#errorMessage").style("visibility", "hidden");
                        checkAnswer("click", index);
                    });
                }
            } else {
                d3.select("#expression_" + i).on("click", function () {
                    var id = d3.select(this).attr("id");
                    var index = id.substring(id.indexOf("_") + 1);
                    d3.select("#errorMessage").style("visibility", "hidden");
                    checkAnswer("click", index);
                });
            }
        }
    }

    // adds "yes" and "no" buttons to the prompt text so the user can answer
    // the question.
    function addResponseButtonsToPrompt() {
        var yesNoButtonDiv = d3.select(".step")
            .append("div")
            .attr("class", "yes_no_buttons");

        yesNoButtonDiv
            .append("input")
            .attr("type", "radio")
            .attr("class", "radio")
            .attr("name", "yes_no_radio")
            .attr("value", "yes")
            .attr("id", "yes_radio")
        ;

        yesNoButtonDiv
            .append("label")
            .text("Yes")
            .attr("for", "yes_radio")
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
            .text("No")
            .attr("for", "no_radio")
        ;
    }

    // asks the simulator for the statement response object and determines whether
    // or not the user's answer is correct. asks the simulator for a state to respond
    // to the user's answer, and calls stepWithState to display the response state.
    function checkAnswer(type, value) {
        numTries = numTries + 1;
        var statementResponseObject = callback.getCorrectAnswer();
        var correct = false;
        var correctAnswer;

        if (type === "click") {
            correctAnswer = statementResponseObject.rhs["cell"];
            if (statementResponseObject.rhs.isParen) {
                // value will be "i_j" where i is the index of paren_expr and j is the index of the term within paren_expr
                correct = statementResponseObject.rhs.parenCell === parseInt(value.split("_")[0]) &&
                    statementResponseObject.rhs.cell === parseInt(value.split("_")[1])
            } else {
                correct = statementResponseObject.rhs["cell"] === parseInt(value);
            }
        }
        else if (type === "enter") {
            correctAnswer = statementResponseObject.rhs.value;
            if (statementResponseObject.rhs.valueType === "string") {
                correctAnswer = '"' + correctAnswer + '"';
            }
            correct = String(correctAnswer) === String(value);
        }
        else if (type === "question") {
            if (statementResponseObject.result == true) {
                correctAnswer = "yes";
            }
            else if (statementResponseObject.result == false) {
                correctAnswer = "no";
            }

            correct = correctAnswer === value;
        }

        // Get the response based on whether or not the answer was
        // correct, and display the response
        state = callback.respondToAnswer(correct);

        // log information about this question answer attempt
        Logging.log_task_event(logger, {
            type: Logging.ID.QuestionAnswer,
            detail: {
                type: type,
                correctAnswer: correctAnswer,
                userAnswer: value,
                correct: correct
            },
        });

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

            // HUGE HACK to handle removing the input if the user entered the correct answer
            // need to find a better solution
            if (type === "enter") {
                //console.log("state");
                //console.log(state);

                for (var variable in state.variables.in_scope) {
                    var varObject = state.variables.in_scope[variable];
                    if (varObject.hasOwnProperty("value")) {
                        var objectToVisualize = varObject["value"];
                        if (objectToVisualize.hasOwnProperty("type")) {
                            if (objectToVisualize.type === "result") {
                                objectToVisualize.type = "lineCell";
                            }
                        }
                    }
                }
            }
        }

        stepWithState();
    }

    // checks the solution entered into the solution box against the correct solution
    function checkSolution() {
        var userSolution = d3.select("#inputBox").node().value;
        var solutionState = callback.getFinalState();
        var lastLine = solutionState.state.problemLines.length - 1;
        var solutionValue = solutionState.state.problemLines[lastLine][0].value;
        var solutionType = solutionState.state.problemLines[lastLine][0].type;

        var correct = false;
        if (solutionType === "int") {
            if (parseInt(userSolution) === parseInt(solutionValue)) {
                correct = true;
            }
        }
        else if (solutionType === "double") {
            if (solutionValue % 1 === 0) {
                solutionValue = solutionValue.toFixed(1);
            }
            if (String(solutionValue) === String(userSolution)) {
                correct = true;
            }
        }
        else if (solutionType === "string") {
            solutionValue = '"' + solutionValue + '"';
            if (String(solutionValue) === String(userSolution)) {
                correct = true;
            }
        } else if (solutionType === "boolean") {
            if (String(solutionValue) === String(userSolution)) {
                correct = true;
            }
        }

        $("#inputBox").on("animationend", function () {$("#inputBox").attr("class", "");});
        if (correct) {
            d3.select("#inputBox").attr("class", "correct");
            d3.select("#correctHeader").classed("hidden", false);
            d3.select("#incorrectHeader").classed("hidden", true);
            if (config.nextProblem) {
                d3.select("#newProblem").classed("hidden", false);
            }
        }
        else {
            d3.select("#incorrectHeader").classed("hidden", false);
            d3.select("#correctHeader").classed("hidden", true);
            d3.select("#inputBox").attr("class", "incorrect");
        }

        // log the "check" button click, along with the answer correctness
        Logging.log_task_event(logger, {
            type: Logging.ID.CheckSolutionButton,
            detail: {correct:correct},
        });
    }

    return {
        create_initial_state: expressions_make_initial_state,
        template_url: "expressions/problemTemplate.html",
        "template_id": "expressions-problem-template",
        initialize: initialize,
        reset: reset
    };

}) ();

// Register this problem type with the csed global.
(function(csed) {
    csed.expressions = expressions;
}) (csed);
