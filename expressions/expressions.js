window.onload = function() {
	for (var i = 1; i <= 9; i++) {
		document.getElementById("nextstep").onclick = showSteps(i);
	}
};

function showSteps(stepCount) {
	var stepNum = "step" + stepCount;
	alert(stepNum);
	document.getElementById(stepNum).classList.remove("hiddenSteps");
	document.getElementById(stepNum).classList.add("visibleSteps");
}