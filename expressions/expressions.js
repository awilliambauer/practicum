window.onload = function() {
	document.getElementById("nextstep").onclick = showSteps;
};

function showSteps() {
	document.getElementById("steps").classList.remove("hiddenSteps");
	document.getElementById("steps").classList.add("visibleSteps");
}