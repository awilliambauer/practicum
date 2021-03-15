
var controller = (function() {
    "use strict";

    var logger;
    var simulatorInterface;
    var config;
    var state;
    var fadeLevel;
    var waitingForResponse;
    var responseType;
    var numTries;
    var button;

    function initialize(problemConfig, simulatorInterface_, initialState, task_logger, fading) {

        $("#problem_space > pre").html(java_formatter.format(initialState.ast, {args:initialState.args}));

        $("#promptText").css("font-weight", 'bold');
        $("#problem_space > pre").addClass("hidden");
        $("#problem_space").css("padding-top", "15px");


        logger = task_logger;
        simulatorInterface = simulatorInterface_;

        config = problemConfig;
        state = initialState;
        waitingForResponse = false;
        responseType = "";
        numTries = 0;
        fadeLevel = fading;

        Logging.log_task_event(logger, {
            type: Logging.ID.FadeLevel,
            detail: {fadeLevel:fadeLevel},
        });

        $("#nextstep").click(step);
        $(document).off("keydown");

        button = "#nextstep";
        $(document).keydown(function(e){
            if (e.which == 13){
                e.preventDefault();
                if ($(button).attr('disabled')) return false;
                $(button).click();
                return false;
            }
        });

        d3.select("#submitButton").on("click", checkSolution);

        d3.select("#newVariant").on("click", function () {csed.loadProblem(config, config.content.variants.find(function (v) { return !v.started; }));});
        d3.select("#newProblem").on("click", function () {csed.loadProblem(config.nextProblem)});

        createStartingStatesDropdown(problemConfig, state);
    }

    function createStartingStatesDropdown(problemConfig, state) {
        d3.selectAll("#methodCallDropdown")
            .selectAll("li")
            .data(problemConfig.content.variants)
            .enter()
            .append("li")
            .append("a")
            .attr("class", "monospace")
            .text(function(s) { return state.ast.name + "(" + getArgString(s.arguments) + ")"; })
            .on("click", function(s) {
                if (s !== state.variant) {
                    csed.loadProblem(problemConfig, s);
                }
            })
        ;

        d3.select("#methodCall")
            .text(function() { return state.ast.name + "(" + getArgString(state.args) + ")"} )
        ;
    }

    function getArgString(args) {
        var callVals = [];
        for (var variable in args) {
            var arrayString;
            if (Array.isArray(args[variable])) {
                arrayString = "[";
                var firstIter = false;
                if (args[variable].length > 0) firstIter = true;
                for (let item of args[variable]) {
                    if (!firstIter) {
                        arrayString = arrayString + ',';
                        arrayString = arrayString + ' ';
                    }
                    firstIter = false;
                    arrayString = arrayString + item;
                }
                arrayString = arrayString + "]";
            } else if (typeof args[variable] === "string") {
                arrayString = "\'" + args[variable] + "\'";
            }
            else {
                arrayString = args[variable];
            }
            callVals.push(arrayString);
        }
        return callVals;
    }

    function step() {
        $("#promptText").css("font-weight", 'normal');
        $("#problem_space > pre").removeClass("hidden");
        $("#problem_space").css("padding-top", "0px");

        Logging.log_task_event(logger, {
            type: Logging.ID.NextButton,
            detail: {},
        });

        if (waitingForResponse) {
            switch (responseType) {
                case 'add_variable':
                    checkVariableBankAnswer();
                    break;
                case 'update_variable':
                    checkVariableBankAnswer();
                    break;
                case 'add_array_index':
                    checkArrayIndexAnswer();
                    break;
                case 'next_line':
                    checkNextLineClickAnswer();
                    break;
                case 'conditional':
                    checkConditionalAnswer();
                    break;
                case 'list_element_click':
                    checkArrayElement();
                    break;
                case 'list_element_get':
                    checkScratchASTNode('list_element_get');
                    break;
                case 'evaluate_expression':
                    checkScratchASTNode('evaluate_expression');
                    break;
            }
        } else {
            state = simulatorInterface.getNextState(fadeLevel);
            stepWithState();
        }
    }

    function stepWithState() {
        if (fadeLevel > 0 && state.hasOwnProperty("askForResponse")) {
            waitingForResponse = true;
            responseType = state.askForResponse;
        } else {
            waitingForResponse = false;
            responseType = null;
        }

        if (waitingForResponse && (responseType === 'next_line' || responseType === 'list_element_click' || responseType === 'list_element_get')) {
            $("#next-container").addClass("hidden");
            $("#nextstep").prop('disabled', true);
        } else {
            $("#next-container").removeClass("hidden");
            $("#nextstep").prop('disabled', false);
        }

        if (waitingForResponse && responseType === 'next_line') {
            $(".line_highlight").addClass("prev_line_highlight");
        } else {
            $(".prev_line_highlight").removeClass("prev_line_highlight");
        }

        addPrompt();
        addVariableBank();
        addHighlighting();

    }

    function addPrompt() {
        if (state.hasOwnProperty("prompt")) {
            var prompt =  state.prompt;
            d3.select("#promptText").node().innerHTML = prompt;

            if (prompt === "The print statement below prints out the value(s) that the function returned. Enter that solution in the solution box!") {
                $("#next-container").addClass("hidden");
                $("#nextstep").prop('disabled', true);
                button = "#submitButton";
            }

            if (state.hasOwnProperty("askForResponse") && state.askForResponse === "conditional") {
                var yesNoButtonDiv = d3.select("#promptText")
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

    function addVariableBank() {
        d3.select("#variable_list_table").node().innerHTML = "";
        d3.select("#variable_array_table").node().innerHTML = "";
        var variableBankObject;
        for (var v in state.variables.in_scope) {
            if (state.variables.in_scope[v].hasOwnProperty("type") && state.variables.in_scope[v].type == "VariableBank") {
                variableBankObject = state.variables.in_scope[v].value;
            }
        }

        if (!isObjectEmpty(variableBankObject)) {
            for (var variable in variableBankObject) {
                var listRow;
                var listCell1;
                var listCell2;
                if (!(variableBankObject[variable].hasOwnProperty("type") && variableBankObject[variable].type === "array")) {
                    listRow = d3.select("#variable_list_table").append("tr").attr("class", "variable_list_table_row");
                    listCell1 = listRow.append("td");
                    listCell2 = listRow.append("td");
                }

                if (variableBankObject[variable].hasOwnProperty("type") && variableBankObject[variable].type === "array") {
                    listRow = d3.select("#variable_array_table").append("tr").attr("class", "variable_list_table_row");
                    listCell1 = listRow.append("td");
                    listCell2 = listRow.append("td");
                    listCell1.attr("class", "array_label");
                    listCell1.append("span").attr("class", "bank_variable").text(variable);
                    listCell1.append("span").text(" :");
                    var arrayTable = listCell2.append("table").attr("class", "bank_variable_array");
                    var indexRow = arrayTable.append("tr");
                    for (var i in variableBankObject[variable].value) {
                        indexRow
                            .append("td")
                            .attr("class", "bank_variable_array_index")
                            .attr("id","array-index-" + i.toString())
                            .text("")
                        ;
                    }

                    var valueRow = arrayTable.append("tr");
                    for (var j in variableBankObject[variable].value) {
                        let val = variableBankObject[variable].value[j].value
                        valueRow
                            .append("td")
                            .attr("class", "bank_variable_array_value")
                            .attr("id", "array-elem-" + j.toString())
                            .text(typeof val === "string" ? "\'" + val.toString() + "\'" : val.toString())
                        ;
                    }
                }
                else if (variableBankObject[variable].hasOwnProperty("type") &&
                        (variableBankObject[variable].type === "string" || variableBankObject[variable].type === "char")) {
                  listCell1.attr("class", "bank_variable_label");
                  listCell1
                    .append("span")
                    .attr("class", "bank_variable")
                    .text(variable);
                  listCell1.append("span").text(" :");

                  listCell2.attr("style", "text-align: left;");
                  let word = variableBankObject[variable].value;
                  if (Array.isArray(word)) {
                    word = word.map((item) => item.value).join("");
                  }
                  word = "\'" + word + "\'";

                  listCell2
                    .append("span")
                    .attr("class", "bank_variable_value")
                    .text(word);
                } else {
                  listCell1.attr("class", "bank_variable_label");
                  listCell1
                    .append("span")
                    .attr("class", "bank_variable")
                    .text(variable);
                  listCell1.append("span").text(" :");

                  listCell2.attr("style", "text-align: left;");
                  listCell2
                    .append("span")
                    .attr("class", "bank_variable_value")
                    .text(variableBankObject[variable].value);
                }
            }
            if (variableBankObject.hasOwnProperty("loop sequence")) {
                d3.selectAll(".array_label").attr("class", "array_label has_sequence");
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
        resetHighlighting();

        var variable, varObject;

        for (variable in state.variables.in_scope) {
            varObject = state.variables.in_scope[variable];

            if (varObject.hasOwnProperty("value") && varObject.hasOwnProperty("type")) {
                switch(varObject.type) {
                    case "Parameter":
                        highlightArguments();
                        break;

                    case "Variable":
                        if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") && state.askForResponse === "add_variable") {
                            if (Array.isArray(varObject.value)) {
                                varObject.value.forEach(function (v) {
                                    interactiveVariableBank(v, true);
                                });
                            } else if(varObject.value.type === "array") {
                                interactiveVariableBank(varObject.value,true);
                            }
                            else {
                                interactiveVariableBank(varObject.value, true);
                            }
                        }
                        else if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") && state.askForResponse === "update_variable") {

                            interactiveVariableBank(varObject.value, false);
                        }
                        else {
                            if (Array.isArray(varObject.value)) {
                                varObject.value.forEach(function (v) {
                                    highlightVariableBank(v);
                                });
                            } else if (varObject.value.type === "array" || varObject.value.type === "string") {
                                if(variable !== "lets_visualize_our_sequence" && variable !== "lets_visualize_our_inner_sequence") {
                                    highlightVariableBank(varObject.value);
                                }
                            }
                            else {
                                highlightVariableBank(varObject.value);
                            }
                        }
                        break;

                    case "ArrayIndex":
                        if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") && state.askForResponse === "add_array_index") {

                            interactiveArrayIndex(varObject.value);
                        }
                        else {
                            highlightArrayIndex(varObject.value);
                        }
                        break;

                    case "ArrayIndices":
                        highlightArrayIndices(varObject.value);
                        break;

                    case "ArrayElement":
                        if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") &&
                            (state.askForResponse === "list_element_get" || state.askForResponse === "list_element_click")) {

                            interactiveArrayElement(varObject.value);
                        }
                        else {
                            highlightArrayElement(varObject.value);
                        }
                        break;

                    case "AstNode":
                        if(variable === "this_is_the_conditional_of_an_if_statement" || variable === "this_is_the_conditional_of_a_while_statement"
                            || variable === "this_is_the_inner_loop_iterable" || variable === "this_is_the_inner_loop_variable") {
                            if(state.variables.in_scope["this_is_the_next_line_that_will_execute"].value.location.start.line
                                === varObject.value.location.start.line) {
                                highlightASTNode(varObject.value);
                            }
                        } else {
                            highlightASTNode(varObject.value);
                        }
                        break;

                    case "ScratchAstNode":
                        if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") &&
                            (state.askForResponse === "list_element_get" || state.askForResponse === "evaluate_expression")) {

                            interactiveScratchASTNode(varObject.value);
                        }
                        else {
                            highlightScratchASTNode(varObject.value);
                        }
                        break;

                    case "Line":
                        if(state.variables.in_scope.hasOwnProperty("end_loop") && state.variables.in_scope.end_loop.value === true) {
                            break;
                        }
                        if (fadeLevel > 0 && variable === state.statement_result.name &&
                            state.hasOwnProperty("askForResponse") && state.askForResponse === "next_line") {

                            interactiveLines();
                        }
                        else {
                            highlightLine(varObject.value);
                        }
                        break;
                }
            }
        }
    }

    function resetHighlighting() {
        $(".highlight").removeClass("highlight");
        $(".block_highlight").removeClass("block_highlight");
        $(".node_highlight").removeClass("node_highlight");
        $(".scratch_node_highlight").removeClass("scratch_node_highlight");
        $(".line_highlight").removeClass("line_highlight");
        $(".text_highlight").removeClass("text_highlight");
        $(".array_element_highlight").removeClass("array_element_highlight");
    }

    function highlightArguments() {
        var argumentText = d3.select("#methodCall").node().innerHTML;
        var openParenIndex = argumentText.indexOf("(");
        argumentText = argumentText.substring(0,openParenIndex+1) + "<span class='highlight'>" + argumentText.substring(openParenIndex+1);
        var closeParenIndex = argumentText.indexOf(")");
        argumentText = argumentText.substring(0,closeParenIndex) + "</span>" + argumentText.substring(closeParenIndex);
        d3.select("#methodCall").node().innerHTML = argumentText;
    }

    // highlights the (single) variable passed in as a parameter. cannot handle multiple variables at once
    function highlightVariableBank(variable) {
        d3.selectAll(".variable_list_table_row").each(function(d,i) {
            var varName = d3.select(this).select(".bank_variable").node().innerHTML;
            if (varName === variable.name) {
                d3.select(this)
                    .select(".bank_variable_value")
                    .attr("class","bank_variable_value text_highlight")
                ;
                d3.select(this)
                    .selectAll(".bank_variable_array_value")
                    .attr("class","bank_variable_array_value text_highlight")
                ;
            }
        });
    }

    // adds input boxes to the variable bank so the user can add a (single) new variable
    function interactiveVariableBank(variable, newVariable) {
        d3.selectAll(".variable_list_table_row").each(function() {
            var varName = d3.select(this).select(".bank_variable").node().innerHTML;
            if (varName === variable.name) {
                if (d3.select(this).select(".bank_variable_array").node() != null) {
                    if (variable.hasOwnProperty("index")) {
                        interactiveVariableBankArrayCell(d3.select(this).select(".bank_variable_array"), variable.index.value, newVariable);
                    }
                    else {
                        interactiveVariableBankArray(d3.select(this).select(".bank_variable_array"));
                    }
                }
                else {
                    interactiveVariableBankValue(d3.select(this).select(".bank_variable_value"), newVariable);
                }
            }
        });
    }

    function interactiveVariableBankArrayCell(arrayTable, index, newVariable) {
        arrayTable.selectAll(".bank_variable_array_value").each(function(d, i) {
            if (i == index) {
                var currentValue = d3.select(this).node().innerHTML;

                d3.select(this).node().innerHTML = "";

                var inputField = d3.select(this)
                        .append("input")
                        .attr("class", "arrayVarValue")
                    ;

                if (!newVariable) {
                    inputField.property("value", currentValue);
                }
            }
        });
    }

    function interactiveVariableBankArray(arrayTable) {
        arrayTable.selectAll(".bank_variable_array_value").each(function() {
            d3.select(this).node().innerHTML = "";

            var inputField = d3.select(this)
                    .append("input")
                    .attr("class", "arrayVarValue")
                ;
        });
    }

    function interactiveVariableBankValue(variableValue, newVariable) {
        var currentValue = variableValue.node().innerHTML;

        variableValue.node().innerHTML = "";

        var inputField = variableValue
                .append("input")
                .attr("class", "varValue")
            ;

        if (!newVariable) {
            inputField.property("value", currentValue);
        }
    }

    function highlightArrayIndex(index) {
        d3.select("#array-index-" + index.toString()).text(index);
    }

    function interactiveArrayIndex(index) {
        d3.select("#array-index-" + index.toString())
            .append("input")
            .attr("class", "indexVarValue")
        ;
    }

    function highlightArrayIndices(indices) {
        for (var i = 0; i < indices.length; i++) {
            d3.select("#array-index-" + i.toString()).text(i);
        }
    }

    function highlightArrayElement(arrayElement) {
        d3.selectAll(".variable_list_table_row").each(function() {
            var varName = d3.select(this).select(".bank_variable").node().innerHTML;
            if (varName === arrayElement.array.name) {
                var i = -1;
                d3.select(this)
                    .selectAll(".bank_variable_array_value")
                    .attr("class", (function() {
                        i++;
                        if (i === arrayElement.value) {
                            return "bank_variable_array_value array_element_highlight";
                        }
                        else {
                            return "bank_variable_array_value";
                        }
                    }))
                ;
            }
        });
    }

    function interactiveArrayElement(arrayElement) {    
        d3.selectAll(".variable_list_table_row").each(function () {
          var varName = d3.select(this).select(".bank_variable").node()
            .innerHTML;
          if (varName === arrayElement.array.name) {
            d3.select(this).selectAll(".bank_variable_array_value").each(function () {
              d3.select(this)
                .classed("clickable", true)
                .attr("tabindex", 0)
                .on("click", function () {
                  d3.select(this).classed("array_element_highlight", true);
                  d3.selectAll(".clickable").each(function () {
                    d3.select(this)
                      .classed("clickable", false)
                      .attr("tabindex", null)
                      .on("click", null)
                      .on("keydown", null);
                  });
                  step();
                })
                .on("keydown", function () {
                  if (d3.event.keyCode === 32) {
                    this.click();
                  }
                });
            });
          }
        });
        
    }

    function highlightASTNode(node) {
        if (node !== null) {
            var htmlID = "java-ast-" + node.id;
            $("#" + htmlID).addClass("node_highlight");
        }
    }

    // highlights this AST node in the *LAST* line of the scratch list
    function highlightScratchASTNode(node) {
        var numLines = -1;
        d3.select("#scratch_list").selectAll("li").each(function () {
            numLines++;
        });
        var htmlID = "scratch-" + numLines.toString() + "-" + node.id;
        $("#" + htmlID).addClass("scratch_node_highlight");
    }

    function interactiveScratchASTNode(node) {
        var numLines = -1;
        d3.select("#scratch_list").selectAll("li").each(function () {
            numLines++;
        });
        var htmlID = "scratch-" + numLines.toString() + "-" + node.id;

        d3.select("#" + htmlID).node().innerHTML = "";
        d3.select("#" + htmlID).append("input").attr("class", "arrayVarValue");
    }

    // highlights the line of code passed in as a parameter
    function highlightLine(line) {
        if (line.hasOwnProperty("location")) {
            d3.select("#java-ast-line-" + line.location.start.line).classed("line_highlight", true);
        }
        else {
            d3.select("#java-ast-line-" + line).classed("line_highlight", true);
        }
    }

    // makes all the lines clickable so that the user can select the next line
    function interactiveLines() {
        d3.select(".java-line").classed("line_highlight", false);

        d3.selectAll(".java-line").each(function () {
            d3.select(this)
                .classed("clickable", true)
                .attr("tabindex", 0)
                .on("click", function() {
                    d3.select(this).classed("line_highlight", true);
                    d3.selectAll(".clickable").each(function() {
                        d3.select(this)
                            .classed("clickable", false)
                            .attr("tabindex", null)
                            .on("click", null)
                            .on("keydown", null)
                        ;
                    });
                    step();
                })
                .on("keydown", function() {
                    if (d3.event.keyCode === 32) {
                        this.click();
                    }
                })
            ;
        });
    }



    // #################### FUNCTIONS TO CHECK USER ANSWERS ####################

    function checkVariableBankAnswer() {
        var correctAnswerObject = simulatorInterface.getCorrectAnswer();
        var correctAnswer = correctAnswerObject.rhs;

        var userVariable = {};
        var correctVariable = {};
        var correct = true;

        d3.selectAll(".variable_list_table_row").each(function(d,i) {
            var userValue, correctValue;

            if (d3.select(this).select(".bank_variable_array").node() != null) {
                var arrayTable = d3.select(this).select(".bank_variable_array");
                if(correctAnswer.type === "array") {
                    correctVariable[correctAnswer.name] = [];
                    userVariable[correctAnswer.name] = [];
                    arrayTable.selectAll(".arrayVarValue").each(function(d, i) {
                        correctValue = parseInt(correctAnswer.value[i].value);
                        correctVariable[correctAnswer.name].push(correctValue);
                        userValue = parseInt(this.value);
                        userVariable[correctAnswer.name].push(userValue);
                        if (correctValue !== userValue) {
                            correct = false;
                        }
                    });
                }
                else if(correctAnswer[0] !== undefined) {
                    if (correctAnswer[0].type === "array") {
                        
                        correctVariable[correctAnswer[0].name] = [];
                        userVariable[correctAnswer[0].name] = [];
                        arrayTable.selectAll(".arrayVarValue").each(function (d, i) {
                            correctValue = parseInt(correctAnswer[0].value[i].value);
                            correctVariable[correctAnswer[0].name].push(correctValue);
                            userValue = parseInt(this.value);
                            userVariable[correctAnswer[0].name].push(userValue);
                            if (correctValue !== userValue) {
                                correct = false;
                            }
                        });
                    }
                }
                else if(correctAnswer.type === "string" && correctAnswer.name.includes("loop sequence")) {
                    correctVariable[correctAnswer.name] = [];
                    userVariable[correctAnswer.name] = [];
                    arrayTable.selectAll(".arrayVarValue").each(function(d, i) {
                        correctValue = correctAnswer.value[i].value.replace(/^['"]+|['"]+$/g,"");
                        correctVariable[correctAnswer.name].push(correctValue);
                        userValue = this.value.replace(/^['"]+|['"]+$/g,"");
                        userVariable[correctAnswer.name].push(userValue);
                        if (correctValue !== userValue) {
                            correct = false;
                        }
                    });
                }
                else if (correctAnswer.hasOwnProperty("index")) {
                    var typeString = correctAnswer.type === "string";
                    userValue = arrayTable.select(".arrayVarValue").property("value");
                    if(!typeString) {
                        userValue = parseInt(userValue);
                    }
                    if (typeString) {
                        correctValue = correctAnswer.value[correctAnswer.index.value].value.replace(/^['"]+|['"]+$/g,"");
                        userValue = userValue.replace(/^['"]+|['"]+$/g,"");
                    } else {
                        correctValue = parseInt(correctAnswer.value[correctAnswer.index.value].value);
                    }
                    correctVariable[correctAnswer.name] = correctValue;
                    userVariable[correctAnswer.name] = userValue;
                    if (userValue !== correctValue) {
                        correct = false;
                    }
                }
                else {
                    correctVariable[correctAnswer.name] = [];
                    userVariable[correctAnswer.name] = [];
                    arrayTable.selectAll(".arrayVarValue").each(function(d, i) {
                        correctValue = parseInt(correctAnswer[0].value[i].value);
                        correctVariable[correctAnswer.name].push(correctValue);
                        userValue = parseInt(this.value);
                        userVariable[correctAnswer.name].push(userValue);
                        if (correctValue !== userValue) {
                            correct = false;
                        }
                    });
                }
            }
            else {
                var input = d3.select(this).select(".bank_variable_value").select(".varValue");
                if (input.node() !== null) {
                    
                    var typeString;
                    if (Array.isArray(correctAnswer)) {
                        typeString = correctAnswer[0].type === "string";
                    } else {
                        typeString = correctAnswer.type === "string";
                    }

                    userValue = d3.select(this).select(".bank_variable_value").select(".varValue").property("value");

                    if (!typeString) {
                        userValue = parseInt(userValue);
                    } else {
                        userValue = userValue.replace(/^['"]+|['"]+$/g,"");
                    }
                    if (Array.isArray(correctAnswer)) {
                        if (typeString) {
                            var stringArray = correctAnswer.find(function (v) {
                                return v.name === d3.select(this).select(".bank_variable_label").select(".bank_variable").html();
                            }, this).value;
                            correctValue = "";
                            stringArray.forEach(letter => correctValue = correctValue + letter.value);
                            correctValue = correctValue.replace(/^['"]+|['"]+$/g,"");
                        } else {
                            correctValue = correctAnswer.find(function (v) {
                                return v.name === d3.select(this).select(".bank_variable_label").select(".bank_variable").html();
                            }, this).value;
                            
                        }
                    } else if (typeString) {
                        correctValue = correctAnswer.value.replace(/^['"]+|['"]+$/g,"");
                    } else {
                        correctValue = correctAnswer.value;
                    }
                    correctVariable[correctAnswer.name] = correctValue;
                    userVariable[correctAnswer.name] = userValue;
                    if (userValue !== correctValue) {
                        correct = false;
                    }
                }
            }
        });

        Logging.log_task_event(logger, {
            type: Logging.ID.QuestionAnswer,
            detail: {
                type: "variable_bank",
                correctAnswer: correctVariable,
                userAnswer: userVariable,
                correct: correct
            },
        });

        respondToAnswer(correct, "variable_bank", correctVariable);
    }

    function checkArrayIndexAnswer() {
        var correctAnswerObject = simulatorInterface.getCorrectAnswer();
        var correctIndex = parseInt(correctAnswerObject.rhs);
        var userIndex = parseInt(d3.select(".indexVarValue").property("value"));

        var correct = false;
        if (userIndex === correctIndex) {
            correct = true;
        }

        Logging.log_task_event(logger, {
            type: Logging.ID.QuestionAnswer,
            detail: {
                type: "add_array_index",
                correctAnswer: correctIndex,
                userAnswer: userIndex,
                correct: correct
            },
        });

        respondToAnswer(correct, "add_array_index", correctIndex);
    }

    function checkNextLineClickAnswer() {
        var correctAnswerObject = simulatorInterface.getCorrectAnswer();
        var correctLine = parseInt(correctAnswerObject.rhs.location.start.line);
        var userLine;
        var correct = false;

        var highlightedLine = d3.select(".line_highlight");
        if (highlightedLine.node() !== null) {
            if (d3.select("#errorMessage").node() !== null) {
                d3.select("#errorMessage").remove();
            }

            var lineId = highlightedLine.attr("id");
            lineId = lineId.replace("java-ast-line-", "");
            userLine = parseInt(lineId);
            if (userLine === correctLine) {
                correct = true;
            }

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
        else {
            if (d3.select("#responseMessage").node() !== null) {
                d3.select("#responseMessage").remove();
            }
            if (d3.select("#errorMessage").node() === null) {
                var errorMessage = "<span id='errorMessage' style='color: red;'>Try entering an answer first!<br></span>";
                d3.select("#promptText").node().innerHTML = errorMessage + d3.select("#promptText").node().innerHTML;
            }
        }
    }

    function checkConditionalAnswer() {
        var correctAnswerObject = simulatorInterface.getCorrectAnswer();

        if (d3.select('input[name="yes_no_radio"]:checked').node() === null) {
            if (d3.select("#responseMessage").node() !== null) {
                d3.select("#responseMessage").remove();
            }
            if (d3.select("#errorMessage").node() === null) {
                var errorMessage = "<span id='errorMessage' style='color: #ff0000;'>Try entering an answer first!<br></span>";
                d3.select("#promptText").node().innerHTML = errorMessage + d3.select("#promptText").node().innerHTML;
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

    function checkArrayElement() {
        var correctAnswerObject = simulatorInterface.getCorrectAnswer();

        var correctArrayElement = state.variables.in_scope[correctAnswerObject.name].value.value;

        var userArrayElement;
        var correct = false;

        var highlightedElement = d3.select(".array_element_highlight");
        if (highlightedElement.node() !== null) {
            if (d3.select("#errorMessage").node() !== null) {
                d3.select("#errorMessage").remove();
            }
            var elemId = highlightedElement.attr("id");
            elemId = elemId.replace("array-elem-", "");
            userArrayElement = parseInt(elemId);
            if (userArrayElement === correctArrayElement) {
                correct = true;
            }

            Logging.log_task_event(logger, {
                type: Logging.ID.QuestionAnswer,
                detail: {
                    type: "list_element_click",
                    correctAnswer: correctArrayElement,
                    userAnswer: userArrayElement,
                    correct: correct
                },
            });

            respondToAnswer(correct, "list_element_click", correctArrayElement);
        }
        else {
            if (d3.select("#responseMessage").node() !== null) {
                d3.select("#responseMessage").remove();
            }
            if (d3.select("#errorMessage").node() === null) {
                var errorMessage = "<span id='errorMessage' style='color: red;'>Try entering an answer first!<br></span>";
                d3.select("#promptText").node().innerHTML = errorMessage + d3.select("#promptText").node().innerHTML;
            }
        }
    }

    function checkScratchASTNode(type) {
        var correctAnswerObject = simulatorInterface.getCorrectAnswer();
        var correctValue = parseInt(correctAnswerObject.rhs.value);
        var userValue = correctValue;

        var correct = false;
        if (userValue === correctValue) {
            correct = true;
        }

        Logging.log_task_event(logger, {
            type: Logging.ID.QuestionAnswer,
            detail: {
                type: type,
                correctAnswer: correctValue,
                userAnswer: userValue,
                correct: correct
            },
        });

        respondToAnswer(correct, type, correctValue);
    }

    function respondToAnswer(correct, type, correctAnswer) {
        numTries = numTries + 1;
        if (!correct && numTries === 3) {
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

        state = simulatorInterface.respondToAnswer(correct);
        stepWithState();
    }

    function checkSolution() {
        var userSolution = d3.select("#inputBox").node().value;
        userSolution = userSolution.replace(/ /g,'');
        userSolution = userSolution.replace(/\{/g,'');
        userSolution = userSolution.replace(/}/g,'');
        userSolution = userSolution.replace(/\[/g,'');
        userSolution = userSolution.replace(/]/g,'');
        userSolution = userSolution.replace(/\(/g,'');
        userSolution = userSolution.replace(/\)/g,'');
        userSolution = userSolution.split(',').map(substr => substr.replace(/^['"]+|['"]+$/g,"")).join(',');
        
        var solutionState = simulatorInterface.getFinalState();
        
        var correctSolution = solutionState.variables.in_scope.the_return_value_of_the_function_is_determined_here.value;
        correctSolution = correctSolution.split(',').map(substr => substr.replace(/^['"]+|['"]+$/g,"")).join(',');
        
        var correct = false;
        if (String(userSolution) === String(correctSolution)) {
            correct = true;
        } else if (String(userSolution) === "") {
            var emptySolution = true;
        }

        $("#inputBox").on("animationend", function () {$("#inputBox").attr("class", "");});
        if (correct) {
            d3.select("#submitButton").attr("disabled", "disabled");
            d3.select("#incorrectHeader").classed("hidden", true);
            d3.select("#emptySolutionHeader").classed("hidden", true);
            d3.select("#correctHeader").classed("hidden", false);
            d3.select("#inputBox").attr("class", "correct").attr("disabled", "disabled");
            if (config.content.variants && config.content.variants.some(function (v) { return !v.started; })) {
                d3.select("#newVariant").classed("hidden", false);
            }
            if (config.nextProblem) {
                d3.select("#newProblem").classed("hidden", false);
            }
            updateCompletedList();
        } else if (emptySolution) {
            d3.select("#incorrectHeader").classed("hidden", true);
            d3.select("#correctHeader").classed("hidden", true);
            d3.select("#emptySolutionHeader").classed("hidden", false);
            d3.select("#inputBox").attr("class", "empty");
        } else {
            d3.select("#correctHeader").classed("hidden", true);
            d3.select("#emptySolutionHeader").classed("hidden", true);
            d3.select("#incorrectHeader").classed("hidden", false);
            d3.select("#inputBox").attr("class", "incorrect");
        }

        Logging.log_task_event(logger, {
            type: Logging.ID.CheckSolutionButton,
            detail: {correct:correct},
        });
    }

    function updateCompletedList() {
        let difficulty = d3.select("#difficultyLevel > span").html();
        let problemTitle = d3.select("#PageHeader").html();
        let guided = false;
        let independent = false;
        if (difficulty === "Difficulty level: Guided") {
            guided = true;
        } else {
            independent = true;
        }
        let problem_results = JSON.parse(localStorage.getItem("problem_results"));
        problem_results = problem_results.map(problem => {
            if (problem.problem.title === problemTitle) {
                let problem_id = "uuid_" + problem.problem.id;
                let curr_class = d3
                  .select(`.${problem_id}.list-group-item`)
                  .attr("class");
                
                if (guided) {
                    problem.guided = guided;
                    curr_class += " problem-guided-complete";
                } else if (independent) {
                    problem.independent = independent;
                    curr_class += " problem-interactive-complete";
                }
                d3.select(`.${problem_id}.list-group-item`).attr("class", curr_class);
            }
            return problem;
        })
        localStorage.setItem("problem_results", JSON.stringify(problem_results));
    }

    return {
        create_initial_state: make_initial_state,
        template_url: "controller/problemTemplate.html",
        template_id: "problem-template",
        initialize: initialize
    };

})();

(function(csed) {
    csed.controller = controller;
}) (csed);
