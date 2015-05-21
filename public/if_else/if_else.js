// (function() {
	"use strict";

	var CONTENTS;
	var CURRENT_STEP;
	var CURRENT_LINE;
	var VARIABLES;
	var AST;

	$(document).ready(function() {

		CURRENT_STEP = 0;
		CURRENT_LINE = -1;
		VARIABLES = {};
		getContents();
		fillProblemSpace();
		$("#go_back").click(function() { window.location.href = "../index.html" });
		$("#next").click(goNext);

	});


	// fills in the problem space with the text of the specific problem we're working on,
	// we will just have to replace "example.txt" with whatever file they store the problem
	// text in
	function fillProblemSpace() {
		$.get("problems/problem_2.txt", function(data) {
			AST = java_parsing.browser_parse(data);
			on_convert(AST);
		});
	}

	// gets the prompts stored in the prompts.txt file and loads them into memory,
	// this will be replaced when we hook up to the backend
	function getContents() {
		$.get("prompts.txt", function(data) {
			CONTENTS = data.split("\n");
			$("#prompt").hide();
		});
	}

	// gives the given line the given css class
	function highlightLine(line, highlight) {
		if (highlight == "highlight") {
			$("#problem_space li").removeClass(highlight);		
		}
		$("." + line).addClass(highlight);
		if (highlight == "grey_out") {
			$("." + line + " *").removeAttr("style");
		}
	}

	// gives the given lines the given highlight class
	function highlightBlock(start, end, highlight) {
		for (var i = start; i <= end; i++) {
			highlightLine(i, highlight);
		}
	}

	// increments the step we're currently on and changes the prompt/highlighting
	// accordingly
	function goNext() {
		// take away "next" button when finished
		if ((CURRENT_STEP + 1) * 2 >= CONTENTS.length - 2) {
			$("#next").hide();
		}

		if (CURRENT_STEP == 0) {
			highlightBlocks();
		}

		CURRENT_STEP++;
		var prompt = CONTENTS[2 * CURRENT_STEP];
		var vars = CONTENTS[2 * CURRENT_STEP + 1].split("\t");
		var updated_vars = vars.slice(2, vars.length) // get all of the variables changed in this line

		// if vars contains variables or true/false
		var line = vars[0];
		var crossout;

		// Only updates if vars contains variables
		if (vars.length > 3) {
			updateVariables(updated_vars);
		}
		if (vars.length > 2) {
			addComment(vars);
		}
		// don't do this the first time
		if (line != CURRENT_LINE && line != 0) {
			movePrompt(line);
			CURRENT_LINE = line;
			highlightBlock(0, CURRENT_LINE - 1, "grey_out");
			highlightLine(CURRENT_LINE, "highlight");
		}
		getPrompt(prompt);
		addInteraction(vars);
		if (vars.length > 1 && vars[1].trim() != "") {
			crossout = vars[1].split(",");
			for (var i = 0; i < crossout.length; i++) {
				highlightLine(crossout[i], "cross_out");
			}
		}
		drawVariableBank();
		// OLD_VARS = vars;
	}

	// some initialization stuff that happens on first click of next
	function highlightBlocks() {
		// show previously invisible prompt
		$("#prompt").show();
		// highlighting all the stuff
		for (let node of java_ast.find_all(function(n) { return n.tag == "if"; }, AST)) {
			$("#java-ast-" + node.id + "> *").each(function(index, element) {
				var text = $(element).text().split(" ");
				if (text.length > 1) {
					$(element).addClass("block_highlight");
				}
			});
		}
	}

	// Formats the way the prompt displays
	function getPrompt(prompt) {
		$("#prompt").empty();
		var promptParts = prompt.split(":");
		if (promptParts.length > 1) {	// there is a ":" in the prompt
			var title = document.createElement("span");
			$(title).css("font-weight", "bold")
					.text(promptParts[0] + ": ");	// If/Else, Booleans, etc
			var body = document.createElement("span");
			$(body).text(promptParts[1]);	// the actual description
			$("#prompt").append(title);
			$("#prompt").append(body);
		} else {	// no ":", shouldn't happen but whatevs
			$("#prompt").text(promptParts[0]);
		}
	}

	// moves the prompt to the given line
	function movePrompt(line) {
		// stops any current animation in case of spam clicking "next"
		$("#prompt").finish();
		var nextTop = $("." + (line)).offset().top + 20 + parseFloat($("#problem_space li").css("height"));
		$("#prompt").animate({top: nextTop});
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
				var list = document.getElementsByClassName(line)[0];
				$(list).addClass("cross_out");
			}
		}
	}

	// Adds the current list elements whose class corresponds to the state
	// objects lineNum passed. Gives it highlight class.
	function newHighlightLine(state) {
		var line = state.lineNum;
		var list = document.getElementsByClassName(line)[0]; // Gets li element to highlight
		$(list).addClass("highlight");
	}
	
	// gives the lines in the state previous to the current line number the given highlight class
	function newHighlightBlock(state, highlight) {
		var curLine = state.lineNUm;
		
		for (var line = 1; line < curLine; line++) {
			var list = document.getElementsByClassName(String(line))[0]; // Gets li element to highlight
			$(list).addClass(highlight);
		}
	}


	// Adds comments based off vars and bools array/object
	// Creates a span then appends it to the list element
	// of the given line number based off the array/object
	function newAddComments(state) {
		if(state.hasOwnProperty("vars")) {
			var vars = state.vars;
			// Handles adding comments for variables
			for (var key in vars) {
				if (!vars.hasOwnProperty(key)) {
					continue;
				}
				for (var variable in key) {
					if (!key.hasOwnProperty(variable)) {
						continue;
					}
					var comment = "\t// ";
					var letter = variable;
					var value = key(letter);
					comment += letter + " = " + value + " ";
				}
				var newSpan = document.createElement("span");
				$(newSpan).addClass("comments");
				$(newSpan).text(comment);
				// Adds the comments to the list of the given class
				document.getElementByClassName(key)[0].append(newSpan);
			}
		}
		if(state.hasOwnProperty("bools")) {
			var bools = state.bools;
			for (var key1 in bools) {
				if (!bools.hasOwnProperty(key1)) {
					continue;
				}
				var comments = "\t// ";
				comments += bools(key);
				var newSpan2 = document.createElement("span");
				$(newSpan2).addClass("comments");
				$(newSpan2).text(comment);
				// Adds the comments to the list of the given class
				document.getElementByClassName(key)[0].append(newSpan2);
			}
		}
 	}



	function updateVariables(vars) {
		for (var i = 0; i < vars.length; i += 2) {
			var var_name = vars[i];
			var var_value = vars[i + 1];
			var new_variable = false;
			if (!VARIABLES.hasOwnProperty(var_name)) {
				VARIABLES[var_name] = {}
			}
			VARIABLES[var_name]["name"] = var_name;
			VARIABLES[var_name]["value"] = var_value;
			VARIABLES[var_name]["updated"] = true;
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
	function addInteraction() {
		// get the next step's vars, which is where the new variable values live
		if ((CURRENT_STEP + 1) * 2 + 1 < CONTENTS.length) {
			var nextVars = CONTENTS[(CURRENT_STEP + 1) * 2 + 1].split("\t");
			// if there are updated variables
			var interaction = document.createElement("div");
			if (nextVars.length > 3) {	// vars, not test result
				for (var i = 2; i < nextVars.length; i += 2) {
					var varBox = document.createElement("p");
					$(varBox).text(nextVars[i] + " = ")
							 .css("font-family", "monospace");
					var input = document.createElement("input");
					$(input).attr("type", "text")
							.attr("value", nextVars[i + 1])
							.css("font-size", "12pt");
					$(varBox).append(input);
					$(interaction).append(varBox);
				}
			} else if (nextVars.length > 2) {	// test result, no vars
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
				if (nextVars[2].trim() == "true") {
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
	}

// })();