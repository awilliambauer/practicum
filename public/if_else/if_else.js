(function() {
	
	var CONTENTS;
	var CURRENT_STEP;

	$(document).ready(function() {

		CURRENT_STEP = 0;
		getContents();
		fillProblemSpace();
		// this method will need to change, it just loads up the text file
		$("#go_back").click(function() { window.location.href = "../index.html" });
		$("#next").click(goNext);

	});


	// we will just have to replace "example.txt" with whatever file they store the problem
	// text in
	function fillProblemSpace() {
		$.get("example.txt", function(data) {
			var lines = data.split("\n");
			for (var i = 0; i < lines.length; i++) {
				var li = document.createElement("li");
				var liContent = document.createElement("pre");
				$(liContent).text(i + "\t" + lines[i]);
				$(li).append(liContent);
				$("#problem_space").append(li);
			}
			highlightLine(0, "highlight");
			highlightBlock(3, 7);
			highlightBlock(9 ,15);
		});
	}

	function getContents() {
		$.get("prompts.txt", function(data) {
			CONTENTS = data.split("\n");
			$("#prompt").text(CONTENTS[0]);
		});
	}

	function highlightLine(line, highlight) {
		$("#problem_space").children().each(function(index) {
			if (index == line) {
				$(this).children().addClass(highlight);
				return false;
			}
		});
	}

	function highlightBlock(start, end) {
		for (var i = start; i <= end; i++) {
			highlightLine(i, "block_highlight");
		}
	}

	// this will be the method that accesses their js objects...for now, just reading from CONTENTS
	function goNext() {
		CURRENT_STEP++;
		var prompt = CONTENTS[2 * CURRENT_STEP];
		var vars = CONTENTS[2 * CURRENT_STEP + 1].split("\t");
		if (vars[0] == "l") {
			//moveLine();
		}
		$("#prompt").text(prompt);
	}

})();