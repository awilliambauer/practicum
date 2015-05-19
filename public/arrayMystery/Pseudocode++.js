function solveArrayMystery(problem) {
    // init i
    problem.variable.i = determineInitialValueOfI(problem);
    while (doesForLoopTestPass(problem)) {
        if (nextLineIsIfStatement(problem)) {
            if (doesIfTestPass(problem)) {
                // update values in the array
                while (nextLineIsAssignmentStatement(problem)) {
                    var expression = evaluateExpression(problem);
                    var toUpdate = getIndexToUpdate(problem);
                    problem.array[toUpdate] = expression;
                }
            } else if (nextLineIsElseBranch(problem)) {
                while (nextLineIsAssignmentStatement(problem)) {
                    var expression = evaluateExpression(problem);
                    var toUpdate = getIndexToUpdate(problem);
                    problem.array[toUpdate] = expression;
                }
            }
        }
        while (nextLineIsAssignmentStatement(problem)) {
            var expression = evaluateExpression(problem);
            var toUpdate = getIndexToUpdate(problem);
            problem.array[toUpdate] = expression;
        }
        var increment = getLoopIncrement(problem);
        problem.variables.i += increment;
    }
}

function determineInitialValueOfI(problem) {
    var forLoop = ast.find_by_tag("for", problem.ast);
    var init = ast.find_by_tag("declaration", forLoop);
    return init.args.expression.value;
}

// potentially visible
function doesForLoopTestPass(problem) {
    eric(getCurrentNode(problem));
}

function nextLineIsIfStatement(problem) {
    return getCurrentNode(problem).tag == "if"; // ummm seems legit??
}

// potentially visible
function doesIfTestPass(problem) {
    eric(getCurrentNode(problem));
}

function nextLineIsAssignmentStatement(problem) {
    return getCurrentNode(problem).operator == "="; // ummm seems legit??
}

// visible
function evaluateExpression(problem) {
    callExpressionStuff();
}

// visible
function getIndexToUpdate(problem) {
    var expression = getIndexExpression(problem);
    if (expression.hasOperator()) {
        return callExpressionStuff(expression);
    } else {
        return expression.value;
    }
}

function getIndexExpression(problem) {
    return getCurrentNode(problem).args.index;
}

function nextLineIsElseBranch(problem) {
    return getCurrentNode(problem).tag == "else"; // ummm seems legit??
}

function getLoopIncrement(problem) {
    var forLoop = ast.find_by_tag("for", problem.ast);
    var increment = ast.find_by_tag("expression", forLoop);
    if (increment.operator == "++") {
        return 1;
    } else if (increment.operator == "--") {
        return -1;
    } else {
        var operator = increment.operator;
        return parse(operator);
    }
}

function getCurrentNode(problem) {
    return ast.find_by_id(problem.instructionPointer, problem.ast);
}