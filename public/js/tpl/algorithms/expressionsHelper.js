function ExpressionsHelper() {

	this.isThereAtLeastOneMultiplicationDivisionOrModOperator = function (state) {
		var numProblemLines = state.problemLines.length;
		var currentExpression = state.problemLines[numProblemLines - 1];
		var foundMDMoperator = false;

		for (var i = 0; i < currentExpression.length; i++) {
			if (currentExpression[i].type == "MDMoperator") {
				foundMDMoperator = true;
			}
		}

		return foundMDMoperator;
	};

	this.isThereAtLeastOneAdditionOrSubtractionOperator = function (state) {
		var numProblemLines = state.problemLines.length;
		var currentExpression = state.problemLines[numProblemLines - 1];
		var foundASoperator = false;

		for (var i = 0; i < currentExpression.length; i++) {
			if (currentExpression[i].type == "ASoperator") {
				foundASoperator = true;
			}
		}

		return foundASoperator;
	};

	this.getFirstMultiplicationDivisionOrModOperatorFromLeft = function (state) {
		var numProblemLines = state.problemLines.length;
		var currentExpression = state.problemLines[numProblemLines - 1];
		var MDMoperator = {};
		MDMoperator.type = "lineCell";
		MDMoperator.line = numProblemLines - 1;

		for (var i = 0; i < currentExpression.length; i++) {
			if (currentExpression[i].type == "MDMoperator") {
				MDMoperator.cell = i;
				break;
			}
		}

		return MDMoperator;
	};

	this.getFirstAdditionOrSubtractionOperatorFromLeft = function (state) {
		var numProblemLines = state.problemLines.length;
		var currentExpression = state.problemLines[numProblemLines - 1];
		var ASoperator = {};
		ASoperator.type = "lineCell";
		ASoperator.line = numProblemLines - 1;

		for (var i = 0; i < currentExpression.length; i++) {
			if (currentExpression[i].type == "ASoperator") {
				ASoperator.cell = i;
				break;
			}
		}

		return ASoperator;
	};

	this.getLeftOperand = function (state, operatorIndex) {
		var leftOperand = {};
		leftOperand.type = "lineCell";
		leftOperand.line = state.problemLines.length - 1;
		leftOperand.cell = operatorIndex.cell - 1;
		return leftOperand;
	};

	this.getRightOperand = function (state, operatorIndex) {
		var rightOperand = {};
		rightOperand.type = "lineCell";
		rightOperand.line = state.problemLines.length - 1;
		rightOperand.cell = operatorIndex.cell + 1;
		return rightOperand;
	};

	this.createNewLineWithEmptyCell = function (state, operatorObject) {
		var operatorIndex = operatorObject.cell;
		var currentExpression = state.problemLines[state.problemLines.length - 1];
		var newProblemLine = JSON.parse(JSON.stringify(currentExpression));

		var part1 = newProblemLine.slice(0, operatorIndex - 1);
		var part2 = newProblemLine.slice(operatorIndex, operatorIndex + 1);
		var part3 = newProblemLine.slice(operatorIndex + 2);
		newProblemLine = part1.concat(part2).concat(part3);
		newProblemLine[operatorIndex - 1].type = "empty";
		newProblemLine[operatorIndex - 1].value = "";

		state.problemLines.push(newProblemLine);

		var emptyCell = {};
		emptyCell.type = "lineCell";
		emptyCell.line = state.problemLines.length - 1;
		emptyCell.cell = operatorIndex - 1;
		return emptyCell;
	};

	this.calculate = function (state, operatorObject) {
		var operatorIndex = operatorObject.cell;
		var nextToLastProblemLine = state.problemLines.length - 2;
		var problemLine = state.problemLines.length - 1;
		var calculationExpression = state.problemLines[nextToLastProblemLine];

		var operator = calculationExpression[operatorIndex];
		var leftOperand = calculationExpression[operatorIndex - 1];
		var rightOperand = calculationExpression[operatorIndex + 1];
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

			// Need a little magic here: If this is string concat with a double,
			// need to make sure that we concat in the .0, because JS will treat
			// 4.0 like 4.
			var lhv = leftOperand.value;
			var rhv = rightOperand.value;

			if (leftOperand.type == "double" && rightOperand.type == "string") {
				if (leftOperand.value - Math.floor(leftOperand.value) == 0) {
					lhv = leftOperand.value.toFixed(1);
				}
			}

			if (leftOperand.type == "string" && rightOperand.type == "double") {
				if (rightOperand.value - Math.floor(rightOperand.value) == 0) {
					rhv = rightOperand.value.toFixed(1);
				}
			}

			result = lhv + rhv;
		}
		else if (operator.value == "-") {
			result = leftOperand.value - rightOperand.value;
		}

		state.problemLines[problemLine][operatorIndex - 1].value = result;


		// If either operand was a string, the result is a string
		if (leftOperand.type == "string" || rightOperand.type == "string") {
			state.problemLines[problemLine][operatorIndex - 1].type = "string";

			// Javascript doesn't put any type info into the the numbers, so we have to keep track
			// If either operand was a double, then the result is a double.
		} else if ((leftOperand.type == "double" || rightOperand.type == "double")) {
			result = result.toFixed(1);
			state.problemLines[problemLine][operatorIndex - 1].type = "double";
		}

		// Otherwise, it's gonna be an int.
		else if (typeof result == "number") {
			state.problemLines[problemLine][operatorIndex - 1].type = "int";
		}
		else {
			console.error("Expressions thoughtProcess -- Encountered a type we weren't expecting: " + (typeof result));
			state.problemLines[problemLine][operatorIndex - 1].type = typeof result;

		}

		return result;
	};
}