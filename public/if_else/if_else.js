var if_else = (function() {
	"use strict";

	// MODE variable can be either "static" or "interactive"
	var MODE = "static";

	var CURRENT_STEP;
	var VARIABLES;
	var AST;
	var state;
	var callback;
	var CORRECT_NEXT_LINE;
	var CORRECT_VARIABLES;
	var CORRECT_BOOL;

	// fills in the problem space with the text of the specific problem we're working on,
	// we will just have to replace "example.txt" with whatever file they store the problem
	// text in
	function initialize(urlPrefix, problemConfig, callbackObject) {
		CORRECT_BOOL = null;
		CURRENT_STEP = 0;
		VARIABLES = {};

		AST = problemConfig.AST;
		$("#problem_space > pre").html(on_convert(AST));

		state = problemConfig.initialState;
		callback = callbackObject;

		var args = getArgumentString().toString();
		$(".content > h2").text("If/Else Mystery Problem");
		$(".content > h3 > span").text("ifElseMystery (" + args + ")");
		$("#answer_box > span").prepend("ifElseMystery (" + args + ")");

		// move to the next step if they hit enter or click next
		$("#next").click(next);
		$(document).keydown(function() {
			if (event.which == 13) {
				next();
			}
		})
		$("#answer_box input").change(function() {
			checkAnswer();
		});
	}

	// checks the entered answer against the real answer to see if they have gotten
	// the problem correct
	function checkAnswer() {
		var realAnswer = state[state.length - 1].result.trim();
		var userAnswer = $("#answer")[0].value;
		if (realAnswer == userAnswer) {
			$("#answer_box").addClass("correct");
		} else {
			$("#answer_box").addClass("incorrect");
		}
	}

	// gets the initial values that the method will be called with
	function getArgumentString() {
		var rawVals = state.initialization;
		var callVals = [];
		for (var variable in rawVals) {
			callVals.push(rawVals[variable]);
		}
		return callVals;
	}

	function next() {
		console.log("step!");
		state = callback.getNextState();
		console.log(state);

		$("body *").removeClass("correct")
				   .removeClass("incorrect")
				   .removeClass("incorrect_select");


		if (MODE == "static") {

			if (state.state.lineNum > 0) {
				$("html, body").animate({
					scrollTop: $("." + state.state.lineNum).offset().top - 200
				}, 1000);
			}
			highlightBlocks();
			newGetPrompt(state);
			newHighlightLine(state.state);
			newHighlightBlock(state.state);
			newUpdateVariables(state.state);
			drawVariableBank();
			//newAddComments(currentState);
			//newCrossOutLines(currentState);
			//addInteraction(currentState);
		}
		else if (MODE == "interactive") {
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
		for (var node of java_ast.find_all(function(n) { return n.tag == "if"; }, AST)) {
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
				$(this).addClass("chosen-next-line")
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
	}

	return {
		initialize: initialize
	};

 })();