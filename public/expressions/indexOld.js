var count = 1; // Keep track of what step we are on

window.onload = function() {
	document.getElementById("nextstep").onclick = showSteps;
};

// When next button is clicked, a new div for the steps is shown
function showSteps() {
	var stepNum = "step" + count;
	document.getElementById(stepNum).classList.remove("hiddenSteps");
	document.getElementById(stepNum).classList.add("visibleSteps");
	count = count + 1;
}