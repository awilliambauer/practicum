(function() {
	$(document).ready(function() {

		fillPageNums();
		fillProblemSpace();

	});

	// will need to determine how many lines there are of the problem and plug that into numLines
	function fillPageNums() {
		var nums = "";
		var numLines = 20;
		for (var i = 0; i < numLines; i++) {
			nums += i + "\n";	
		}
		$("#line_nums").text(nums);
	}

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
		});
	}

})();