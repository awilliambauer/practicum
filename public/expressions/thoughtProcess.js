
var helper = new HelperObject();
var states = [];

function TPLAlgorithm(state) {
	var explain;
	var thisIsTheLeftOperand;
	var thisIsTheRightOperand;
	var weWillPlaceTheResultOfThisOperationHere;
	addState(state);

	while(helper.isThereAtLeastOneMultiplicationDivisionOrModOperator(state)) {
		explain = "Start at the left, and search for the first multiplication, division, or mod operator in the expression";
		var thisIsTheFirstMultiplicationDivisionOrModOperator = helper.getFirstMultiplicationDivisionOrModOperatorFromLeft(state);
		thisIsTheLeftOperand = helper.getLeftOperand(state, thisIsTheFirstMultiplicationDivisionOrModOperator);
		thisIsTheRightOperand = helper.getRightOperand(state, thisIsTheFirstMultiplicationDivisionOrModOperator);
		weWillPlaceTheResultOfThisOperationHere = helper.createNewLineWithEmptyCell(state, thisIsTheFirstMultiplicationDivisionOrModOperator);
		helper.calculate(state, thisIsTheFirstMultiplicationDivisionOrModOperator);
		addState(state);
	}

	while(helper.isThereAtLeastOneAdditionOrSubtractionOperator(state)) {
		explain = "Start at the left, and find the first addition or subtraction operator";
		var thisIsTheFirstAdditionOrSubtractionOperator = helper.getFirstAdditionOrSubtractionOperatorFromLeft(state);
		thisIsTheLeftOperand = helper.getLeftOperand(state, thisIsTheFirstAdditionOrSubtractionOperator);
		thisIsTheRightOperand = helper.getRightOperand(state, thisIsTheFirstAdditionOrSubtractionOperator);
		weWillPlaceTheResultOfThisOperationHere = helper.createNewLineWithEmptyCell(state, thisIsTheFirstAdditionOrSubtractionOperator);
		helper.calculate(state, thisIsTheFirstAdditionOrSubtractionOperator);
		addState(state);
	}

	return states;
}

function addState(state) {
	var stateCopy = JSON.parse(JSON.stringify(state));
	states.push(stateCopy);
}

function HelperObject() {

	this.isThereAtLeastOneMultiplicationDivisionOrModOperator = function(state) {
		var numProblemLines = state.problemLines.length;
		var currentExpression = state.problemLines[numProblemLines-1];
		var foundMDMoperator = false;

		for (var i = 0; i < currentExpression.length; i++) {
			if (currentExpression[i].type == "MDMoperator") {
				foundMDMoperator = true;
			}
		}

		return foundMDMoperator;
	};

	this.isThereAtLeastOneAdditionOrSubtractionOperator = function(state) {
		var numProblemLines = state.problemLines.length;
		var currentExpression = state.problemLines[numProblemLines-1];
		var foundASoperator = false;

		for (var i = 0; i < currentExpression.length; i++) {
			if (currentExpression[i].type == "ASoperator") {
				foundASoperator = true;
			}
		}

		return foundASoperator;
	};

	this.getFirstMultiplicationDivisionOrModOperatorFromLeft = function(state) {
		var numProblemLines = state.problemLines.length;
		var currentExpression = state.problemLines[numProblemLines-1];
		var MDMoperator;

		for (var i = 0; i < currentExpression.length; i++) {
			if (currentExpression[i].type == "MDMoperator") {
				MDMoperator = i;
				break;
			}
		}

		return MDMoperator;
	};

	this.getFirstAdditionOrSubtractionOperatorFromLeft = function(state) {
		var numProblemLines = state.problemLines.length;
		var currentExpression = state.problemLines[numProblemLines-1];
		var ASoperator;

		for (var i = 0; i < currentExpression.length; i++) {
			if (currentExpression[i].type == "ASoperator") {
				ASoperator = i;
				break;
			}
		}

		return ASoperator;
	};

	this.getLeftOperand = function(state, operatorIndex) {
		return operatorIndex-1;
	};

	this.getRightOperand = function(state, operatorIndex) {
		return operatorIndex+1;
	};

	this.createNewLineWithEmptyCell = function(state, operatorIndex) {
		var currentExpression = state.problemLines[state.problemLines.length-1];
		var newProblemLine = JSON.parse(JSON.stringify(currentExpression));

		var part1 = newProblemLine.slice(0,operatorIndex-1);
		var part2 = newProblemLine.slice(operatorIndex,operatorIndex+1);
		var part3 = newProblemLine.slice(operatorIndex+2);
		newProblemLine = part1.concat(part2).concat(part3);
		newProblemLine[operatorIndex-1].type = "empty";
		newProblemLine[operatorIndex-1].value = "";

		state.problemLines.push(newProblemLine);
		return operatorIndex-1;
	};

	this.calculate = function(state, operatorIndex) {
		var nextToLastProblemLine = state.problemLines.length-2;
		var problemLine = state.problemLines.length-1;
		var calculationExpression = state.problemLines[nextToLastProblemLine];

		var operator = calculationExpression[operatorIndex];
		var leftOperand = calculationExpression[operatorIndex-1];
		var rightOperand = calculationExpression[operatorIndex+1];
		var result;

		if (operator.value == "%") {
			result = leftOperand.value % rightOperand.value;
		}
		else if (operator.value == "*") {
			result = leftOperand.value * rightOperand.value;
		}
		else if (operator.value == "/") {
			result = leftOperand.value / rightOperand.value;
		}
		else if (operator.value == "+") {
			result = leftOperand.value + rightOperand.value;
		}
		else if (operator.value == "-") {
			result = leftOperand.value - rightOperand.value;
		}

		state.problemLines[problemLine][operatorIndex-1].value = result;

		// somewhat hacky way to figure out the type, since javascript doesn't have doubles
		if ((leftOperand.type == "double" || rightOperand.type == "double") && result.toString().indexOf(".") == -1 ) {
			result = result.toFixed(1);
			state.problemLines[problemLine][operatorIndex-1].type = "double";
		}
		else if (typeof result == "number") {
			state.problemLines[problemLine][operatorIndex-1].type = "int";
		}
		else {
			state.problemLines[problemLine][operatorIndex-1].type = typeof result;
		}

		return result;
	};

}