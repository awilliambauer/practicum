(function() {

	var CONTENTS;
	var CURRENT_STEP;
	var CURRENT_LINE;
	var PROBLEM;
	var VARIABLES;

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
		$.get("example.txt", function(data) {
			PROBLEM = data.split("\n");
			for (var i = 0; i < PROBLEM.length; i++) {
				var li = document.createElement("li");
				var liContent = document.createElement("pre");
				$(liContent).text(i + 1 + "\t" + PROBLEM[i]);
				$(li).append(liContent);
				$("#problem_space").append(li);
			}
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
		$("#problem_space").children().each(function(index) {
			if (index == line) {
				$(this).children().addClass(highlight);
			} else if (highlight == "highlight") {
				$(this).children().removeClass(highlight);
			}
		});
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

		// some initialization stuff that happens on first click of next
		if (CURRENT_STEP == 0) {
			// show previously invisible prompt
			$("#prompt").show();
			// highlighting all the stuff
			highlightBlock(3, 7, "block_highlight");
			highlightBlock(9 ,15, "block_highlight");
		}

		CURRENT_STEP++;
		var prompt = CONTENTS[2 * CURRENT_STEP];
		var vars = CONTENTS[2 * CURRENT_STEP + 1].split("\t");
		var updated_vars = vars.slice(2, vars.length) // get all of the variables changed in this line

		// if vars contains variables or true/false
		var line = vars[0] - 1;
		var crossout;

		// Only updates if vars contains variables
		if (vars.length > 3) {
			updateVariables(updated_vars);
		}
		if (vars.length > 2) {
			addComment(vars);
		}
		// don't do this the first time
		if (line != CURRENT_LINE && line != -1) {
			movePrompt(line);
			CURRENT_LINE = line;
			highlightBlock(0, CURRENT_LINE - 1, "grey_out");
			highlightLine(CURRENT_LINE, "highlight");
		}
		$("#prompt").text(prompt);
		addInteraction(vars);
		if (vars.length > 1 && vars[1].trim() != "") {
			crossout = vars[1].split(",");
			for (var i = 0; i < crossout.length; i++) {
				highlightLine(crossout[i] - 1, "cross_out");
			}
		}
		drawVariableBank();
		OLD_VARS = vars;
	}

	// moves the prompt to the given line
	function movePrompt(line) {
		// stops any current animation in case of spam clicking "next"
		$("#prompt").finish();
		var currentTop = $("#prompt").css("top");
		currentTop = parseInt(currentTop.substring(0, currentTop.length - 2));
		var lineHeight = $("#problem_space > li").css("height");
		lineHeight = parseInt(lineHeight.substring(0, lineHeight.length - 2));
		$("#prompt").animate({top: currentTop + (line - CURRENT_LINE) * (lineHeight) + "px"});
	}

	// accepts an array of Strings
	function addComment(vars) {
		var comment = document.createElement("span");
		$(comment).addClass("comments");
		if (vars.length == 3) { // Is true/false
			$(comment).text("\t// " + vars[2]);
		} else { // Is variable change
			var variable_comments = "\t// ";
			for (var variable_name in VARIABLES) {
				var variable = VARIABLES[variable_name];
				console.log("variable[name] + \" = \" + variable[value]");
				variable_comments += variable["name"] + " = " + variable["value"] + ", ";
			}
			//removes trailing comma
			variable_comments = variable_comments.substr(0, variable_comments.length - 2);
			$(comment).text(variable_comments);
		}
		$(".highlight").append(comment);
		/*
		$("#problem_space").children().each(function(index) {
			if (index == line) {
				$(this).children.().append(comment);
			}
		});*/

	}

	function updateVariables(vars) {
		for (i = 0; i < vars.length; i += 2) {
			var_name = vars[i];
			var_value = vars[i + 1];
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
							.attr("value", nextVars[i + 1]);
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
			$("#prompt").append(interaction);
		}
	}

})();