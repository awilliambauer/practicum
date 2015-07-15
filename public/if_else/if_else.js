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

	function reset() {

	}

	var if_else_make_initial_state = function (problemConfig) {
		var state = problemConfig.initialState;
		createStartingStates(problemConfig, state);
		return state;
	};

	// create the method call list in the dom
	function createStartingStates(problemConfig) {
		var availableMethodCalls = [problemConfig.initialState].concat(problemConfig.alternateStartingStates);

		var method_call_containers = d3.select("#method_calls")
			.selectAll("li.method_call_container")
			.data(availableMethodCalls)
			.enter()
			.append("li")
			.attr("class", "method_call_container list-group-item")
		;

		method_call_containers
			.append("div")
			.attr("class", "col-sm-8")
			.append("a")
			.text(function(state) { return "ifElseMystery1(" + getArgString(state.initialization) + ")"} )
		;

		method_call_containers
			.append("div")
			.append("input")
			.attr("placeholder", "Answer")
		;
	}


	function CallbackObject() {
		this.getNextState = function(fadeLevel) {
			return main_simulator.next(fadeLevel);
		}
	}

	function loadState(problemConfig, state, AST) {
		console.log("state to load:");
		console.log(state);
		main_simulator.initialize("if_else", {state:state}).then(function() {
			console.log("finished initializing simulator");
			if_else.initialize(problemConfig, new CallbackObject(), state);
		}, function(error) {
			console.error("something went wrong: ");
			console.log(error);
		});
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

		state = initialState;
		callback = callbackObject;
		//fadeLevel = fading;

		// for debugging
		fadeLevel = 1;

		waitingForResponse = false;
		responseType = "";
		numTries = 0;

		var args = getArgString(state.initialization).toString();
		var methodCallText = "ifElseMystery1(" + args + ")";

		$(".content > h2").text("If/Else Mystery Problem");
		$("h3#end_title > span").text(methodCallText).attr("id","args");
		$("#active_method_call_text").text(methodCallText);

		// move to the next step if they hit enter or click next
		$("#next").click(step);
		$(document).keydown(function() {
			if (event.which == 13) {
				step();
			}
		});
		$("#answer_box input").change(function() {
			checkAnswer();
		});

		fillStartingStates(problemConfig, initialState);
	}

	// Highlight the button that represents the method call we're currently viewing and disable it
	// Make the other method calls into buttons
	function fillStartingStates(problemConfig, activeState) {
		var availableMethodCalls = [problemConfig.initialState].concat(problemConfig.alternateStartingStates);
		d3.selectAll(".method_call_container a")
			.data(availableMethodCalls)

			.attr("class", function(state) {
				var activeStatus = "active";
				var buttonClass = "btn-default";
				if (state.initialization === activeState.initialization) {
					activeStatus = "disabled";
					buttonClass = "btn-primary";
					console.log("They were the same");
				}

				return "btn btn-block method_call_text " + activeStatus + " " + buttonClass;
			})
			.on("click", function(state) {
				if (state.initialization !== activeState.initialization) {
					loadState(problemConfig, state, problemConfig.AST);
				}
			})
		;
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
			else if (responseType === "question") {
				checkQuestionAnswer();
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

	// Extracts prompt from state and creates HTML
	function addPrompt() {
		if(state.hasOwnProperty("prompt")) {
			var prompt =  state.prompt;
			d3.select("#prompt").node().innerHTML = prompt;

			// check if we need to add "yes" and "no" radio buttons to the prompt
			if (fadeLevel > 0 && state.hasOwnProperty("askForResponse") && state.askForResponse === "question") {
				var yesNoButtonDiv = d3.select("#prompt")
					.append("div")
					.attr("class", "yes_no_buttons");

				yesNoButtonDiv
					.append("input")
					.attr("type", "radio")
					.attr("class", "radio")
					.attr("name", "yes_no_radio")
					.attr("value", "yes");

				yesNoButtonDiv
					.append("label")
					.text("Yes")
					.style("padding-right","30px");

				yesNoButtonDiv
					.append("input")
					.attr("type", "radio")
					.attr("class", "radio")
					.attr("name", "yes_no_radio")
					.attr("value", "no");
				yesNoButtonDiv
					.append("label")
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
					if (objectToVisualize.type == "codeBlock") {
						highlightCodeBlocks(objectToVisualize.blockIds);
					}
					else {
						console.error("Unsupported variable type: " + objectToVisualize.type);
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
					else {
						console.error("Unsupported variable type: " + varObject.type);
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
		d3.select("#args").attr("class", "highlight");
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

	// crosses out all the lines in the array passed in as a parameter
	function crossOutLines(lineNums) {
		for (var i = 0; i < lineNums.length; i++) {
			var list = document.getElementsByClassName(lineNums[i])[0];
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

	// checks the entered answer against the real answer to see if they have gotten the problem correct
	function checkAnswer() {
		var realAnswer = state[state.length - 1].result.trim();
		var userAnswer = $("#answer")[0].value;
		if (realAnswer == userAnswer) {
			$("#answer_box").addClass("correct");
		} else {
			$("#answer_box").addClass("incorrect");
		}
	}

	// checks that the answer(s) the user entered into the variable bank are correct
	function checkVariableBankAnswer() {
		var correctAnswerObject = callback.getCorrectAnswer();
		var correctVariables = correctAnswerObject.rhs;
		var correctArray = [];

		d3.selectAll(".variable_list_item").each(function(d,i) {
			// only want to check the variables that currently have inputs (interactive)
			var input = d3.select(this).select(".bank_variable_value").select(".varValue");
			if (input.node() !== null) {
				var varName = d3.select(this).select(".bank_variable").node().innerHTML;
				var userValue = input.property("value");
				for (var key in correctVariables) {
					if (varName === key) {
						if (parseInt(userValue) === parseInt(correctVariables[key])) {
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
		respondToAnswer(correct);
	}

	function checkNextLineClickAnswer() {
		var correctAnswerObject = callback.getCorrectAnswer();
		var correctLine = correctAnswerObject.rhs;
		var correct = false;

		var highlightedLine = d3.select("li.highlight");
		if (highlightedLine.node() !== null) {
			var classList = highlightedLine.attr("class");
			classList = classList.replace("highlight", "");
			classList = classList.replace(/ /g,'');
			var userLine = parseInt(classList);

			if (userLine === correctLine) {
				correct = true;
			}
		}

		respondToAnswer(correct);
	}

	function checkCrossOutAnswer() {
		var correctAnswerObject = callback.getCorrectAnswer();
		var correctCrossOuts = correctAnswerObject.rhs;

		var userCrossOuts = []
		d3.selectAll("li.cross_out").each(function() {
			var classList = d3.select(this).attr("class");
			classList = classList.replace("cross_out_able", "");
			classList = classList.replace("cross_out", "");
			classList = classList.replace(/ /g,'');
			userCrossOuts.push(parseInt(classList));
		});

		var correct = false;
		if (userCrossOuts.equals(correctCrossOuts)) {
			correct = true;
		}

		// mare the lines un-cross-out-able
		if (correct) {
			d3.selectAll(".cross_out_able").each(function() {
				d3.select(this)
					.classed("cross_out_able", false)
					.on("click", null)
				;
			});
		}

		respondToAnswer(correct);
	}

	function checkQuestionAnswer() {
		var correctAnswerObject = callback.getCorrectAnswer();

		if (d3.select('input[name="yes_no_radio"]:checked').node() === null) {
			//d3.select("#errorMessage").style("visibility", "visible");
			console.log("no answer");
		}
		else {
			//d3.select("#errorMessage").style("visibility", "hidden");
			var userAnswer = d3.select('input[name="yes_no_radio"]:checked').node().value;

			var correctAnswer = "no";
			if (correctAnswerObject.result == true) {
				correctAnswer = "yes";
			}

			var correct = false;
			if (correctAnswer === userAnswer) {
				correct = true;
			}

			respondToAnswer(correct);
		}
	}

	function respondToAnswer(correct) {
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







// ################################################################################################
// OLD CODE
// ################################################################################################

	function oldNext() {
		console.log("step!");
		state = callback.getNextState(0);
		console.log(state);

		$("body *").removeClass("correct")
			.removeClass("incorrect")
			.removeClass("incorrect_select");

		if (checkUserInput()) {
			$("#problem_space li").off("mouseover")
				.off("click");
			$(".chosen-next-line").removeClass("chosen-next-line");

			// take away "next" button when finished
			if (state.state.prompt.indexOf("Answer") != -1) {
				$(document).off("keydown");
			}

			if (CURRENT_STEP == 0) {
				$("#prompt").show();
				highlightBlocks();
			} else {
				// scroll to the right position
				$("html, body").animate({
					scrollTop: $("." + state.state.lineNum).offset().top - 200
				}, 1000);
			}
			CURRENT_STEP++;
			newGetPromptWithTitle(currentState);
			newHighlightLine(currentState);
			newHighlightBlock(currentState);
			newAddComments(currentState);
			newUpdateVariablesWithLineNums(currentState);
			drawVariableBank();
			newCrossOutLines(currentState);
			addInteraction(currentState);
		}
	}


	function checkUserInput() {
		/*
			Checks if the entered value is the correct next line.
			correctLine boolean value dictates if next button moves prompt.
		 */
		var correctLine = true;
		var correctVars = true;
		var correctBool = true;
		if (CORRECT_NEXT_LINE) {
			// var lineInput = document.getElementsByClassName("next_line_input");
			// correctLine = CORRECT_NEXT_LINE == lineInput[0].value;
			correctLine = $(".chosen-next-line").hasClass(CORRECT_NEXT_LINE);
			if (correctLine) {
				$("#prompt").addClass("correct");
			} else {
				$("#prompt").addClass("incorrect");
			}	
		}
		if (CORRECT_VARIABLES) {
			var variables = document.getElementsByClassName("variable_answer");
			var answer = [];
			for(var i = 0; i < variables.length; i++) {
				answer.push(parseInt(variables[i].value));
			}
			correctVars = answer.equals(CORRECT_VARIABLES);
			if (correctVars) {
				$("#prompt").addClass("correct");
			} else {
				$("#prompt").addClass("incorrect");
			}

		}
		if(CORRECT_BOOL !== null) {
			var check = document.querySelector("input[name = \"tf\"]:checked").value + "";
			correctBool = (check == CORRECT_BOOL);
			if (correctBool) {
				$("#prompt").addClass("correct");
			} else {
				$("#prompt").addClass("incorrect");
			}
		}
		

		if(correctLine && correctVars && correctBool) {
			var currentState = state[CURRENT_STEP];
			if(currentState.hasOwnProperty("answer")) {
				CORRECT_VARIABLES = [];
				for(var key in currentState.answer) {
					CORRECT_VARIABLES.push(currentState.answer[key]);
				}
			} else {
				CORRECT_VARIABLES = null;
			}
			if(currentState.hasOwnProperty("testResult"))  {
				CORRECT_BOOL = currentState.testResult + "";
			} else {
				CORRECT_BOOL = null;
			}
			if (currentState.hasOwnProperty("nextLine")) {
				CORRECT_NEXT_LINE = currentState.nextLine;
			} else {
				CORRECT_NEXT_LINE = null;
			}
			if(currentState.hasOwnProperty("nextLine")) {
				CORRECT_VARIABLES = currentState.answer;
			}
			return true;
		} else { // Entered line was not correct
			// if(!correctLine)
			// 	alert("Wrong Line, try again!");
			// else if(!correctVars)
			// 	alert("Wrong Values");
			// else
			// 	alert("wrong boolean");
			return false;
		}
	}

	// some initialization stuff that happens on first click of next
	function highlightBlocks() {
		// show previously invisible prompt
		$("#prompt").show();
		// highlighting all the stuff
		 for (var node in java_ast.find_all(function(n) { return n.tag == "if"; }, AST)) {
			$("#java-ast-" + node.id + "> *").each(function(index, element) {
				var text = $(element).text().split(" ");
				if (text.length > 1) {
					$(element).addClass("block_highlight");
				}
			});
		}
	}

	// moves the prompt to the given line
	function movePrompt(line) {
		// stops any current animation in case of spam clicking "next"
		$("#prompt").finish();
		var nextTop = $("." + (line)).offset().top + 20 + parseFloat($("#problem_space li").css("height"));
		$("#prompt").animate({top: nextTop});
	}

	// Extracts prompt from state and creates HTML
	function newGetPrompt(state) {
		if(state.hasOwnProperty("prompt")) {
			var prompt =  state.prompt;
			$("#prompt").html(prompt);
			if (state.hasOwnProperty("lineNum")) {
				movePrompt(state.lineNum);
			}
		}
	}

	// Extracts prompt from state, splits it into the
	// Topic and the actual Prompt.
	// The topic is bold.
	function newGetPromptWithTitle(state) {
		if(state.hasOwnProperty("prompt")) {
			var prompt =  state.prompt;
			var promptParts = prompt.split(":")
			var title = document.createElement("span");
			$(title).css("font-weight", "bold")
				.text(promptParts[0] + ": ");	// If/Else, Booleans, etc
			var body = document.createElement("span");
			$(body).text(promptParts[1]);	// the actual description
			$("#prompt").html(title);
			$("#prompt").append(body);
			if (state.hasOwnProperty("lineNum")) {
				movePrompt(state.lineNum);
			}
		}
	}


	// Accepts a state and adds the cross_out class to
	// Any element who has the class corresponding to the crossout
	// numbers from the current state
	function newCrossOutLines(state) {
		if(state.hasOwnProperty("crossOut")) {
			var lines = state.crossOut;
			// var lists = document.getElementsByTagName("ul")[0].children; // Get's all li elements
			for (var line in lines) {
				if (!lines.hasOwnProperty(line)) {
					continue;
				}
				var list = document.getElementsByClassName(lines[line])[0];
				$(list).addClass("cross_out");
			}
		}
	}

	// Adds the current list elements whose class corresponds to the state
	// objects lineNum passed. Gives it highlight class.
	function newHighlightLine(state) {
		if(state.hasOwnProperty("lineNum")) {
			$("#problem_space li").removeClass("highlight");
			var line = state.lineNum;
			$("." + line).addClass("highlight");
		}
	}
	
	// gives the lines in the state previous to the current line number the given highlight class
	function newHighlightBlock(state) {
		var curLine = state.lineNum;
		
		for (var line = 1; line < curLine; line++) {
			var list = document.getElementsByClassName(String(line))[0]; // Gets li element to highlight
			$("." + line).addClass("grey_out");
			$("." + line + " *").removeAttr("style");
		}
	}


	// Adds comments based off vars and bools array/object
	// Creates a span then appends it to the list element
	// of the given line number based off the array/object
	function newAddComments(state) {
		$(".comments").remove();
		// console.log(state.prompt);
		if(state.hasOwnProperty("vars")) {
			var vars = state.vars;
			// Handles adding comments for variables
			for (var line in vars) {
				var number = line;
				if (!vars.hasOwnProperty(line)) {
					continue;
				}
				var comment = "\t// ";
				var x = 0;
				for(var letter in vars[line]) {
					comment += letter + " = " + vars[line][letter] + ", ";
				}
				comment = comment.substring(0, comment.length - 2); // Remove trailing comma
				var newSpan = document.createElement("span");
				$(newSpan).addClass("comments");
				newSpan.innerHTML = comment;
				// Adds the comments to the list of the given class
				document.getElementsByClassName(number)[0].appendChild(newSpan);
			}
		}
		if(state.hasOwnProperty("bools")) {
			//console.log(bools);
			var bools = state.bools;
			for (var key in bools) {
				if (!bools.hasOwnProperty(key)) {
					continue;
				}
				var newSpan2 = document.createElement("span");
				$(newSpan2).addClass("comments");
				newSpan2.innerHTML = "\t // " + bools[key];
				// Adds the comments to the list of the given class
				document.getElementsByClassName(key)[0].appendChild(newSpan2);
			}
		}
 	}

	// Old function that maintained variables
	function newUpdateVariablesWithLineNums(state) {
		// console.log(state.hasOwnProperty("vars"));
		if(state.hasOwnProperty("vars")) {
			var vars = state.vars;
			for(var line in vars) {
				if(!vars.hasOwnProperty(line)) {
					continue;
				}
				// console.log("here");
				for(var variable in vars[line]) {
					// console.log("here2");
					var letter = variable;
					var value = vars[line][variable];
					if (!VARIABLES.hasOwnProperty(letter)) {
						VARIABLES[letter] = {};
					}
					VARIABLES[letter]["name"] = letter;
					VARIABLES[letter]["value"] = value;
					// console.log(state.hasOwnProperty("updated"));
					if(state.hasOwnProperty("updated")) {
						if(state.updated.indexOf(letter) != -1) {
							VARIABLES[letter]["updated"] = true;
						}
					}
				}
			}
		}
	}

	function newUpdateVariables(state) {
		if(state.hasOwnProperty("vars")) {
			var vars = state.vars;
			for (var variable in vars) {
				var letter = variable;
				var value = vars[variable];
				if (!VARIABLES.hasOwnProperty(letter)) {
					VARIABLES[letter] = {};
				}
				VARIABLES[letter]["name"] = letter;
				VARIABLES[letter]["value"] = value;
			}
		}
	}

	function drawVariableBank() { 	
		$("#variable_list").empty();
		
		// insert top row of variable bank
		var variable_label = document.createElement("span");
		$(variable_label).addClass("bank_variable");
		$(variable_label).text("name");

		var value_label = document.createElement("span");
		$(value_label).addClass("bank_variable_value");
		$(value_label).text("value");

		var li = document.createElement("li");
		$(li).addClass("variable_list_item");
		$(li).append(variable_label);
		$(li).append("\t");
		$(li).append(value_label);
		$("#variable_list").append(li);
		
		for (var variable_name in VARIABLES) {
			var variable = VARIABLES[variable_name];
			var variable_span = document.createElement("span");
			$(variable_span).addClass("bank_variable");
			$(variable_span).text(variable["name"]);

			var value_span = document.createElement("span");
			$(value_span).text(variable["value"]);
			
			$(value_span).addClass("bank_variable_value");
			// if the variable has just been updated we add a class
			if (variable["updated"]) {
				$(value_span).addClass("just_updated_value");
				variable["updated"] = false;
			}

			var li = document.createElement("li");
			$(li).addClass("variable_list_item");
			$(li).append(variable_span);
			$(li).append("\t");
			$(li).append(value_span);

			$("#variable_list").append(li);
		}
	}

	// adds the interactive components of the webpage
	function addInteraction(state) {
		var answers = false;	// true to auto-fill, false otherwise
		var interaction = document.createElement("div");
		// if there are updated variables
		if (state.hasOwnProperty("answer")) {
			for (var variable in state.answer) {
				var varBox = document.createElement("p");
				$(varBox).text(variable + " = ")
						 .css("font-family", "monospace");
				var input = document.createElement("input");
				$(input).attr("type", "text")
						.css("font-size", "12pt");
				if (answers) {
					$(input).attr("value", state.answer[variable]) // adding the answer to the state
				}
				$(input).addClass("variable_answer");
				$(varBox).append(input);
				$(interaction).append(varBox);
			}
			$(interaction).css("font-size", "12pt");
			$("#prompt").append(interaction);
			$("#prompt > div > p:first-child > input").focus();			
		} else if (state.hasOwnProperty("testResult")) {	// test result, no vars
			var boolBox = document.createElement("p");
			$(boolBox).text(getBoolTest(state));
			var trueChoice = document.createElement("input");
			$(trueChoice).attr("type", "radio")
						 .attr("name", "tf")
						 .attr("value", "true");
			var falseChoice = document.createElement("input");
			$(falseChoice).attr("type", "radio")
						  .attr("name", "tf")
						  .attr("value", "false");
			if (answers) {
				if (state.testResult) { // selecting the right box
					$(trueChoice).attr("checked", "checked");
				} else {
					$(falseChoice).attr("checked", "checked");
				}
			}
			var trueBox = document.createElement("p");
			$(trueBox).text("true")
					  .append(trueChoice)
					  .css("text-align", "center");
			var falseBox = document.createElement("p");
			$(falseBox).text("false")
					   .append(falseChoice)
					   .css("text-align", "center");
			$(boolBox).append(trueBox)
					  .append(falseBox)
					  .css("font-family", "monospace")
					  .css("font-size", "11pt")
					  .css("text-align", "center");
			$(interaction).append(boolBox);
			$(interaction).css("font-size", "12pt");
			$("#prompt").append(interaction);
			// $("#prompt > div > p > p:first-child > input").focus();			
		} else if (state.hasOwnProperty("nextLine")) {
			// add hover when mousing over
			$("#problem_space li").mouseover(function() {
				$(this).addClass("select");
			});
			$("#problem_space li").mouseout(function() {
				$(this).removeClass("select");
			});
			$("#problem_space li").click(function() {
				$(".chosen-next-line").removeClass("chosen-next-line");
				$(this).addClass("chosen-next-line");
				next();
			});
			$(interaction).css("font-size", "12pt");
			$("#prompt").append(interaction);
		}
	}

	function getBoolTest(state) {
		var currentLine = $("." + state.lineNum);
		var text = "";
		$(currentLine).children().each(function(index, element) {
			if ($(element).attr("id")) {
				text = $(element).text();
				return false;
			}
		});
		return text;
	}

	Array.prototype.equals = function (array) {
		// if the other array is a falsy value, return
		if (!array)
			return false;

		// compare lengths - can save a lot of time
		if (this.length != array.length)
			return false;

		for (var i = 0, l=this.length; i < l; i++) {
			// Check if we have nested arrays
			if (this[i] instanceof Array && array[i] instanceof Array) {
				// recurse into the nested arrays
				if (!this[i].equals(array[i]))
					return false;
			}
			else if (this[i] != array[i]) {
				// Warning - two different object instances will never be equal: {x:20} != {x:20}
				return false;
			}
		}
		return true;
	};

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
