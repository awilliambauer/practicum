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

	// the final version of this should look about the same
	function fillProblemSpace() {
		var problemText = getProblemText();
		$("#problem_space").text(problemText);
	}

	// this will get the text of the problem from the server...I'm thinking stored in a text file,
	// where we can grab each line separately and put them in a list
	function getProblemText() {
		var text = 
		//"public static void ifElseMystery2(int x, int y) {\n\tint z = 4;\n\n\tif (z <= x) {\n\t\tz = x + 1;\n\t} else {\n\t\tz = z + 9;\n\t}\n\n\tif (z > y) {\n\t\ty++;\n\t} else if (z < y) {\n\t\ty = y - 3;\n\t} else {\n\t\tz = x + y + 7;\n\t}\n\n\tSystem.out.println(z + \" \" + y);\n}";
		return text;
	}

})();