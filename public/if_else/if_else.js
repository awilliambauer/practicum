(function() {
	$(document).ready(function() {

		fillProblemSpace();
		$("#go_back").click(function() { window.location.href = "../index.html" });

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

	function highlightLine(line, highlight) {
		console.log("executed highlightLine");
		$("#problem_space").children().each(function(index) {
			console.log(index);			
			if (index == line) {
				$(this).children().addClass(highlight);
				return false;
			}
		});
		console.log("finished executing");
	}

	function highlightBlock(start, end) {
		for (var i = start; i <= end; i++) {
			highlightLine(i, "block_highlight");
		}
	}

})();