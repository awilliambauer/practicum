/*
 * This is the actual pseudocode (as opposed to the test one). Helper functions
 * need to be fleshed out still when it comes to parsing the AST.
 *
 * If you have questions, please email Grant Magdanz: gmagdanz@uw.edu
 *
 * NOTE: Every helper method comment also says how visible it should be to
 * students. Externally visible means all internal details should be hid from
 * the student, partially visible means that details should only be displayed if
 * they deal with arrays, and internally visible means that all internal details
 * showed be displayed always.
 */

var initialState = {
    array: [11, 14, 2, 4, 7],
    variables: {
        arrayLength: 5,
        i: "?"
    },
    instructionPtr: 0,
    promptText: "Let's solve the problem!",
    ast: mainAst,
    index: null, // null means that they haven't answered yet
    styleClasses: {
        mainColorText: [],
        mainColorBorder: [],
        accent1Highlight: [],
        accent1Border: [],
        accent2Hightlight: [],
        accent2Border: []
    }
}

/**
 * Given the initial state of an array mystery problem, solves it
 *
 * @param problem an ast of the problem
 * @modifies problem
 */
function solveArrayMystery(problem) {
    // init i
    problem.variable.i = determineInitialValueOfI(problem);
    problem.instructionPtr++;
    while (doesForLoopTestPass(problem)) {
        problem.instructionPtr++;
        if (nextLineIsIfStatement(problem)) {
            if (doesIfTestPass(problem)) {
                problem.instructionPtr++;
                // update values in the array
                while (nextLineIsAssignmentStatement(problem)) {
                    problem.instructionPtr++;
                    var expression = evaluateExpression(problem);
                    var toUpdate = getIndexToUpdate(problem);
                    problem.array[toUpdate] = expression;
                }
            } else if (nextLineIsElseBranch(problem)) {
                problem.instructionPtr++;
                while (nextLineIsAssignmentStatement(problem)) {
                    problem.instructionPtr++;
                    var expression = evaluateExpression(problem);
                    var toUpdate = getIndexToUpdate(problem);
                    problem.array[toUpdate] = expression;
                }
            }
        }
        while (nextLineIsAssignmentStatement(problem)) {
            problem.instructionPtr++;
            var expression = evaluateExpression(problem);
            var toUpdate = getIndexToUpdate(problem);
            problem.array[toUpdate] = expression;
        }
        problem.instructionPtr++;
        var increment = getLoopIncrement(problem);
        problem.variables.i += increment;
    }
}

/**
 * Given the state of an array mystery problem, returns the initial value of
 * the for loop counter.
 *
 * Externally visible
 *
 * @param problem the state of an array mystery problem
 * @returns the initial value of the for loop counter
 */
function determineInitialValueOfI(problem) {
    var forLoop = ast.find_by_tag("for", problem.ast);
    var init = ast.find_by_tag("declaration", forLoop);
    return init.args.expression.value;
}


/**
 * Given the state of an array mystery problem, returns true
 * if the for loop test passes in this state.
 *
 * Partially visible
 *
 * @param problem the state of the array mystery problem
 * @return true if the loop test would pass in this state, false otherwise
 */
function doesForLoopTestPass(problem) {
    return eric(getCurrentNode(problem));
}

/**
 * Given the state of an array mystery problem returns true
 * if the next statement to be executed is an if statement.
 *
 * Externally visible
 *
 * @param problem the state of an array mystery problem
 * @returns true if the next line is an if statement, false otherwise
 */
function nextLineIsIfStatement(problem) {
    return getCurrentNode(problem).tag == "if"; // ummm seems legit??
}


/**
 * Given the state of an array mystery problem, returns true if
 * the current if statement would pass
 *
 * Partially visible
 *
 * @param problem the state of an array mystery problem
 * @returns true if the current if statement would pass, false otherwise
 */
function doesIfTestPass(problem) {
    return eric(getCurrentNode(problem));
}

/**
 * Given the state of an array mystery problem returns true
 * if the next statement to be executed is an assignment statement.
 *
 * Externally visible
 *
 * @param problem the state of an array mystery problem
 * @returns true if the next line is an assignment statement, false otherwise
 */
function nextLineIsAssignmentStatement(problem) {
    return getCurrentNode(problem).operator == "="; // ummm seems legit??
}

/**
 * Given the state of an array mystery problem, returns the
 * evaluation of the current expression.
 *
 * Internally visible
 *
 * @param problem the state of an array mystery problem
 * @returns the evaluation of the current expression
 */
function evaluateExpression(problem) {
    return callExpressionStuff();
}

/**
 * Given the state of an array mystery problem, returns the
 * index in the array that is going to be updated in the current
 * assignment statement.
 *
 * Internally visible
 *
 * @param problem the state of an array mystery problem
 * @returns the index to be updated
 */
function getIndexToUpdate(problem) {
    var expression = getIndexExpression(problem);
    if (expression.hasOperator()) {
        return callExpressionStuff(expression);
    } else {
        return expression.value;
    }
}

/**
 * Given the state of an array mystery problem that is
 * evaluating an array assignment statement, returns the
 * expression for the index.
 *
 * @param problem the state of an array mystery problem
 * @returns the unevaluated expression for the index to be updated
 */
function getIndexExpression(problem) {
    return getCurrentNode(problem).args.index;
}

/**
 * Given the state of an array mystery problem returns true
 * if the next statement to be executed is an else statement.
 *
 * Externally visible
 *
 * @param problem the state of an array mystery problem
 * @returns true if the next line is an else statement, false otherwise
 */
function nextLineIsElseBranch(problem) {
    return getCurrentNode(problem).tag == "else"; // ummm seems legit??
}

/**
 * Given the state of an array mystery problem, returns the
 * increment of the for loop (e.g. i++ would return 1, i-- would return -1)
 *
 * Externally visible
 *
 * @param problem the state of an array mystery problem
 * @returns the increment of the for loop
 */
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

/**
 * Given the state of an array mystery problem, returns the node
 * that is going to be evaluated next
 *
 * This is only called by helper functions, so the student will not see it at all
 *
 * @param problem the state of an array mystery problem
 * @returns the node to be evaluated next in the ast
 */
function getCurrentNode(problem) {
    return ast.find_by_id(problem.instructionPointer, problem.ast);
}