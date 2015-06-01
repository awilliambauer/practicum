// (function() {
	"use strict";

	var CURRENT_STEP;
	var VARIABLES;
	var AST;

	$(document).ready(function() {

		CURRENT_STEP = 0;
		VARIABLES = {};
		init();
		$("#go_back").click(function() { window.location.href = "../index.html" });
		$("#next").click(next);

	});

	// fills in the problem space with the text of the specific problem we're working on,
	// we will just have to replace "example.txt" with whatever file they store the problem
	// text in
	function init() {
		var problem = getProblemNum();
		var callVals;
		$("#prompt").hide();
		$.get("problems/problem_" + problem + ".txt", function(data) {
			AST = java_parsing.browser_parse(data);
			$("#problem_space > pre").html(on_convert(AST));
			$.getScript("state_objects/state_obj_" + problem + ".js", function(data) {
				callVals = getCallVals().toString();
				$(".content > h2").text("If/Else Mystery Problem " + problem);
				$(".content > h3 > span").text("ifElseMystery" + problem + "(" + callVals + ")");
				$("#answer_box > span").prepend("ifElseMystery" + problem + "(" + callVals + ")");
			});
		});
		
	}

	// gets the problem number from the address
	function getProblemNum() {
		var probText = window.location.search;
		if (probText.trim() != "") {
			var probNum = probText.split("=")[1];
			return probNum;
		} else {
			return 1;
		}
	}

	// gets the initial values that the method will be called with
	function getCallVals() {
		var rawVals = state[1].answer;
		var callVals = [];
		for (var variable in rawVals) {
			callVals.push(rawVals[variable]);
		}
		console.log(callVals);
		return callVals;
	}

	function next() {
		var currentState = state[CURRENT_STEP];
		//console.log(currentState.prompt);
		// take away "next" button when finished
		if (currentState.prompt.indexOf("Answer") != -1) {
			$("#next").hide();
		}

		if (CURRENT_STEP == 0) {
			$("#prompt").show();
			highlightBlocks();
		}

		CURRENT_STEP++;
		newGetPrompt(currentState);
		newHighlightLine(currentState);
		newHighlightBlock(currentState);
		newAddComments(currentState);
		newUpdateVariables(currentState);
		drawVariableBank();
		newCrossOutLines(currentState);
		addInteraction(currentState);
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

	// Extracts prompt from state, splits it into the
	// Topic and the actual Prompt.
	// The topic is bold.
	function newGetPrompt(state) {
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
			movePrompt(state.lineNum);
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

	function newUpdateVariables(state) {
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
		var interaction = document.createElement("div");
		// if there are updated variables
		if (state.hasOwnProperty("answer")) {
			for (var variable in state.answer) {
				var varBox = document.createElement("p");
				$(varBox).text(variable + " = ")
						 .css("font-family", "monospace");
				var input = document.createElement("input");
				$(input).attr("type", "text")
						.attr("value", state.answer[variable])
						.css("font-size", "12pt");
				$(varBox).append(input);
				$(interaction).append(varBox);
			}
		} else if (state.hasOwnProperty("testResult")) {	// test result, no vars
			var boolBox = document.createElement("p");
			$(boolBox).text("z <= x\t");
			var trueChoice = document.createElement("input");
			$(trueChoice).attr("type", "radio")
						 .attr("name", "t/f")
						 .attr("value", "true");
			var falseChoice = document.createElement("input");
			$(falseChoice).attr("type", "radio")
						  .attr("name", "t/f")
						  .attr("value", "false");
			if (state.testResult) {
				$(trueChoice).attr("checked", "checked");
			} else {
				$(falseChoice).attr("checked", "checked");
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
					  .css("font-size", "11pt");
			$(interaction).append(boolBox);
		}
		$(interaction).css("font-size", "12pt");
		$("#prompt").append(interaction);
	}

// })();