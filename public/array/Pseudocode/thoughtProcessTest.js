/* This is an example problem to show proof of concept for the pseudocode,
 * assuming that the helper functions return what they should return
 * and we know exactly how much to increment the instruction pointer at
 * each structure.
 *
 * If you have questions, please email Grant Magdanz: gmagdanz@uw.edu
 */

/*

The example problem that this code uses

public static void arrayMystery(int[] a) {
    for ((0) int i = a.length - 2; (1, 5) i > 0; (4, 8) i--) {
        (2, 6) if (a[i + 1] <= a[i - 1]) {
            (3, 7) a[i]++;
        }
    }
}
 */
var initialState = {
    array: [1, 0, 1, 0, 0, 1, 0],
    variables: {
        arrayLength: 4,
        i: -1
    },
    instructionPtr: 0,
}

/**
 * Given the initial state of an array mystery problem, solves it
 *
 * @param problem an ast of the problem
 * @modifies problem
 */
function solveArrayMystery(problem) {
    // init i
    problem.variables.i = determineInitialValueOfI(problem);
    problem.instructionPtr++;
    while (doesForLoopTestPass(problem)) {
        problem.instructionPtr++;
        if (nextLineIsIfStatement(problem)) {
            if (doesIfTestPass(problem)) {
                problem.instructionPtr++;
                // update values in the array
                while (nextLineIsAssignmentStatement(problem)) {
                    var expression = evaluateExpression(problem);
                    var toUpdate = getIndexToUpdate(problem);
                    problem.array[toUpdate] = expression;
                    problem.instructionPtr++;
                }
            } else if (nextLineIsElseBranch(problem)) {
                problem.instructionPtr++;
                while (nextLineIsAssignmentStatement(problem)) {
                    var expression = evaluateExpression(problem);
                    var toUpdate = getIndexToUpdate(problem);
                    problem.array[toUpdate] = expression;
                    problem.instructionPtr++;
                }
            } else {
                problem.instructionPtr += 2;
            }
        }
        while (nextLineIsAssignmentStatement(problem)) {
            var expression = evaluateExpression(problem);
            var toUpdate = getIndexToUpdate(problem);
            problem.array[toUpdate] = expression;
            problem.instructionPtr++;
        }
        var increment = getLoopIncrement(problem);
        problem.variables.i += increment;
        problem.instructionPtr++;
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
    return problem.array.length - 2;
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
    if ((problem.instructionPtr - 1) % 4 == 0) {
        return problem.variables.i > 0;
    }
    return false;
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
    return (problem.instructionPtr - 2) % 4 == 0;
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
    return problem.array[problem.variables.i + 1] <= problem.array[problem.variables.i - 1];
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
    return (problem.instructionPtr - 3) % 4 == 0;
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
    return problem.array[problem.variables.i] + 1;
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
    return problem.variables.i;
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
    return problem.variables.i;
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
    return false;
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
    return -1;
}

solveArrayMystery(initialState);

console.log(initialState.array);