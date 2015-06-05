/*
 The file creates all interactivity for the webpage.
 */

(function() {

	// easy problem state object
	/*var startArray = [ {type:"String", value : "hello"},
	 {type:"ASoperator", value: "+"},
	 {type:"int", value : 6},
	 {type:"MDMoperator", value: "*"},
	 {type:"int", value : 3}];*/

	// state object
	/* Currently only the messages come from the state object, 
	 since we store the array and index as global variables that are updated as the state object is updated.
	 To completely rely on the state object, yu need to find/replace MOST
	 arr with stateObject[stateObject.length - 1][0]
	 */
	var stateObject = new Array();

	// tougher problem state object
	var startArray = [{type: "int", value: 22},
		{type: "MDMoperator", value: "%"},
		{type: "int", value: 7},
		{type: "ASoperator", value: "+"},
		{type: "int", value: 4},
		{type: "MDMoperator", value: "*"},
		{type: "int", value: 3},
		{type: "ASoperator", value: "-"},
		{type: "double", value: 6.0},
		{type: "MDMoperator", value: "/"},
		{type: "double", value: 2}];

	// boolean that represents whether showing steps has started
	// if not started, then use startArray
	// if started, then use arrays in stateObject
	var started = false;

	// overall answer for checking answer submission
	var overallAnswer = "10.0";

	// true - with interactivity, false - without interactivity
	var interaction = true;

	// on load, shows expression, answer box, submit button, and show steps button
	window.onload = function () {
		var newHeading = document.getElementById("expressionHeader");
		setupPage(newHeading);
		document.getElementById("submit").onclick = correct;
		var next = document.getElementById("nextstep");
		next.disabled = false;
		if(interaction) {
			next.onclick = stepThrough;
		} else {
			next.onclick = walkThrough;
		}
	};

	function walkThrough() {
		document.getElementById("dummy").scrollIntoView();

		// gets rid of submit button, changes next button text
		// and creates the steps div to put everything for step through.
		if (!started) {
			document.getElementById("submit").style.visibility = "hidden";
			document.getElementById("nextstep").innerHTML = "Next";
			var newChild = document.createElement("div");
			newChild.setAttribute("id", "steps");
			document.getElementById("stepshell").appendChild(newChild);

			var newChild2 = document.createElement("div");
			newChild2.classList.add("prompt");
			newChild2.innerHTML = "Start by evaluating all the Multiplicative (* / %) operators from left to right. <br /> Then evaluate " +
			"the Additive (+ -) operators from left to right.";
			newChild.appendChild(newChild2);
		}

		// finds and set the indices for the operator, left operand, and right operand
		if (!started || stateObject[stateObject.length - 1][0].length > 1) {
			find();
		}

		// this will prompt the user every time to ask what type
		// of operator the student should start with.
		
		var firstStep = document.createElement("div");
		firstStep.setAttribute("id", "firststep");
		firstStep.classList.add("expressionStatement");

		var prompt = document.createElement("p");
		var expressionPrint = document.createElement("div");
		prompt.classList.add("step");
		expressionPrint.classList.add("exp");

		clearIds(expressionPrint);
		prompt.innerHTML = stateObject[stateObject.length -1][2].message + "<div>&nbsp;</div>";
		
		firstStep.appendChild(prompt);
		firstStep.appendChild(expressionPrint);

		document.getElementById("steps").appendChild(firstStep);
		var operators = document.querySelectorAll(".operators");
		
		if (stateObject[stateObject.length - 1][0].length > 1) {
			solve();
		} else {
			document.getElementById("nextstep").classList.add("hiddenSteps");
		}
	}

	// If they submitted an answer (not show steps view), 
	// displays if user's answer is correct or not.
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

	// Display the original expression on load
	function setupPage(newHeading) {
		for (var i = 0; i < startArray.length; i++) {
			newHeading.innerHTML += getValue(i) + " ";
		}
	}

	// Turns expression to a string
	function arrToString() {
		var arrString = "";
		for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
			arrString += "<span id=" + i + ">" + getValue(i) + "</span> ";
		}
		return arrString;
	}

	// This starts the solving process, for right now the person can't try to submit
	// after starting the stepThrough.
	function stepThrough() {
		// gets rid of failed statment if they tried to submit an answer
		if (document.getElementById("correct") !== null) {
			var answerbox = document.getElementById("answerbox");
			answerbox.removeChild(answerbox.lastChild);
		}

		// gets rid of the reply from the last text box inserted.
		var reply = document.getElementById("reply");
		if (reply !== null) {
			document.getElementById("steps").removeChild(reply);
		}


		// gets rid of submit button, changes next button text
		// and creates the steps div to put everything for step through.
		if (!started) {
			document.getElementById("submit").style.visibility = "hidden";
			document.getElementById("nextstep").innerHTML = "Next";
			var newChild = document.createElement("div");
			newChild.setAttribute("id", "steps");
			document.getElementById("stepshell").appendChild(newChild);

			var newChild2 = document.createElement("div");
			newChild2.classList.add("prompt");
			newChild2.innerHTML = "Start by evaluating all the Multiplicative (* / %) operators from left to right. <br /> Then evaluate " +
			"the Additive (+ -) operators from left to right.";
			newChild.appendChild(newChild2);
		}

		document.getElementById("dummy").scrollIntoView();
		// finds and set the indices for the operator, left operand, and right operand
		// has click operator message
		find();

		var arr = stateObject[stateObject.length - 1][0];
		// this will prompt the user every time to ask what type
		// of operator the student should start with.
		if (arr.length >= 1) {
			document.getElementById("nextstep").disabled = true;

			var firstStep = document.createElement("div");
			firstStep.setAttribute("id", "firststep");
			firstStep.classList.add("expressionStatement");

			var prompt = document.createElement("p");
			var buttons = document.createElement("div");
			prompt.classList.add("step");
			buttons.classList.add("exp");

			var mdmOperator = document.createElement("button");
			var asOperator = document.createElement("button");
			mdmOperator.setAttribute("id", "MDMoperator");
			mdmOperator.classList.add("operators");
			asOperator.setAttribute("id", "ASoperator");
			asOperator.classList.add("operators");
			mdmOperator.innerHTML = "* / %";
			asOperator.innerHTML = "+ -";
			prompt.innerHTML = "What type of operator are we going to use?";

			buttons.appendChild(mdmOperator);
			buttons.appendChild(asOperator);

			firstStep.appendChild(prompt);
			firstStep.appendChild(buttons);

			document.getElementById("steps").appendChild(firstStep);
			var operators = document.querySelectorAll(".operators");
			for (var i = 0; i < operators.length; i++) {
				if (operators[i].id == arr[stateObject[stateObject.length - 1][1].index].type) {
					operators[i].onclick = findOperator;
				} else {
					operators[i].onclick = wrongButton;
				}
			}
		}
	}

	// If the student click on the wrong type of operator button.
	// tells them its wrong and prompts them to continue.
	function wrongButton() {

		var error = document.createElement("div");
		error.setAttribute("id", "error");
		var arr = stateObject[stateObject.length - 1][0];
		var operator = stateObject[stateObject.length - 1][1].index;

		var message = "We need to start by looking for ";
		if (arr[operator].type == "MDMoperator") {
			document.getElementById("ASoperator").disabled = true;
			message += "Multiplication, Division, or Mod operators before we do " +
			"a Addition or Subtraction operator, click the *	/	% button";
		} else {
			document.getElementById("MDMoperator").disabled = true;
			message += "Addition or Subtraction because there are no " +
			"Multiplication, Division, or Mod operators left, click the +	- button";
		}
		error.innerHTML = message;

		document.getElementById("steps").appendChild(error);
		document.getElementById("nextstep").onclick = findOperator;
	}

	// Prompts the user to find and click the operator.
	function findOperator() {
		if (document.getElementById("error") !== null) {
			document.getElementById("steps").removeChild(document.getElementById("error"));
		}
		document.getElementById("steps").removeChild(document.getElementById("firststep"));
		var newChild = document.createElement("div");
		newChild.classList.add("expressionStatement");
		var messageParagraph = document.createElement("p");
		var expressionParagraph = document.createElement("p");
		messageParagraph.classList.add("step");
		expressionParagraph.classList.add("exp");

		messageParagraph.innerHTML = stateObject[stateObject.length - 1][2].message;

		//findFirst();
		expressionParagraph.innerHTML = arrToString();

		newChild.appendChild(messageParagraph);
		newChild.appendChild(expressionParagraph);

		document.getElementById("steps").appendChild(newChild);
		document.getElementById("steps").style.visability = "visable";

		find();
		var operator = stateObject[stateObject.length - 1][1].index;

		// makes all the other spans clickable but if they are clicked
		// and not the right answer they get to go the wrongOption.
		for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
			if (i != operator) {
				document.getElementById(i).onclick = wrongOperator;
			}
		}

		document.getElementById(operator).onclick = findLeft;
	}

	// for if you click the wrong operator, it tells you then continues steps
	function wrongOperator() {
		var error = document.getElementById("error");
		if (error === null) {
			error = document.createElement("div");
			error.setAttribute("id", "error");
		}
		var arr = stateObject[stateObject.length - 1][0];
		var operator = stateObject[stateObject.length - 1][1].index;
		error.innerHTML = "Oops the correct operator is the left most " + arr[operator].value
		+ ", but lets keep going by finding the left operand";
		document.getElementById("steps").appendChild(error);
		findLeft();
	}

	// prompts you to click the left operand.
	function findLeft() {
		document.getElementById(stateObject[stateObject.length - 1][1].index).classList.add('clicked');
		// update state object
		findLeftOperand();
		var messageParagraphs = document.querySelectorAll(".step");
		var lastMessage = messageParagraphs.length - 1;
		messageParagraphs[lastMessage].innerHTML = stateObject[stateObject.length - 1][2].message;
		messageParagraphs[lastMessage].style.color = "#45ADA8";

		var left = stateObject[stateObject.length - 1][1].index;
		// makes all the other spans clickable but if they are clicked
		// and not the right answer they get to go the wrongOption.
		for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
			if (i != left) {
				document.getElementById(i).onclick = wrongLeft;
			}
		}
		document.getElementById(left).onclick = findRight;
	}

	// prompts you to click the right operand.
	function findRight() {
		document.getElementById(stateObject[stateObject.length - 1][1].index).classList.add('clicked');
		// update state object
		findRightOperand();
		var messageParagraphs = document.querySelectorAll(".step");
		var lastMessage = messageParagraphs.length - 1;
		messageParagraphs[lastMessage].innerHTML = stateObject[stateObject.length - 1][2].message;
		messageParagraphs[lastMessage].style.color = "#547980";

		var right = stateObject[stateObject.length - 1][1].index;
		// makes all the other spans clickable but if they are clicked
		// and not the right answer they get to go the wrongOption.
		for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
			if (i != right) {
				document.getElementById(i).onclick = wrongRight;
			}
		}
		document.getElementById(right).onclick = trySubmit;
	}

	// for if you click the wrong left operand, it tells you then continues steps
	function wrongLeft() {
		var error = document.getElementById("error");
		if (error === null) {
			error = document.createElement("div");
			error.setAttribute("id", "error");
		}
		var left = stateObject[stateObject.length - 1][1].index;
		error.innerHTML = "Oops the correct left operand is " + getValue(left)
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
		var right = stateObject[stateObject.length - 1][1].index;
		error.innerHTML = "Oops the correct right operand is " + getValue(right)
		+ ", but lets keep going click the next button.";
		document.getElementById("steps").appendChild(error);
		document.getElementById(right).classList.add('clicked');

		document.getElementById("nextstep").onclick = trySubmit;
	}

	// prompts the user to solve a portion of the problem
	// mini expression piece
	function trySubmit() {
		document.getElementById("dummy").scrollIntoView();

		if (document.getElementById("error") !== null) {
			var steps = document.getElementById("steps");
			steps.removeChild(steps.lastChild);
		}
		var next = document.getElementById("nextstep");
		next.innerHTML = "Check";
		next.disabled = false;

		var expressionParagraphs = document.querySelectorAll(".exp");
		clearIds(expressionParagraphs[expressionParagraphs.length - 1]);

		var newChild = document.createElement("div");
		newChild.classList.add("expressionStatement");
		var messageParagraph = document.createElement("p");
		var expressionParagraph = document.createElement("p");
		messageParagraph.classList.add("step");
		expressionParagraph.classList.add("exp");

		// update state object
		solve();

		messageParagraph.innerHTML = stateObject[stateObject.length - 1][2].message;
		//findFirst();
		expressionParagraph.innerHTML = answerToString();

		newChild.appendChild(messageParagraph);
		newChild.appendChild(expressionParagraph);

		document.getElementById("steps").appendChild(newChild);

		next.onclick = processAnswer;
	}

	// prosses user's answer for solving mini expression, 
	// tells them whether it's right or wrong and then continues.
	function processAnswer() {
		var clientAnswer = document.getElementById("answer");

		var newChild = document.createElement("div");
		newChild.setAttribute("id", "reply");
		
		var arr = stateObject[stateObject.length - 1][0];
		var operator = stateObject[stateObject.length - 1][1].index;

		// check if answer is correct
		var correct = false;
		if (arr[operator].type == 'double' && arr[operator].value % 1 == 0) {
			if (clientAnswer.value == (arr[operator].value + ".0")) {
				correct = true;
			}
		} else if (arr[operator].type == 'String') {
			if (clientAnswer.value == ("\"" + arr[operator].value + "\"")) {
				correct = true;
			}
		} else if (clientAnswer.value == arr[operator].value) {
			correct = true;
		}

		// give response based on correct/incorrect answer
		if (correct && arr.length > 1) {
			newChild.innerHTML = "Great Job! Click Next to continue.";
		} else if (correct && arr.length <= 1) {
			newChild.innerHTML = "Great Job!";
		} else {
			clientAnswer.style.color = "red";
			newChild.innerHTML = "Oops, sorry the answer was " + getValue(operator)
			+ " but lets keep going!";
		}

		document.getElementById("steps").appendChild(newChild);
		var next = document.getElementById("nextstep");
		next.innerHTML = "Next";

		if (arr.length <= 1) {
			var newChild = document.createElement("div");
			newChild.classList.add("finalanswer");
			newChild.innerHTML = "That's why the answer is " + getValue(operator);
			document.getElementById("answerbox").appendChild(newChild);
			next.style.visibility = "hidden";
		} else {

			next.onclick = function () {
				clientAnswer.style.color = "black";
				clientAnswer.value = getValue(operator);
				stepThrough();
			}
			clientAnswer.id = "";
		}
	}

	// gets the value at a particular index
	// formats it based on int/double/String type
	function getValue(index) {
		var arr;
		if (!started) {
			arr = startArray;
		} else {
			arr = stateObject[stateObject.length - 1][0];
		}
		if (arr[index].type == 'double' && arr[index].value % 1 == 0) {
			return arr[index].value + ".0";
		} else if (arr[index].type == 'String') {
			return "\"" + arr[index].value + "\"";
		} else {
			return arr[index].value;
		}
	}

	// creates the answer box in a string.
	function answerToString() {
		var arrString = "";
		for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
			if (i == stateObject[stateObject.length - 1][1].index) {
				arrString += "<input type=text id=answer size=1/> "
			} else {
				arrString += getValue(i) + " ";
			}
		}
		return arrString;
	}

	// clears old ids so not to get them mixed up with the new ones.
	function clearIds(expressionPara) {
		var arrString = "";
		var operator;
		if (interaction) {
			operator = stateObject[stateObject.length - 1][1].index - 1;
		} else {
			operator = stateObject[stateObject.length - 1][1].index;
		}
		for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
			if (i == operator - 1) {
				arrString += "<span class='clicked'>";
			}
			arrString += getValue(i) + " ";
			if (i == operator + 1) {
				arrString += "</span> ";
			}
		}
		expressionPara.innerHTML = arrString;
	}

	/* The next 4 methods build up the state object*/

	// Finds the operator, left operand and right operand.
	function find() {
		var arr;
		if (!started) {
			arr = startArray;
			started = true;
		} else {
			arr = stateObject[stateObject.length - 1][0];
		}
		
		var currState = new Array();
		var bool = false;
		var operator = 1;
		currState.push(arr);
		// loop through array and find first mult/div/mod operator
		for (var i = 1; i < arr.length; i+=2) {
			if (arr[i].type == "MDMoperator") {
				operator = i;
				bool = true;
				break;
			}
		}
		var index = {index: operator};
		currState.push(index);
		var message;
		if (!interaction) {
			message = {message: "We evaluate the leftmost operator (" + arr[operator].value + ") with its left and right operands."};
		} else {
			message = {message: "Click the next operator."};
		}
		currState.push(message);
		stateObject.push(currState);
	}

	function findLeftOperand() {
		var currState = new Array();
		currState.push(stateObject[stateObject.length - 1][0]);
		var operator = stateObject[stateObject.length - 1][1].index - 1;
		var index = {index: operator};
		currState.push(index);
		var message = {message: "Click the left operand."};
		currState.push(message);
		stateObject.push(currState);
	}

	function findRightOperand() {
		var currState = new Array();
		currState.push(stateObject[stateObject.length - 1][0]);
		var operator = stateObject[stateObject.length - 2][1].index + 1;
		var index = {index: operator};
		currState.push(index);
		var message = {message: "Click the right operand."};
		currState.push(message);
		stateObject.push(currState);
	}

	// solves and updates expression, needs to be trimped since find does
	// a lot of the work.
	function solve() {
		var arr = stateObject[stateObject.length - 1][0];
		if (arr.length == 1) {
			// TO DO: remove this from solve()
			document.getElementById("nextstep").classList.add("hiddenSteps");
		} else {
			var operator;
			if (interaction) {
				operator = stateObject[stateObject.length - 1][1].index - 1;
			} else {
				operator = stateObject[stateObject.length - 1][1].index;
			}
			var updatedArray = [];
			//copy all values that aren't evaluated
			for (var i = 0; i < operator; i++) {
				updatedArray.push(arr[i]);
			}
			// evaluate portion of expression
			if (arr[operator].value == '*') {
				updatedArray[operator - 1].value = (arr[operator - 1].value * arr[operator + 1].value);
			} else if (arr[operator].value == '/') {
				updatedArray[operator - 1].value = (arr[operator - 1].value / arr[operator + 1].value);
				// special case for int division
				if (arr[operator -1].type == 'int' && arr[operator + 1].type == 'int') {
					updatedArray[operator - 1].value = Math.round(updatedArray[operator - 1].value);
				}
			} else if (arr[operator].value == '%') {
				updatedArray[operator - 1].value = (arr[operator - 1].value % arr[operator+ 1].value);
			} else if (arr[operator].value == '+') {
				updatedArray[operator - 1].value = (arr[operator - 1].value + arr[operator+ 1].value);
			} else if (arr[operator].value == '-') {
				updatedArray[operator - 1].value = (arr[operator - 1].value - arr[operator+ 1].value);
			}
			// setting type of value
			if (arr[operator - 1].type == 'int' && arr[operator + 1].type == 'int') {
				updatedArray[operator - 1].type = 'int';
			} else if (arr[operator - 1].type == 'String' || arr[operator + 1].type == 'String') {
				updatedArray[operator - 1].type = 'String';
			} else {
				updatedArray[operator - 1].type = 'double';
			}
			// copy remaining elements of expression
			for (var i = operator + 2; i < arr.length; i++) {
				updatedArray.push(arr[i]);
			}
			arr = updatedArray;
		
			var currState = new Array();
			currState.push(arr);
			if (interaction) {
				var oper = stateObject[stateObject.length - 2][1].index;
				var index = {index: oper};
				currState.push(index);
				var message = {message: "What is the answer?"};
				currState.push(message);
			} else {
				var oper = stateObject[stateObject.length - 1][1].index - 1;
				var index = {index: oper};
				currState.push(index);
				var message = {message: "After evaluating we get " + getValue(oper)};
				currState.push(message);
			}
			stateObject.push(currState);
		}
	}

}) ();