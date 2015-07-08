function TPLAlgorithm(AST) {
    let explain;
    let theseAreTheIfElseBlocks;
    let theseAreTheParameters;
    let thisIsTheNextCodeBlockThatWillExecute;
    let thisIsTheNextIfElseBranchThatWillExecute;
    let thisIsTheNextStatementThatWillExecute;
    let executeThisUpdateVariableStatement;
    let whatDoesThisPrintlnFunctionPrint;
    let thisIsTheNewVariable;
    let executeThisUpdateVariableStatement;

	explain = "First, look at the structure of the code in the problem.";
	theseAreTheIfElseBlocks = helper.getIfElseBlocks(AST, state);

	explain = "Next, look at the method call.";
	theseAreTheParameters = helper.getParameters(AST, state);
	helper.addToTheVariableBank(theseAreTheParameters, AST, state);

	explain = "Now walk through the code line-by-line, keeping track of variable values in the variable bank.";
	do {
		thisIsTheNextCodeBlockThatWillExecute = helper.getNextCodeBlock(AST, state);
		if (helper.thisIsAVariableDeclarationStatement(AST, state)) {
			thisIsTheNewVariable = helper.getDeclaredVariable(AST, state);
			helper.addToTheVariableBank(thisIsTheNewVariable, AST, state);
		}
		else if (helper.thisIsAnIfElseStatement(AST, state)) {
			explain = "We're at the beginning of a new if/else block.";
			do {
				thisIsTheNextIfElseBranchThatWillExecute = helper.getNextIfElseStatement(AST, state);
				if (helper.doesThisStatementHaveAConditional(thisIsTheNextIfElseBranchThatWillExecute)) {
					if (helper.doesTheConditionalEvaluateToTrue(thisIsTheNextIfElseBranchThatWillExecute, state)) {
						do {
							thisIsTheNextStatementThatWillExecute = helper.getNextStatement(thisIsTheNextIfElseBranchThatWillExecute["then_branch"], AST, state);
							executeThisUpdateVariableStatement = helper.executeUpdateVariableStatement(thisIsTheNextStatementThatWillExecute, AST, state);
							helper.addToTheVariableBank(executeThisUpdateVariableStatement, AST, state);
						}
						while (helper.isThereAnotherStatementToExecute(thisIsTheNextIfElseBranchThatWillExecute["then_branch"], AST, state));

						break;
					}
				}
				else {
					do {
						thisIsTheNextStatementThatWillExecute = helper.getNextStatement(thisIsTheNextIfElseBranchThatWillExecute, AST, state);
						executeThisUpdateVariableStatement = helper.executeUpdateVariableStatement(thisIsTheNextStatementThatWillExecute, AST, state);
						helper.addToTheVariableBank(executeThisUpdateVariableStatement, AST, state);
					}
					while (helper.isThereAnotherStatementToExecute(thisIsTheNextIfElseBranchThatWillExecute, AST, state));
					break;
				}
			}
			while (helper.isThereAnotherIfElseStatement(AST, state));
		}
		else if (helper.thisIsAPrintlnStatement(AST, state)) {
			whatDoesThisPrintlnFunctionPrint = helper.getPrintlnOutput(AST, state);
			explain = "Enter the solution in the solution box.";
		}

	}
	while (helper.areThereMoreCodeBlocks(AST,state));
}