var arr = [ {type:"int", value : 2, id:""},
			{type:"ASoperator", value: "+", id:""},
			{type:"int", value : 6, id:""}, 
			{type:"MDMoperator", value: "*", id:""},
			{type:"int", value : 3, id:""} ]; 
/*
var arr = [ {type:"int", value : 22},
{type:"MDMoperator", value: "%"},
{type:"int", value : 7}, 
{type:"ASoperator", value: "+"},
{type:"int", value : 4}, 
{type:"MDMoperator", value: "*"},
{type:"int", value : 3}, 
{type:"ASoperator", value: "-"},
{type:"double", value : 21.25}, 
{type:"MDMoperator", value: "/"}, 
{type:"double", value: 8.5} ]; */

window.onload = function() {
	setupPage(arr);	
	document.getElementById("nextstep").onclick = stepThrough;
};

/*
Eventually change this back to original code of just printing in a loop
*/
function setupPage() {
	var newHeading = document.getElementById("expressionHeader");
	newHeading.innerHTML += "" + "<span id=1>" +arr[0].value + "</span>";
	newHeading.innerHTML += "" + "<span id=2>" +arr[1].value + "</span>";
	newHeading.innerHTML += "" + "<span id=3>" +arr[2].value + "</span>";
	newHeading.innerHTML += "" + "<span id=4>" +arr[3].value + "</span>";
	newHeading.innerHTML += "" + "<span id=5>" +arr[4].value + "</span>";
	document.getElementById(5).onclick = stepThrough;
}

function arrToString() {
	var arrString = "";
	for(var i = 0; i < arr.length; i++) {
		var type = arr[i].id;
		arrString += "<span id=" + type + ">" + arr[i].value + "</span>" + " ";
	}
	return arrString;
}

/* Put this in step through to find the first operator and operands to set id, then step through does the copying*/
function findFirst() {
	for (var i = 0; i < arr.length; i++) {
		if (arr[i].type == "MDMoperator") {
			arr[i].id = "operator";
			arr[i-1].id = "leftOperand";
			arr[i+1].id = "rightOperand";
			return;
		}
	}
	arr[1].id = "operator";
	arr[0].id = "leftOperand";
	arr[2].id = "rightOperand";
}


// Figure out how to make spans with the given id, and make it clickable
function stepThrough() {
	if (arr.length >= 1) {
		var newChild = document.createElement("div");
		newChild.classList.add("expressionStatement");
		var newChildPara1 = document.createElement("p");
		var newChildPara2 = document.createElement("p");
		newChildPara1.classList.add("step");
		newChildPara2.classList.add("exp");

		newChildPara1.innerHTML = "Click on the next operator";
		findFirst();
		newChildPara2.innerHTML = arrToString(arr);

		newChild.appendChild(newChildPara1);
		newChild.appendChild(newChildPara2);

		document.getElementById("steps").appendChild(newChild);

		if (arr.length == 1) {
			arr = [];
			document.getElementById("nextstep").classList.add("hiddenSteps");
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
			document.getElementById("operator").onclick = alert("works");	
		}
	}
}