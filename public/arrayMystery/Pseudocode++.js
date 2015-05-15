function solveArrayMystery(problem) {
    // init i
    problem.variable.i = determineInitialValueOfI(problem);
    while (doesForLoopTestPass(problem)) {
        if (nextLineIsIfStatement(problem)) {
            if (doesIfTestPass(problem)) {
                // update values in the array
                while (nextLineIsAssigmentStatement(problem)) {
                    var expression = evaluateExpression(problem);
                    var toUpdate = getIndexToUpdate(problem);
                    problem.array[toUpdate] = expression;
                }
            } else if (nextLineIsElseBranch(problem)) {
                while (nextLineIsAssigmentStatement(problem)) {
                    var expression = evaluateExpression(problem);
                    var toUpdate = getIndexToUpdate(problem);
                    problem.array[toUpdate] = expression;
                }
            }
        }
        while (nextLineIsAssigmentStatement(problem)) {
            var expression = evaluateExpression(problem);
            var toUpdate = getIndexToUpdate(problem);
            problem.array[toUpdate] = expression;
        }
        problem.variables.i += getLoopIncrement(problem);
    }
}

// can they show steps in helper functions (e.g. updating values in the array)
// updating instruction pointer
// doesIfTestPass? Step through if not an array?
// best way to get loop increment
// how to actually test if statement