
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

        // update the UI
        addPrompt();
        addVaraibleBank();
        addHighlighting();
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
        d3.select("#variable_list_table").node().innerHTML = "";

        // grab the variable bank object out fo the in_scope variable list
        var variableBankObject;
        for (var v in state.variables.in_scope) {
            if (state.variables.in_scope[v].hasOwnProperty("type") && state.variables.in_scope[v].type == "VariableBank") {
                variableBankObject = state.variables.in_scope[v].value;
            }
        }

        // if there are variable bank objects to display
        if (!isObjectEmpty(variableBankObject)) {

            // add all of the currently defined variables to the variable bank
            for (var variable in variableBankObject) {
                var listRow = d3.select("#variable_list_table").append("tr").attr("class", "variable_list_table_row");
                var listCell1 = listRow.append("td");
                var listCell2 = listRow.append("td");

                if (variableBankObject[variable].hasOwnProperty("type") && variableBankObject[variable].type == "array") {
                    listCell1.attr("class", "array_label");
                    listCell1.append("span").attr("class", "bank_variable").text(variable);
                    listCell1.append("span").text(" :");

                    var arrayTable = listCell2.append("table").attr("class", "bank_variable_array");
                    var indexRow = arrayTable.append("tr");
                    var index = 0;
                    for (var arrayIndex in variableBankObject[variable].value) {
                        indexRow
                            .append("td")
                            .attr("class", "bank_variable_array_index")
                            .text(index)
                        ;
                        index++;
                    }

                    var valueRow = arrayTable.append("tr");
                    for (var arrayIndex in variableBankObject[variable].value) {
                        valueRow
                            .append("td")
                            .attr("class", "bank_variable_array_value")
                            .text(variableBankObject[variable].value[arrayIndex].value)
                        ;
                    }
                }
                else {
                    listCell1.attr("class", "bank_variable_label");
                    listCell1.append("span").attr("class", "bank_variable").text(variable);
                    listCell1.append("span").text(" :");

                    listCell2.attr("style", "text-align: left;");
                    listCell2
                        .append("span")
                        .attr("class", "bank_variable_value")
                        .text(variableBankObject[variable].value)
                    ;
                }
            }
        }
    }

    function isObjectEmpty(obj) {
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop))
                return false;
        }

        return true;
    }

    function addHighlighting() {
        // remove all highlighting first so it can be re-drawn
        // FIXME should write a real reset function
        $(".highlight").removeClass("highlight");

        for (var variable in state.variables.in_scope) {
            var varObject = state.variables.in_scope[variable];

            if (varObject.hasOwnProperty("value") && varObject.hasOwnProperty("type")) {
                switch(varObject.type) {
                    case "Parameter":
                        highlightArguments();
                        break;

                    case "AstNode":
                        highlightASTNode(varObject.value);
                        break;

                    case "Line":
                        //highlightLine(varObject.value);
                        break;

                }
            }
        }

        //interactiveVariableBank({"arr":{"index":2}, "i":0}, true);
    }

    function highlightArguments() {
        var argumentText = d3.select("#args").node().innerHTML;
        var openParenIndex = argumentText.indexOf("(");
        argumentText = argumentText.substring(0,openParenIndex+1) + "<span class='highlight'>" + argumentText.substring(openParenIndex+1);
        var closeParenIndex = argumentText.indexOf(")");
        argumentText = argumentText.substring(0,closeParenIndex) + "</span>" + argumentText.substring(closeParenIndex);
        d3.select("#args").node().innerHTML = argumentText;
    }

    function highlightASTNode(node) {
        var htmlID = "java-ast-" + node.id;
        $("#" + htmlID).addClass("highlight");
    }

    // highlights the line of code passed in as a parameter
    function highlightLine(lineNum) {
        $("#problem_space li").removeClass("highlight");
        $("." + lineNum).addClass("highlight");
    }

    // adds input boxes to the variable bank so the user can add new variables
    function interactiveVariableBank(variables, newVariable) {
        console.log("in interactiveVariableBank");
        console.log(d3.selectAll(".variable_list_table_row"));
        d3.selectAll(".variable_list_table_row").each(function() {
            var varName = d3.select(this).select(".bank_variable").node().innerHTML;
            console.log("varName: " + varName);
            for (var key in variables) {
                if (varName === key) {

                    // check to see if this variable is an array
                    if (d3.select(this).select(".bank_variable_array").node() != null) {
                        if (variables[key].hasOwnProperty("index")) {
                            interactiveVariableBankArrayCell(d3.select(this).select(".bank_variable_array"), variables[key].index, newVariable);
                        }
                        else {
                            interactiveVariableBankArray(d3.select(this).select(".bank_variable_array"));
                        }
                    }
                    else {
                        interactiveVariableBankValue(d3.select(this).select(".bank_variable_value"), newVariable);
                    }
                }
            }
        });
    }

    function interactiveVariableBankArrayCell(arrayTable, index, newVariable) {
        arrayTable.selectAll(".bank_variable_array_value").each(function(d, i) {
            if (i == index) {
                // store the current value
                var currentValue = d3.select(this).node().innerHTML;

                // remove the current value
                d3.select(this).node().innerHTML = "";

                // add an input box for the value
                var inputField = d3.select(this)
                    .append("input")
                    .attr("class", "arrayVarValue")
                ;

                // show the current value in the input box
                if (!newVariable) {
                    inputField.property("value", currentValue);
                }
            }
        });
    }

    function interactiveVariableBankArray(arrayTable) {
        arrayTable.selectAll(".bank_variable_array_value").each(function() {
            // remove the current value
            d3.select(this).node().innerHTML = "";

            // add an input box for the value
            var inputField = d3.select(this)
                .append("input")
                .attr("class", "arrayVarValue")
            ;
        });
    }

    function interactiveVariableBankValue(variableValue, newVariable) {
        // store the current value
        var currentValue = variableValue.node().innerHTML;

        // remove the current value
        variableValue.node().innerHTML = "";

        // add an input box for the value
        var inputField = variableValue
            .append("input")
            .attr("class", "varValue")
        ;

        // show the current value in the input box
        if (!newVariable) {
            inputField.property("value", currentValue);
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
