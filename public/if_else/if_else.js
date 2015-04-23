(function() {
	
	var CONTENTS;
	var CURRENT_STEP;
	var CURRENT_LINE;
	var PROBLEM;

	$(document).ready(function() {

		CURRENT_STEP = 0;
		CURRENT_LINE = 0;
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
			CURRENT_LINE = line;
			moveLine(vars);
		}
		$("#prompt").text(prompt);
		if (vars.length > 1) {
			crossout = vars[1];
		}
		OLD_VARS = vars;
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

})();