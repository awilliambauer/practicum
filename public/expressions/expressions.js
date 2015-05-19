var arr = [ {type:"int", value : 2, id:""},
			{type:"ASoperator", value: "+", id:""},
			{type:"int", value : 6, id:""}, 
			{type:"MDMoperator", value: "*", id:""},
			{type:"int", value : 3, id:""} ]; 

var arrLeng = 0;

var operator;
var rOperand;
var lOperand;


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
	for(var i = 0; i < arr.length; i++) {
		newHeading.innerHTML += "" + arr[i].value + " ";
	}
}

function arrToString() {
	var arrString = "";
	for(var i = 0; i < arr.length; i++) {
		arrString += "<span id=" + i + ">" + arr[i].value + "</span> ";
	}
	return arrString;
}

/* Put this in step through to find the first operator and operands to set id, then step through does the copying
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
*/


// Figure out how to make spans with the given id, and make it clickable
function stepThrough() {
	clearIds();

	arrLeng = arr.length;

	if (arr.length >= 1) {
		var newChild = document.createElement("div");
		newChild.classList.add("expressionStatement");
		var newChildPara1 = document.createElement("p");
		var newChildPara2 = document.createElement("p");
		newChildPara1.classList.add("step");
		newChildPara2.classList.add("exp");

		newChildPara1.innerHTML = "Click on the next operator";
		//findFirst();
		newChildPara2.innerHTML = arrToString(arr);

		newChild.appendChild(newChildPara1);
		newChild.appendChild(newChildPara2);

		document.getElementById("steps").appendChild(newChild);
		find();
		document.getElementById(operator).onclick = function () {
			newChildPara1.innerHTML = "Click on the left operators";
			document.getElementById(lOperand).onclick = function () {
				newChildPara1.innerHTML = "Click on the right operators";
				document.getElementById(rOperand).onclick = trySubmit;
			};
		}
	}
}

function find() {
		if (arr.length == 1) {
			arr = [];
			document.getElementById("nextstep").classList.add("hiddenSteps");
		} else {
			var flag = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].type == "MDMoperator" && !flag) {
					operator = i;
					lOperand = i - 1;
					rOperand = i + 1;
					flag = true;
				}
			}
			if (!flag) {
				for (var i = 0; i < arr.length; i++) {
					if (arr[i].type == "ASoperator" && !flag) {
						operator = i;
						lOperand = i - 1;
						rOperand = i + 1;
					}
				}
			}
			/*document.getElementById(operator).onclick = function () {
				alert("operator clicked");
			}
			document.getElementById(lOperand).onclick = function () {
				alert("left operand clicked");
			}
			document.getElementById(rOperand).onclick = function () {
				alert("right operand clicked");
			}*/
		}
}

function solve() {
	if (arr.length == 1) {
		arr = [];
		document.getElementById("nextstep").classList.add("hiddenSteps");
	} else {
		var arr2 = [];
		var flag = false;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i].type == "MDMoperator" && !flag) {
				document.getElementById(operator).onclick = findOperand;
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
		/*document.getElementById(operator).onclick = function () {
		 alert("operator clicked");
		 }
		 document.getElementById(lOperand).onclick = function () {
		 alert("left operand clicked");
		 }
		 document.getElementById(rOperand).onclick = function () {
		 alert("right operand clicked");
		 }*/

		arrLeng = arr.length;
		arr = arr2;
	}
}

/*function findOperand() {
	clearIds();

	var newChild = document.createElement("div");
	newChild.classList.add("expressionStatement");
	var newChildPara1 = document.createElement("p");
	var newChildPara2 = document.createElement("p");
	newChildPara1.classList.add("step");
	newChildPara2.classList.add("exp");

	newChildPara1.innerHTML = "Click on the left operators";
	//findFirst();
	newChildPara2.innerHTML = arrToString(arr);

	newChild.appendChild(newChildPara1);
	newChild.appendChild(newChildPara2);

	document.getElementById("steps").appendChild(newChild);

	document.getElementById(lOperand).onclick = function () {
		newChildPara1.innerHTML = "Click on the right operators";
		document.getElementById(rOperand).onclick = trySubmit;
	};
	//document.getElementById(loper).onclick = answer();
}*/

function trySubmit() {
	clearIds();

	var newChild = document.createElement("div");
	newChild.classList.add("expressionStatement");
	var newChildPara1 = document.createElement("p");
	var newChildPara2 = document.createElement("p");
	newChildPara1.classList.add("step");
	newChildPara2.classList.add("exp");

	newChildPara1.innerHTML = "What is the answer?";
	//findFirst();
	newChildPara2.innerHTML = answerToString(arr);

	newChild.appendChild(newChildPara1);
	newChild.appendChild(newChildPara2);

	document.getElementById("steps").appendChild(newChild);
}

function answerToString() {
	var arrString = "";
	for(var i = 0; i < arr.length - 3; i++) {
		arrString += "<span id=" + i + ">" + arr[i].value + "</span> ";
	}
	arrString += "<input type=text id=answer size=5/>"
	return arrString;
}

function clearIds() {
	for (var i = 0; i < arrLeng; i++) {
		var element = document.getElementById(i);
		element.id = "";
	}
}