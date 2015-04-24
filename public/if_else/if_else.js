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
		//console.log("vars = " + vars);
		var updated_vars = vars.slice(2, vars.length) // get all of the variables changed in this line
		updateVariables(updated_vars);
		// if vars contains variables
		var line = vars[0] - 1;
		var crossout;
		console.log("line was: " + (CURRENT_LINE + 1) + ", moved to: " + (line + 1));
		if( vars.length > 2) {
			console.log("comment being added");
			addComment(vars);
		}
		if (line != CURRENT_LINE) {
			console.log(vars.length);
			movePrompt(line - CURRENT_LINE);
		// don't do this the first time
		if (line != CURRENT_LINE && line != -1) {
			movePrompt(line);
			CURRENT_LINE = line;
			highlightBlock(0, CURRENT_LINE - 1, "grey_out");
			highlightLine(CURRENT_LINE, "highlight");
		}
		$("#prompt").text(prompt);
		if (vars.length > 1 && vars[1].trim() != "") {
			crossout = vars[1].split(",");
			console.log(vars);

			for (var i = 0; i < crossout.length; i++) {
				highlightLine(crossout[i] - 1, "cross_out");
			}
		}
		drawVariableBank();
		OLD_VARS = vars;
	}

	// moves the prompt to the given line
	function movePrompt(line) {
		$("#prompt").finish();
		var currentTop = $("#prompt").css("top");
		currentTop = parseInt(currentTop.substring(0, currentTop.length - 2));
		var lineHeight = $("ul > li").css("height");
		lineHeight = parseInt(lineHeight.substring(0, lineHeight.length - 2));
		$("#prompt").animate({top: currentTop + (line - CURRENT_LINE) * (lineHeight) + "px"});
		$("#prompt").animate({top: currentTop + lines * (lineHeight) + "px"});
	}

	// changes the highlighted line to the given line number of the problem
	function moveLine() {
		highlightLine(CURRENT_LINE, "highlight");
	}

	// accepts an array of Strings
	function addComment(vars) {
		var comment = document.createElement("span");
		$(comment).addClass("comments");
		console.log(vars.toString());
		console.log(vars.length);
		if (vars.length == 3) { // Is true/false
			$(comment).text("\t// " + vars[2]);
		} else { // Is variable change
			console.log("going into else statement");
			for(var i = 2; i < vars.length; i += 2) {
				$(comment).text("\t//" + vars[i] + " = " + vars[i + 1]);
			}
			console.log("\t//" + vars[i] + " = " + vars[i + 1]);
		}
		console.log(comment);
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