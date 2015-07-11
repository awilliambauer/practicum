function TPLAlgorithm(AST) {
    let theseAreTheIfElseBlocks;
    let theseAreTheParameters:arguments;
    let addTheParametersToTheVariableBank:variableBank;
    let thisIsTheNextLineThatWillExecute:codeLine;
    let thisIsTheNextIfElseBranchThatWillExecute;
    let thisIsTheNextStatementThatWillExecute;
    let executeThisUpdateVariableStatement;
    let whatDoesThisPrintlnFunctionPrint;
    let executeThisUpdateVariableStatement;
    let crossOutThisLine:crossedOutLine;

	[prompt]
	"First, look at the structure of the code in the problem.";
	theseAreTheIfElseBlocks = helper.getIfElseBlocks(AST, state);

	[prompt]
	"Next, look at the method call.";
	theseAreTheParameters = helper.getParameters(AST, state);
	addTheParametersToTheVariableBank = helper.addToTheVariableBank(theseAreTheParameters, AST, state);

	[prompt]
	"Now walk through the code line-by-line, keeping track of variable values in the variable bank.";
	do {
		thisIsTheNextLineThatWillExecute = helper.getNextCodeBlock(AST, state);
		if (helper.thisIsAVariableDeclarationStatement(AST, state)) {
		    let thisLineDeclaresANewVariable:assignment;
			thisLineDeclaresANewVariable = helper.getDeclaredVariable(AST, state);
			let addTheNewVariableToTheVariableBank:variableBank;
			addTheNewVariableToTheVariableBank = helper.addToTheVariableBank(thisLineDeclaresANewVariable, AST, state);
		}
		else if (helper.thisIsAnIfElseStatement(AST, state)) {
			[prompt]
			"We're at the beginning of a new if/else block.";
			do {
				thisIsTheNextIfElseBranchThatWillExecute = helper.getNextIfElseStatement(AST, state);
				if (helper.doesThisStatementHaveAConditional(thisIsTheNextIfElseBranchThatWillExecute)) {
					if (helper.doesTheConditionalEvaluateToTrue(thisIsTheNextIfElseBranchThatWillExecute, state)) {
						do {
							thisIsTheNextLineThatWillExecute = helper.getNextStatement(thisIsTheNextIfElseBranchThatWillExecute["then_branch"], AST, state);
							executeThisUpdateVariableStatement = helper.executeUpdateVariableStatement(thisIsTheNextIfElseBranchThatWillExecute["then_branch"], AST, state);
							helper.addToTheVariableBank(executeThisUpdateVariableStatement, AST, state);
						}
						while (helper.isThereAnotherStatementToExecute(thisIsTheNextIfElseBranchThatWillExecute["then_branch"], AST, state));

						break;
					}
					else {
					    crossOutThisLine = helper.crossOut(thisIsTheNextIfElseBranchThatWillExecute, crossOutThisLine, AST, state);
					}
				}
				else {
					do {
						thisIsTheNextLineThatWillExecute = helper.getNextStatement(thisIsTheNextIfElseBranchThatWillExecute, AST, state);
						executeThisUpdateVariableStatement = helper.executeUpdateVariableStatement(thisIsTheNextIfElseBranchThatWillExecute, AST, state);
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
			[prompt]
			"Enter the solution in the solution box.";
		}

	}
	while (helper.areThereMoreCodeBlocks(AST,state));
}