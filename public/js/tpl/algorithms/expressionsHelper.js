
/// Functions that are invoked by the expressions thought process alogrithm.
function ExpressionsHelper() {
    "use strict";

    this.isThereAtLeastOneMultiplicationDivisionOrModOperator = function(state) {
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var foundMDMoperator = false;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "MDMoperator") {
                foundMDMoperator = true;
            }
        }

        return foundMDMoperator;
    };


    //this.isAnyPartOfTheExpressionInsideParentheses = function(state) {
    //    var currentExpression = state.problemLines[state.problemLines.length - 1];
    //
    //    var foundParenthesizedExpr = false;
    //
    //    for (var i = 0; i < currentExpression.length; i++) {
    //        if (currentExpression[i].type === "paren_expr") {
    //            foundParenthesizedExpr = true;
    //        }
    //    }
    //
    //    return foundParenthesizedExpr;
    //};
    //
    //this.getFirstParenthesizedPartFromTheLeft = function(state) {
    //    var currentExpression = state.problemLines[state.problemLines.length - 1];
    //    var parenExpr = {};
    //    parenExpr.type = "lineBlock";
    //    parenExpr.line = state.problemLines.length - 1;
    //
    //    for (var i = 0; i < currentExpression.length; i++) {
    //        if (currentExpression[i].type === "paren_expr") {
    //            parenExpr.cell = i;
    //            parenExpr.opType = "paren_expr";
    //            parenExpr.expr = currentExpression[i].value;
    //            break;
    //        }
    //    }
    //
    //    return parenExpr;
    //};

    this.isThereAtLeastOneMultiplicationDivisionOrModOperatorInsideParentheses = function(state) {
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var foundMDMoperator = false;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "paren_expr") {
                var parenExpr = currentExpression[i].value;
                for (var j = 0; j < parenExpr.length; j++) {
                    if (parenExpr[j].type === "MDMoperator") {
                        foundMDMoperator = true;
                    }
                }
            }
        }

        return foundMDMoperator;
    };

    this.isThereAtLeastOneAdditionOrSubtractionOperator = function(state) {
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var foundASoperator = false;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "ASoperator") {
                foundASoperator = true;
            }
        }

        return foundASoperator;
    };

    this.isThereAtLeastOneAdditionOrSubtractionOperatorInsideParentheses = function(state) {
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var foundASoperator = false;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "paren_expr") {
                var parenExpr = currentExpression[i].value;
                for (var j = 0; j < parenExpr.length; j++) {
                    if (parenExpr[j].type === "ASoperator") {
                        foundASoperator = true;
                    }
                }
            }
        }

        return foundASoperator;
    };

    this.isThereAtLeastOneComparison = function (state) {
        return state.problemLines[state.problemLines.length - 1].some(function (item) {
            return item.type === "CompOperator";
        });
    };

    this.isThereAtLeastOneBooleanOperator = function (state) {
        return state.problemLines[state.problemLines.length - 1].some(function (item) {
            return item.type === "BoolOperator";
        });
    };

    this.getFirstMultiplicationDivisionOrModOperatorFromLeft = function (state) {
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var MDMoperator = {};
        MDMoperator.type = "lineCell";
        MDMoperator.line = state.problemLines.length - 1;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "MDMoperator") {
                MDMoperator.cell = i;
                MDMoperator.opType = "MDMoperator";
                MDMoperator.op = currentExpression[i].value;
                return MDMoperator;
            }
        }
    };

    this.getFirstMultiplicationDivisionOrModOperatorFromLeftInsideParentheses = function (state) {
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var MDMoperator = {};
        MDMoperator.type = "lineCell";
        MDMoperator.line = state.problemLines.length - 1;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "paren_expr") {
                var parenExpr = currentExpression[i].value;
                for (var j = 0; j < parenExpr.length; j++) {
                    if (parenExpr[j].type === "MDMoperator") {
                        MDMoperator.cell = j;
                        MDMoperator.opType = "MDMoperator";
                        MDMoperator.op = parenExpr[j].value;
                        MDMoperator.isParen = true;
                        MDMoperator.parenCell = i;
                        return MDMoperator;
                    }
                }
            }
        }
    };

    this.getFirstAdditionOrSubtractionOperatorFromLeft = function (state) {
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var ASoperator = {};
        ASoperator.type = "lineCell";
        ASoperator.line = state.problemLines.length - 1;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "ASoperator") {
                ASoperator.cell = i;
                ASoperator.opType = "ASoperator";
                ASoperator.op = currentExpression[i].value;
                return ASoperator;
            }
        }
    };

    this.getFirstAdditionOrSubtractionOperatorFromLeftInsideParentheses = function (state) {
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var ASoperator = {};
        ASoperator.type = "lineCell";
        ASoperator.line = state.problemLines.length - 1;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "paren_expr") {
                var parenExpr = currentExpression[i].value;
                for (var j = 0; j < parenExpr.length; j++) {
                    if (parenExpr[j].type === "ASoperator") {
                        ASoperator.cell = j;
                        ASoperator.opType = "ASoperator";
                        ASoperator.op = parenExpr[j].value;
                        ASoperator.isParen = true;
                        ASoperator.parenCell = i;
                        return ASoperator;
                    }
                }
            }
        }
    };

    this.getFirstComparisonFromLeft = function (state) {
        var numProblemLines = state.problemLines.length;
        var currentExpression = state.problemLines[numProblemLines - 1];
        var CompOperator = {};
        CompOperator.type = "lineCell";
        CompOperator.line = numProblemLines - 1;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "CompOperator") {
                CompOperator.cell = i;
                CompOperator.opType = "CompOperator";
                CompOperator.op = currentExpression[i].value;
                break;
            }
        }

        return CompOperator;
    };

    this.getFirstBooleanOperatorFromLeft = function (state) {
        var numProblemLines = state.problemLines.length;
        var currentExpression = state.problemLines[numProblemLines - 1];
        var BoolOperator = {};
        BoolOperator.type = "lineCell";
        BoolOperator.line = numProblemLines - 1;

        for (var i = 0; i < currentExpression.length; i++) {
            if (currentExpression[i].type === "BoolOperator") {
                BoolOperator.cell = i;
                BoolOperator.opType = "BoolOperator";
                BoolOperator.op = currentExpression[i].value;
                break;
            }
        }

        return BoolOperator;
    };

    this.getLeftOperand = function (state, operatorIndex) {
        var leftOperand = {};
        leftOperand.type = "lineCell";
        leftOperand.line = state.problemLines.length - 1;
        leftOperand.cell = operatorIndex.cell - 1;
        if (operatorIndex.isParen) {
            leftOperand.value = state.problemLines[leftOperand.line][operatorIndex.parenCell].value[leftOperand.cell].value;
            leftOperand.valType = state.problemLines[leftOperand.line][operatorIndex.parenCell].value[leftOperand.cell].type;
            leftOperand.isParen = true;
        } else {
            leftOperand.value = state.problemLines[leftOperand.line][leftOperand.cell].value;
            leftOperand.valType = state.problemLines[leftOperand.line][leftOperand.cell].type;
        }
        leftOperand.asString = function () {
            if (this.valType === "double" && this.value % 1 === 0) { // double without non-zero decimals
                return this.value.toFixed(1);
            }
            return this.value.toString();
        };
        return leftOperand;
    };

    this.getRightOperand = function (state, operatorIndex) {
        var rightOperand = {};
        rightOperand.type = "lineCell";
        rightOperand.line = state.problemLines.length - 1;
        rightOperand.cell = operatorIndex.cell + 1;
        if (operatorIndex.isParen) {
            rightOperand.value = state.problemLines[rightOperand.line][operatorIndex.parenCell].value[rightOperand.cell].value;
            rightOperand.valType = state.problemLines[rightOperand.line][operatorIndex.parenCell].value[rightOperand.cell].type;
            rightOperand.isParen = true;
        } else {
            rightOperand.value = state.problemLines[rightOperand.line][rightOperand.cell].value;
            rightOperand.valType = state.problemLines[rightOperand.line][rightOperand.cell].type;
        }
        rightOperand.asString = function () {
            if (this.valType === "double" && this.value % 1 === 0) { // double without non-zero decimals
                return this.value.toFixed(1);
            }
            return this.value.toString();
        };
        return rightOperand;
    };

    function createNewLineWithResultCell(state, operatorObject) {
        var operatorIndex = operatorObject.cell;
        var currentExpression = state.problemLines[state.problemLines.length - 1];
        var newProblemLine = JSON.parse(JSON.stringify(currentExpression));

        var parenExpr;
        var part1, part2, part3;
        if (operatorObject.isParen) {
            parenExpr = newProblemLine[operatorObject.parenCell].value;
            part1 = parenExpr.slice(0, operatorIndex - 1);
            part2 = parenExpr.slice(operatorIndex, operatorIndex + 1);
            part3 = parenExpr.slice(operatorIndex + 2);
            parenExpr = part1.concat(part2).concat(part3);
            parenExpr[operatorIndex - 1].type = "empty";
            parenExpr[operatorIndex - 1].value = "";
            operatorIndex = operatorObject.parenCell;
            if (parenExpr.length === 1) { // expression inside has been evaluated, discard parens
                newProblemLine[operatorObject.parenCell] = parenExpr[0];
            } else {
                newProblemLine[operatorObject.parenCell].value = parenExpr;
            }
        } else {
            part1 = newProblemLine.slice(0, operatorIndex - 1);
            part2 = newProblemLine.slice(operatorIndex, operatorIndex + 1);
            part3 = newProblemLine.slice(operatorIndex + 2);
            newProblemLine = part1.concat(part2).concat(part3);
            newProblemLine[operatorIndex - 1].type = "empty";
            newProblemLine[operatorIndex - 1].value = "";
        }

        state.problemLines.push(newProblemLine);

        var resultCell = {};
        resultCell.type = "result";
        resultCell.line = state.problemLines.length - 1;
        resultCell.cell = operatorIndex - 1;
        return resultCell;
    }

    function getOperator(state, index) {
        var lastProblemLine = state.problemLines.length - 1;
        var calculationExpression = state.problemLines[lastProblemLine];

        return calculationExpression[index];
    }

    this.isCurrentOperatorMod = function (operatorObject) {
        return operatorObject.op === "%";
    };

    this.isCurrentOperationIntDiv = function (state, operatorObject) {
        var operatorIndex = operatorObject.cell;
        var lastProblemLine = state.problemLines.length - 1;
        var calculationExpression = state.problemLines[lastProblemLine];

        if (operatorObject.isParen) {
            calculationExpression = calculationExpression[operatorObject.parenCell].value;
        }

        var operator = calculationExpression[operatorIndex];
        var leftOperand = calculationExpression[operatorIndex - 1];
        var rightOperand = calculationExpression[operatorIndex + 1];

        return operator.value === "/" && leftOperand.type === "int" && rightOperand.type === "int";
    };

    this.isCurrentOperationDiv = function (operatorObject) {
        return operatorObject.op === "/";
    };

    this.isCurrentOperationMult = function (operatorObject) {
        return operatorObject.op === "*";
    };

    this.isCurrentOperationConcat = function (state, operatorObject) {
        var operatorIndex = operatorObject.cell;
        var lastProblemLine = state.problemLines.length - 1;
        var calculationExpression = state.problemLines[lastProblemLine];

        if (operatorObject.isParen) {
            calculationExpression = calculationExpression[operatorObject.parenCell].value;
        }

        var operator = calculationExpression[operatorIndex];
        var leftOperand = calculationExpression[operatorIndex - 1];
        var rightOperand = calculationExpression[operatorIndex + 1];

        return operator.value === "+" && (leftOperand.type === "string" || rightOperand.type === "string");
    };

    this.isCurrentOperationAdd = function (operatorObject) {
        return operatorObject.op === "+";
    };

    this.isCurrentOperationSub = function (operatorObject) {
        return operatorObject.op === "-";
    };

    this.isCurrentOperationAnd = function (operatorObject) {
        return operatorObject.op === "&&";
    };

    this.isCurrentOperationOr = function (operatorObject) {
        return operatorObject.op === "||";
    };

    function correctPrecision(result, left, right) {
        if ((left.valType !== "string" && right.valType !== "string") &&
            (left.valType === "double" || right.valType === "double") && result % 1 === 0) {
            return result.toFixed(1);
        }
        return result;
    }

    function doStateUpdate(state, operator, result) {
        var nextToLastProblemLine = state.problemLines.length - 2;
        var problemLine = state.problemLines.length - 1;
        var calculationExpression = state.problemLines[nextToLastProblemLine];
        var target = state.problemLines[problemLine][operator.cell - 1];
        if (operator.isParen) {
            calculationExpression = calculationExpression[operator.parenCell].value;
            target = state.problemLines[problemLine][operator.parenCell]; // replace paren_expr with result
        }

        var leftOperand = calculationExpression[operator.cell - 1];
        var rightOperand = calculationExpression[operator.cell + 1];

        // if there are still operators to resolve inside parens, update inside them
        if (operator.isParen && state.problemLines[problemLine][operator.parenCell].value.length > 1) {
            target = target.value[operator.cell - 1];
        }

        target.value = result;

        if (operator.opType === "CompOperator" || operator.opType === "BoolOperator") {
            // the result of a comparison or boolean operation must be a boolean
            target.type = "boolean";
        } else if (leftOperand.type === "string" || rightOperand.type === "string") {
            // If either operand was a string, the result is a string
            target.type = "string";

        // Javascript doesn't put any type info into the the numbers, so we have to keep track
        } else if ((leftOperand.type === "double" || rightOperand.type === "double")) {
            // If either operand was a double, then the result is a double.
            target.type = "double";
        } else if (typeof result === "number") {
            // Otherwise, it's gonna be an int.
            target.type = "int";
        } else {
            console.error("Expressions thoughtProcess -- Encountered a type we weren't expecting: " + (typeof result));
            target.type = typeof result;

        }
    }

    function getResultType(state, operator) {
        var operatorIndex = operator.cell;
        var nextToLastProblemLine = state.problemLines.length - 2;
        var calculationExpression = state.problemLines[nextToLastProblemLine];
        var leftOperand = calculationExpression[operatorIndex - 1];
        var rightOperand = calculationExpression[operatorIndex + 1];

        if (operator.opType === "CompOperator" || operator.opType === "BoolOperator") {
            // the result of a comparison or boolean operation must be a boolean
            return "boolean";
        }
        if (leftOperand.type === "string" || rightOperand.type === "string") {
            // If either operand was a string, the result is a string
            return "string";
        }
        if (leftOperand.type === "double" || rightOperand.type === "double") {
            // Javascript doesn't put any type info into the the numbers, so we have to keep track
            // If either operand was a double, then the result is a double.
            return "double";
        }
        // Otherwise, it's gonna be an int.
        return "int";
    }

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisModulus = function(left, right, state, operator) {
        var resultCell = createNewLineWithResultCell(state, operator);
        var result = left.value % right.value;
        doStateUpdate(state, operator, result);
        resultCell.value = correctPrecision(result, left, right);
        resultCell.valueType = getResultType(state, operator);
        return resultCell;
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisDivision = function (left, right, state, operator) {
        var resultCell = createNewLineWithResultCell(state, operator);
        var result = left.value / right.value;
        // check for integer division
        if (left.valType === "int" && right.valType === "int") {
            result = Math.floor(result);
        }
        doStateUpdate(state, operator, result);
        resultCell.value = correctPrecision(result, left, right);
        resultCell.valueType = getResultType(state, operator);
        return resultCell;
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisMultiplication = function (left, right, state, operator) {
        var resultCell = createNewLineWithResultCell(state, operator);
        var result = left.value * right.value;
        doStateUpdate(state, operator, result);
        resultCell.value = correctPrecision(result, left, right);
        resultCell.valueType = getResultType(state, operator);
        return resultCell;
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisAddition = function (left, right, state, operator) {
        var resultCell = createNewLineWithResultCell(state, operator);
        var result = left.value + right.value;
        // check for string concatenation
        if (left.valType === "string" || right.valType === "string") {
            result = left.asString() + right.asString();
        }
        doStateUpdate(state, operator, result);
        resultCell.value = correctPrecision(result, left, right);
        resultCell.valueType = getResultType(state, operator);
        return resultCell;
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisSubtraction = function (left, right, state, operator) {
        var resultCell = createNewLineWithResultCell(state, operator);
        var result = left.value - right.value;
        doStateUpdate(state, operator, result);
        resultCell.value = correctPrecision(result, left, right);
        resultCell.valueType = getResultType(state, operator);
        return resultCell;
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisComparison = function (left, right, state, operator) {
        var resultCell = createNewLineWithResultCell(state, operator);
        var result;
        switch(operator.op) {
            case '<':
                result = left.value < right.value;
                break;
            case '<=':
                result = left.value <= right.value;
                break;
            case '>':
                result = left.value > right.value;
                break;
            case '>=':
                result = left.value >= right.value;
                break;
            case '==':
                result = left.value === right.value;
                break;
            case '!=':
                result = left.value !== right.value;
                break;
            default:
                throw new Error("don't know how to get the result of operator: " + operator.op);
        }
        doStateUpdate(state, operator, result);
        resultCell.value = result;
        resultCell.valueType = getResultType(state, operator);
        return resultCell;
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisAnd = function (left, right, state, operator) {
        var resultCell = createNewLineWithResultCell(state, operator);
        if (left.valType !== "boolean" || right.valType !== "boolean") {
            throw new Error("the operands for && must both be boolean values");
        }
        var result = left.value && right.value;
        doStateUpdate(state, operator, result);
        resultCell.value = result;
        resultCell.valueType = getResultType(state, operator);
        return resultCell;
    };

    // left and right are objects returned by get{Left|Right}Operand, state is state object,
    // operator is operator object returned by getFirst...FromLeft
    this.whatIsTheResultOfThisOr = function (left, right, state, operator) {
        var resultCell = createNewLineWithResultCell(state, operator);
        if (left.valType !== "boolean" || right.valType !== "boolean") {
            throw new Error("the operands for && must both be boolean values");
        }
        var result = left.value || right.value;
        doStateUpdate(state, operator, result);
        resultCell.value = result;
        resultCell.valueType = getResultType(state, operator);
        return resultCell;
    };
}

/// Creates an initial state for expressions given a problem configuration.
function expressions_make_initial_state(problemConfig) {
    "use strict";

    function operator_type(op) {
        switch (op) {
            case '+': case '-': return 'ASoperator';
            case '>':case '>=':case '<':case '<=':case '==':case '!=': return 'CompOperator';
            case '&&':case '||': return 'BoolOperator';
            case '%':case '*':case '/': return 'MDMoperator';
            default: throw new Error("no type associated with operator: " + op);
        }
    }

    function flatten(node) {
        switch (node.tag) {
            case 'binop':
                var left = flatten(node.args[0]);
                var right = flatten(node.args[1]);
                return left.concat({type:operator_type(node.operator), value:node.operator}, right);
            case 'literal':
                return [{type:node.type, value:node.value}];
            case 'paren_expr':
                return [{type:'paren_expr', value:flatten(node.value)}];
        }
    }

    var ast = java_parsing.parse_expression(problemConfig.content);

    return {
        problemLines: [flatten(ast)]
    };
}

