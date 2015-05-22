/*
The file creates all interactivity for the webpage.

 */
(function() {

	/*var arr = [ {type:"int", value : 2, id:""},
	 	{type:"ASoperator", value: "+", id:""},
	 	{type:"int", value : 6, id:""},
	 	{type:"MDMoperator", value: "*", id:""},
	 	{type:"int", value : 3, id:""} ];*/

	var arr = [{type: "int", value: 22},
		{type: "MDMoperator", value: "%"},
		{type: "int", value: 7},
		{type: "ASoperator", value: "+"},
		{type: "int", value: 4},
		{type: "MDMoperator", value: "*"},
		{type: "int", value: 3},
		{type: "ASoperator", value: "-"},
		{type: "double", value: 21.25},
		{type: "MDMoperator", value: "/"},
		{type: "double", value: 8.5}];

	var arrLeng = 0;
	var started = false;
	var newChildPara;
	var overallAnswer = 10.5; // for right now I have the overall answer writen here
							  // for people wanting to submit immediately.

	var operator;
	var rOperand;
	var lOperand;


	var arr = [{type: "int", value: 22},
		{type: "MDMoperator", value: "%"},
		{type: "int", value: 7},
		{type: "ASoperator", value: "+"},
		{type: "int", value: 4},
		{type: "MDMoperator", value: "*"},
		{type: "int", value: 3},
		{type: "ASoperator", value: "-"},
		{type: "double", value: 21.25},
		{type: "MDMoperator", value: "/"},
		{type: "double", value: 8.5}];

	window.onload = function () {
		setupPage(arr);
		document.getElementById("submit").onclick = correct;
		var next = document.getElementById("nextstep");
		next.disabled = false;
		next.onclick = stepThrough;
	};

	// Displays for the user if the answer is right or wrong.
	function correct() {
		var clientAnswer = document.getElementById("box");
		var answerPrompt = document.getElementById("correct");
		if (answerPrompt === null) {
			answerPrompt = document.createElement("div");
			answerPrompt.setAttribute("id", "correct");
		}
		if (clientAnswer.value == overallAnswer) {
			answerPrompt.innerHTML = "Correct!";
			document.getElementById("submit").style.visibility = "hidden";
			document.getElementById("nextstep").style.visibility = "hidden";
		} else {
			answerPrompt.innerHTML = "Oops, sorry wrong answer.";
		}
		document.getElementById("answerbox").appendChild(answerPrompt);
	}

	/*
	 Eventually change this back to original code of just printing in a loop
	 */
	function setupPage() {
		var newHeading = document.getElementById("expressionHeader");
		for (var i = 0; i < arr.length; i++) {
			newHeading.innerHTML += "" + arr[i].value + " ";
		}
	}

	// turns expression to a string.
	function arrToString() {
		var arrString = "";
		for (var i = 0; i < arr.length; i++) {
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


	// This starts the solving process, for right now the person can't try to submit
	// after starting the stepThrough.
	function stepThrough() {

		arrLeng = arr.length;

		// gets rid of failed statment if they tried to submit an answer
		if (document.getElementById("correct") !== null) {
			var answerbox = document.getElementById("answerbox");
			answerbox.removeChild(answerbox.lastChild);
		}

		// gets rid of submit button, chances next button text
		// and creates the steps div to put everything in.
		if (!started) {
			document.getElementById("submit").style.visibility = "hidden";
			document.getElementById("nextstep").innerHTML = "Next";
			var newChild = document.createElement("div");
			newChild.setAttribute("id", "steps");
			document.getElementById("stepshell").appendChild(newChild);

			started = true;

			var newChild2 = document.createElement("div");
			newChild2.classList.add("prompt");
			newChild2.innerHTML = "Before we start solving any part of the problem we " +
			"always need to find the first operator to be evaluated. Remember always look " +
			"from left to right.";
			newChild.appendChild(newChild2);
		}


		if (arr.length >= 1) {
			newChild = document.createElement("div");
			newChild.classList.add("expressionStatement");
			newChildPara = document.createElement("p");
			var newChildPara2 = document.createElement("p");
			newChildPara.classList.add("step");
			newChildPara2.classList.add("exp");

			newChildPara.innerHTML = "Click on the next operator";
			//findFirst();
			newChildPara2.innerHTML = arrToString(arr);

			newChild.appendChild(newChildPara);
			newChild.appendChild(newChildPara2);

			document.getElementById("steps").appendChild(newChild);
			document.getElementById("steps").style.visability = "visable";
			document.getElementById("nextstep").disabled = true;

			find();

			// makes all the other spans clickable but if they are clicked
			// and not the right answer they get to go the wrongOption.
			for (var i = 0; i < arr.length; i++) {
				if (i != operator) {
					document.getElementById(i).onclick = wrongOperator;
				}
			}

			document.getElementById(operator).onclick = findLeft;
		}
	}

	// for if you click the wrong operator, it tells you then continues steps
	function wrongOperator() {
		var error = document.createElement("div");
		error.setAttribute("id", "error");
		error.innerHTML = "Oops the real operator is the left most " + arr[operator].value
		+ ", but lets keep going by finding the left operand";
		document.getElementById("steps").appendChild(error);
		findLeft();
	}

	// prompts you to click the left operand.
	function findLeft() {
		document.getElementById(operator).classList.add('clicked');
		newChildPara.innerHTML = "Now click on the left operand";
		newChildPara.style.color = "#45ADA8";

		// makes all the other spans clickable but if they are clicked
		// and not the right answer they get to go the wrongOption.
		for (var i = 0; i < arr.length; i++) {
			if (i != lOperand) {
				document.getElementById(i).onclick = wrongLeft;
			}
		}
		document.getElementById(lOperand).onclick = findRight;
	}

	// prompts you to click the left operand.
	function findRight() {
		document.getElementById(lOperand).classList.add('clicked');
		newChildPara.innerHTML = "Now click on the right operand";
		newChildPara.style.color = "#547980";

		// makes all the other spans clickable but if they are clicked
		// and not the right answer they get to go the wrongOption.
		for (var i = 0; i < arr.length; i++) {
			if (i != rOperand) {
				document.getElementById(i).onclick = wrongRight;
			}
		}
		document.getElementById(rOperand).onclick = trySubmit;
	}

	// for if you click the wrong left operand, it tells you then continues steps
	function wrongLeft() {
		var error = document.getElementById("error");
		if (error === null) {
			error = document.createElement("div");
			error.setAttribute("id", "error");
		}

		error.innerHTML = "Oops the real left operand is " + arr[lOperand].value
		+ ", but lets keep going by finding the right operand";
		document.getElementById("steps").appendChild(error);

		findRight();
	}

	// for if you click the wrong right operand, it tells you then continues steps
	function wrongRight() {
		document.getElementById("nextstep").disabled = false;
		var error = document.getElementById("error");

		if (error === null) {
			error = document.createElement("div");
			error.setAttribute("id", "error");
		}

		error.innerHTML = "Oops the real right operand is " + arr[rOperand].value
		+ ", but lets keep going click the next button.";
		document.getElementById("steps").appendChild(error);

		document.getElementById("nextstep").onclick = trySubmit;
	}

	// Finds the operator, left operand and right operand.
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
						flag = true;
					}
				}
			}
		}
	}

	// solves and updates expression, needs to be trimped since find does
	// a lot of the work.
	function solve() {
		if (arr.length == 1) {
			arr = [];
			document.getElementById("nextstep").classList.add("hiddenSteps");
		} else {
			var arr2 = [];
			var flag = false;
			for (var i = 0; i < arr.length; i++) {
				if (arr[i].type == "MDMoperator" && !flag) {
					//document.getElementById(operator).onclick = findOperand;
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

			arrLeng = arr.length;
			arr = arr2;
		}
	}

	// prompts the user to solve a portion of the problem
	function trySubmit() {
		if (document.getElementById("error") !== null) {
			var steps = document.getElementById("steps");
			steps.removeChild(steps.lastChild);
		}
		document.getElementById("nextstep").disabled = false;
		document.getElementById(rOperand).classList.add('clicked');
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

		document.getElementById("nextstep").onclick = processAnswer;
	}

	// prosses user's answer, tells them whether it's right or wrong and then continues.
	function processAnswer() {
		var clientAnswer = document.getElementById("answer");
		solve();
		var newChild = document.createElement("div");
		newChild.classList.add("prompt");

		if (clientAnswer.value == arr[lOperand].value && arr.length > 1) {
			newChild.innerHTML = "Great Job! Click Next to continue.";
		} else if (clientAnswer.value == arr[lOperand].value && arr.length <= 1) {
			newChild.innerHTML = "Great Job!";
		} else {
			newChild.innerHTML = "Oops, sorry the answer was " + arr[lOperand].value
			+ " but lets keep going!";
		}

		document.getElementById("steps").appendChild(newChild);

		if (arr.length <= 1) {
			var newChild = document.createElement("div");
			newChild.classList.add("finalanswer");
			newChild.innerHTML = "That why the answer is " + arr[lOperand].value;
			document.getElementById("answerbox").appendChild(newChild);
			document.getElementById("nextstep").style.visibility = "hidden";
		} else {
			document.getElementById("nextstep").onclick = stepThrough;
			clientAnswer.id = "";
		}
	}

	// creates the answer box in a sting.
	function answerToString() {
		var arrString = "";
		for (var i = 0; i < arr.length; i++) {
			if (i == lOperand) {
				arrString += "<input type=text id=answer size=1/> "
				i += 2;
			} else {
				arrString += arr[i].value + " ";
			}
		}
		return arrString;
	}

	// clears old ids so not to get them mixed up with the new ones.
	function clearIds() {
		for (var i = 0; i < arrLeng; i++) {
			var element = document.getElementById(i);
			element.id = "";
		}
	}
}) ();