var arr = [ {type:"int", value : 2},
			{type:"ASoperator", value: "+"},
			{type:"int", value : 6}, 
			{type:"MDMoperator", value: "*"},
			{type:"int", value : 3} ];

window.onload = function() {
	setupPage(arr);	
	document.getElementById("nextstep").onclick = stepThrough;
};

function setupPage() {
	var newHeading = document.getElementById("expressionHeader");
	for(var i = 0; i < arr.length; i++) {
		newHeading.innerHTML += "" + arr[i].value + " ";
	}
}

function arrToString() {
	var arrString = "";
	for(var i = 0; i < arr.length; i++) {
		arrString += arr[i].value + " ";
	}
	return arrString;
}

function stepThrough() {
	if (arr.length >= 1) {
		var newChild = document.createElement("div");
		newChild.classList.add("expressionStatement");
		var newChildPara1 = document.createElement("p");
		var newChildPara2 = document.createElement("p");
		newChildPara1.classList.add("step");
		newChildPara2.classList.add("exp");
		newChildPara1.innerHTML = "IT WORKS!!";
		newChildPara2.innerHTML = arrToString(arr);
		newChild.appendChild(newChildPara1);
		newChild.appendChild(newChildPara2);
		document.getElementById("steps").appendChild(newChild);
		if (arr.length == 1) {
			arr = [];
		} else {
			var arr2 = [];
			var flag = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].type == "MDMoperator" && !flag) {
					if (arr[i].value == "*") {
						arr2[i - 1].value = arr[i - 1].value * arr[i + 1].value; 
					} else if (arr[i].value == "/") {
						arr2[i - 1].value = (arr[i - 1].value / arr[i + 1].value);
					} else if (arr[i].value == "%") {
						arr2[i - 1].value = arr[i - 1].value % arr[i + 1].value;
					}
					flag = true;
					i++;
				} else {
					arr2.push(arr[i]);
				}
			}
			if (!flag) {
				arr2 = [];
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].type == "ASoperator" && !flag) {
						if (arr[i].value == "+") {
							arr2[i - 1].value = arr[i - 1].value + arr[i + 1].value; 
						} else if (arr[i].value == "-") {
							arr2[i - 1].value = (arr[i - 1].value - arr[i + 1].value);
						} 
						flag = true;
						i++;
					} else {
						arr2.push(arr[i]);
					}
				}
			}
			arr = arr2;	
			document.getElementById("nextstep").onclick = stepThrough;
		}
	}
}