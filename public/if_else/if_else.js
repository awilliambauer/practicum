(function() {

	var CONTENTS;
	var CURRENT_STEP;
	var CURRENT_LINE;
	var PROBLEM;
	var VARIABLES;

	$(document).ready(function() {

		CURRENT_STEP = 0;
		CURRENT_LINE = 0;
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
			highlightLine(0, "highlight");
			highlightBlock(3, 7);
			highlightBlock(9 ,15);
		});
	}

	// gets the prompts stored in the prompts.txt file and loads them into memory,
	// this will be replaced when we hook up to the backend
	function getContents() {
		$.get("prompts.txt", function(data) {
			CONTENTS = data.split("\n");
			$("#prompt").text(CONTENTS[0]);
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

	// gives the given lines the specific "block_highlight" class
	function highlightBlock(start, end) {
		for (var i = start; i <= end; i++) {
			highlightLine(i, "block_highlight");
		}
	}

	// increments the step we're currently on and changes the prompt/highlighting
	// accordingly
	function goNext() {
		CURRENT_STEP++;
		var prompt = CONTENTS[2 * CURRENT_STEP];
		var vars = CONTENTS[2 * CURRENT_STEP + 1].split("\t");
		//console.log("vars = " + vars);
		var updated_vars = vars.slice(2, vars.length) // get all of the variables changed in this line
		updateVariables(updated_vars);
		var line = vars[0] - 1;
		var crossout;
		console.log("line was: " + (CURRENT_LINE + 1) + ", moved to: " + (line + 1));
		if (line != CURRENT_LINE) {
			movePrompt(line - CURRENT_LINE);
			CURRENT_LINE = line;
			moveLine();
		}
		$("#prompt").text(prompt);
		if (vars.length > 1) {
			crossout = vars[1];
		}
		drawVariableBank();
	}

	// moves the prompt a given number of lines down the page
	function movePrompt(lines) {
		$("#prompt").finish();
		var currentTop = $("#prompt").css("top");
		currentTop = parseInt(currentTop.substring(0, currentTop.length - 2));
		var lineHeight = $("ul > li").css("height");
		lineHeight = parseInt(lineHeight.substring(0, lineHeight.length - 2));
		$("#prompt").animate({top: currentTop + lines * (lineHeight) + "px"});
	}

	// changes the highlighted line to the given line number of the problem
	function moveLine() {
		highlightLine(CURRENT_LINE, "highlight");
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

		for (var variable_name in VARIABLES) {
			var variable = VARIABLES[variable_name];
			var variable_span = document.createElement("span");
			$(variable_span).addClass("bank_variable");
			$(variable_span).text(variable["name"]);

			var value_span = document.createElement("span");
			$(value_span).text(variable["value"]);

			if (variable["updated"]) {
				$(value_span).addClass("just_updated_value");
				variable["updated"] = false;
			} else {
				$(value_span).addClass("bank_variable_value");
			}

			var li = document.createElement("li");
			$(li).append(variable_span);
			$(li).append("\t");
			$(li).append(value_span);

			$("#variable_list").append(li);
		}
	}

})();