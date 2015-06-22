

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

QUnit.test("expressions-tpl", function (assert) {
    var globals = {
        helper: new HelperObject()
    };
    var state = {
        problemLines: [
            [
                {type: "int", value: 22},
                {type: "MDMoperator", value: "%"},
                {type: "int", value: 7},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2.0}
            ]
        ]
    };
    // copied from public/expressions/thoughtProcess.js output
    var final = JSON.parse('{"problemLines":[[{"type":"int","value":22},{"type":"MDMoperator","value":"%"},{"type":"int","value":7},{"type":"ASoperator","value":"+"},{"type":"int","value":4},{"type":"MDMoperator","value":"*"},{"type":"int","value":3},{"type":"ASoperator","value":"-"},{"type":"double","value":6},{"type":"MDMoperator","value":"/"},{"type":"double","value":2}],[{"type":"int","value":1},{"type":"ASoperator","value":"+"},{"type":"int","value":4},{"type":"MDMoperator","value":"*"},{"type":"int","value":3},{"type":"ASoperator","value":"-"},{"type":"double","value":6},{"type":"MDMoperator","value":"/"},{"type":"double","value":2}],[{"type":"int","value":1},{"type":"ASoperator","value":"+"},{"type":"int","value":12},{"type":"ASoperator","value":"-"},{"type":"double","value":6},{"type":"MDMoperator","value":"/"},{"type":"double","value":2}],[{"type":"int","value":1},{"type":"ASoperator","value":"+"},{"type":"int","value":12},{"type":"ASoperator","value":"-"},{"type":"double","value":3}],[{"type":"int","value":13},{"type":"ASoperator","value":"-"},{"type":"double","value":3}],[{"type":"double","value":10}]]}');
    var steps = test_util.run("expressions-tpl", {globals:globals, state:state});
    assert.deepEqual(last(steps).state, final);
});