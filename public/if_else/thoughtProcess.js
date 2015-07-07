
var helper = new HelperObject();
var states = [];

function TPLAlgorithm(AST, state) {
	var explain = "First, look at the structure of the code in the problem.";
	var theseAreTheIfElseBlocks = helper.getIfElseBlocks(AST, state);

	explain = "Next, look at the method call.";
	var theseAreTheParameters = helper.getParameters(AST, state);
	helper.addToTheVariableBank(theseAreTheParameters, AST, state);

	explain = "Now walk through the code line-by-line, keeping track of variable values in the variable bank.";
	do {
		var thisIsTheNextCodeBlockThatWillExecute = helper.getNextCodeBlock(AST, state);
		if (helper.thisIsAVariableDeclarationStatement(AST, state)) {
			var thisIsTheNewVariable = helper.getDeclaredVariable(AST, state);
			helper.addToTheVariableBank(thisIsTheNewVariable, AST, state);
		}
		else if (helper.thisIsAnIfElseStatement(AST, state)) {
			explain = "We're at the beginning of a new if/else block.";
			var executeThisUpdateVariableStatement;

			if (helper.doesTheIfConditionalEvaluateToTrue(AST, state)) {
				console.log("if evaluates to true");
				executeThisUpdateVariableStatement = helper.executeUpdateVariableStatement("if", AST, state);
				helper.addToTheVariableBank(executeThisUpdateVariableStatement, AST, state);
			}
			else if (helper.doesTheFirstElseIfEvaluateToTrue(AST, state)) {
				console.log("first else-if evaluates to true");
				executeThisUpdateVariableStatement = helper.executeUpdateVariableStatement("else_if_1", AST, state);
				helper.addToTheVariableBank(executeThisUpdateVariableStatement, AST, state);
			}
			else if (helper.doesTheSecondElseIfEvaluateToTrue(AST, state)) {
				console.log("second else-if evaluates to true");
				executeThisUpdateVariableStatement = helper.executeUpdateVariableStatement("else_if_2", AST, state);
				helper.addToTheVariableBank(executeThisUpdateVariableStatement, AST, state);
			}
			else if (helper.doesTheThirdElseIfEvaluateToTrue(AST, state)) {
				console.log("third else-if evaluates to true");
				executeThisUpdateVariableStatement = helper.executeUpdateVariableStatement("else_if_3", AST, state);
				helper.addToTheVariableBank(executeThisUpdateVariableStatement, AST, state);
			}
			else if (helper.isThereAnElseStatement(AST, state)) {
				console.log("there is an else statement");
				executeThisUpdateVariableStatement = helper.executeUpdateVariableStatement("else", AST, state);
				helper.addToTheVariableBank(executeThisUpdateVariableStatement, AST, state);
			}
			else {
				console.log("does not go into any branch of the if/else statement");
			}

		}
		else if (helper.thisIsAPrintlnStatement(AST, state)) {
			console.log("found println at index " + thisIsTheNextCodeBlockThatWillExecute);
			var whatDoesThisPrintlnFunctionPrint = helper.getPrintlnOutput(AST, state);
			console.log("final answer: " + whatDoesThisPrintlnFunctionPrint)
			explain = "Enter the solution in the solution box.";
		}

	}
	while (helper.areThereMoreCodeBlocks(AST,state));

	return states;
}

function addState(state) {
	var stateCopy = JSON.parse(JSON.stringify(state));
	states.push(stateCopy);
}

function HelperObject() {

	this.currentCodeBlockIndex = -1;

	this.getIfElseBlocks = function(AST, state) {
		var ifElseBlockCount = 0;
		for (i = 0; i < AST["body"].length; i++) {
			if (AST["body"][i]["tag"] == "if") {
				ifElseBlockCount++;
			}
		}
		return ifElseBlockCount;

	};

	this.getParameters = function(AST, state) {
		var parameters = {}
		for (i = 0; i < AST["params"].length; i++) {
			var name = AST["params"][i]["name"];
			var value = state["initialization"][name];
			parameters[name] = value;
		}
		return parameters;
	};

	this.addToTheVariableBank = function(parameters, AST, state) {
		for (variableName in parameters) {
			state["vars"][variableName] = parameters[variableName];
		}

		for (v in state["vars"]) {
			console.log("var: " + v + " value: " + state["vars"][v]);
		}
	};

	this.areWeAtTheEnd = function(AST, state) {
		for (variableName in parameters) {
			state["vars"][variableName] = parameters[variableName];
		}
	};

	this.getNextCodeBlock = function(AST, state) {
		this.currentCodeBlockIndex++;
		return this.currentCodeBlockIndex;
	};

	this.areThereMoreCodeBlocks = function(AST, state) {
		if (this.currentCodeBlockIndex + 1 < AST["body"].length) {
			return true;
		}
		else {
			return false;
		}
	};

	this.thisIsAVariableDeclarationStatement = function(AST, state) {
		if (AST["body"][this.currentCodeBlockIndex]["tag"] == "declaration") {
			return true;
		}
		else {
			return false;
		}
	};

	this.getDeclaredVariable = function(AST, state) {
		var variableObject = {}
		var variableName = AST["body"][this.currentCodeBlockIndex]["expression"]["args"][0].value;
		var variableValue = AST["body"][this.currentCodeBlockIndex]["expression"]["args"][1].value;
		variableObject[variableName] = variableValue;
		return variableObject;
	};

	this.thisIsAnIfElseStatement = function(AST, state) {
		if (AST["body"][this.currentCodeBlockIndex]["tag"] == "if") {
			return true;
		}
		else {
			return false;
		}
	};

	this.doesTheIfConditionalEvaluateToTrue = function(AST, state) {
		return this.evaluateConditional(AST["body"][this.currentCodeBlockIndex]["condition"], state);
	};

	this.doesTheFirstElseIfEvaluateToTrue = function(AST, state) {
		if (typeof AST["body"][this.currentCodeBlockIndex]["else_branch"] != "undefined") {
			var elseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"];
			if (elseBranch.hasOwnProperty("tag") && elseBranch["tag"] == "if") {
				return this.evaluateConditional(elseBranch["condition"], state);
			}
		}

		return false;
	};

	this.doesTheSecondElseIfEvaluateToTrue = function(AST, state) {
		if (typeof AST["body"][this.currentCodeBlockIndex]["else_branch"] != "undefined") {
			var elseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"];
			if (elseBranch.hasOwnProperty("tag") && elseBranch["tag"] == "if") {
				if (typeof elseBranch["else_branch"] != "undefined") {
					var secondElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"];
					if (secondElseBranch.hasOwnProperty("tag") && secondElseBranch["tag"] == "if") {
						return this.evaluateConditional(secondElseBranch["condition"], state);
					}
				}
			}
		}

		return false;
	};

	this.doesTheThirdElseIfEvaluateToTrue = function(AST, state) {
		if (typeof AST["body"][this.currentCodeBlockIndex]["else_branch"] != "undefined") {
			var elseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"];
			if (elseBranch.hasOwnProperty("tag") && elseBranch["tag"] == "if") {
				if (typeof elseBranch["else_branch"] != "undefined") {
					var secondElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"];
					if (secondElseBranch.hasOwnProperty("tag") && secondElseBranch["tag"] == "if") {
						if (typeof secondElseBranch["else_branch"] != "undefined") {
							var thirdElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"];
							if (thirdElseBranch.hasOwnProperty("tag") && thirdElseBranch["tag"] == "if") {
								return this.evaluateConditional(thirdElseBranch["condition"], state);
							}
						}
					}
				}
			}
		}
		return false;
	};

	this.isThereAnElseStatement = function(AST, state) {
		if (typeof AST["body"][this.currentCodeBlockIndex]["else_branch"] != "undefined") {
			var elseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"];
			if (elseBranch.hasOwnProperty("tag") && elseBranch["tag"] == "if") {
				if (typeof elseBranch["else_branch"] != "undefined") {
					var secondElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"];
					if (secondElseBranch.hasOwnProperty("tag") && secondElseBranch["tag"] == "if") {
						if (typeof secondElseBranch["else_branch"] != "undefined") {
							var thirdElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"];
							if (thirdElseBranch.hasOwnProperty("tag") && thirdElseBranch["tag"] == "if") {
								if (typeof thirdElseBranch["else_branch"] != "undefined") {
									return true;
								}
							}
							else {
								return true;
							}
						}
					}
					else {
						return true;
					}
				}
			}
			else {
				return true;
			}
		}
		return false;
	};

	this.evaluateConditional = function(condition, state) {
		if (condition["tag"] == "binop") {
			var arg1 = this.evaluateArg(condition["args"][0], state);
			var arg2 = this.evaluateArg(condition["args"][1], state);

			if (condition["operator"] == "<") {
				console.log("checking " + arg1 + " < " + arg2);
				return arg1 < arg2;
			}
			else if (condition["operator"] == "<=") {
				console.log("checking " + arg1 + " <= " + arg2);
				return arg1 <= arg2;
			}
			else if (condition["operator"] == "==") {
				console.log("checking " + arg1 + " == " + arg2);
				return arg1 == arg2;
			}
			else if (condition["operator"] == ">=") {
				console.log("checking " + arg1 + " >= " + arg2);
				return arg1 >= arg2;
			}
			else if (condition["operator"] == ">") {
				console.log("checking " + arg1 + " > " + arg2);
				return arg1 > arg2;
			}
		}
		else {
			console.log("tried to evaluate non-binop conditional. not currently supported");
		}
	};

	this.evaluateArg = function(arg, state) {
		if (arg["tag"] == "literal") {
			return arg["value"];
		}
		else if (arg["tag"] == "identifier") {
			return state["vars"][arg["value"]];
		}
		else if (arg["tag"] == "binop") {

			var arg1 = this.evaluateArg(arg["args"][0], state);
			var arg2 = this.evaluateArg(arg["args"][1], state);
			console.log("computing binop with arg1: " + arg1 + " arg2: " + arg2 + " operator: " + arg["operator"]);

			// Will probably need to update this to work with strings and doubles?!
			if (arg["operator"] == "+") {
				return arg1 + arg2;
			}
			else if (arg["operator"] == "-") {
				return arg1 - arg2;
			}
			else if (arg["operator"] == "/") {
				return arg1 / arg2;
			}
			else if (arg["operator"] == "*") {
				return arg1 * arg2;
			}
		}
	}

	this.executeUpdateVariableStatement = function(statement, AST, state) {

		var expression;

		if (statement == "if") {
			expression = AST["body"][this.currentCodeBlockIndex]["then_branch"][0];
		}
		else if (statement == "else_if_1") {
			expression = AST["body"][this.currentCodeBlockIndex]["else_branch"]["then_branch"][0];
		}
		else if (statement == "else_if_2") {
			expression = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["then_branch"][0];
		}
		else if (statement == "else_if_3") {
			expression = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"]["then_branch"][0];
		}
		else if (statement == "else") {
			expression = this.getElseExpressionStatement(AST, state);
		}

		// we are updating a variable's value
		if (expression["expression"]["tag"] == "binop" && expression["expression"]["operator"] == "=") {
			var updatedVariable = expression["expression"]["args"][0]["value"];
			var newValue = this.evaluateArg(expression["expression"]["args"][1], state);
			console.log("updated variable: " + updatedVariable + " new value: " + newValue);

			var parameters = {}
			parameters[updatedVariable] = newValue;
			return parameters;
		}
		else {
			console.log("this expresison type is not currently supported: " + expression["expression"]["tag"]);
			return null;
		}
	};

	this.getElseExpressionStatement = function(AST, state) {
		if (AST["body"][this.currentCodeBlockIndex].hasOwnProperty("else_branch")) {
			var elseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"];
			if (elseBranch.hasOwnProperty("tag") && elseBranch["tag"] == "if") {
				if (elseBranch.hasOwnProperty("else_branch")) {
					var secondElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"];
					if (secondElseBranch.hasOwnProperty("tag") && secondElseBranch["tag"] == "if") {
						if (secondElseBranch.hasOwnProperty("else_branch")) {
							var thirdElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"];
							if (thirdElseBranch.hasOwnProperty("tag") && thirdElseBranch["tag"] == "if") {
								if (thirdElseBranch.hasOwnProperty("else_branch")) {
									return thirdElseBranch["else_branch"][0];
								}
							}
							else {
								return thirdElseBranch[0];
							}
						}
					}
					else {
						return secondElseBranch[0];
					}
				}
			}
			else {
				return elseBranch[0];
			}
		}
		return false;
	};



	this.thisIsAPrintlnStatement = function(AST, state) {
		if (AST["body"][this.currentCodeBlockIndex]["tag"] == "expression") {
			if (AST["body"][this.currentCodeBlockIndex]["expression"].hasOwnProperty("object")) {
				if (AST["body"][this.currentCodeBlockIndex]["expression"]["object"].hasOwnProperty("name")) {
					if (AST["body"][this.currentCodeBlockIndex]["expression"]["object"]["name"] == "println") {
						return true;
					}
				}
			}
		}
		return false;
	};

	this.getPrintlnOutput = function(AST, state) {
		var printlnArgs = AST["body"][this.currentCodeBlockIndex]["expression"]["args"];
		var printlnOutput = this.createPrintlnOutput(printlnArgs, "");

		for (var variableName in state["vars"]) {
			while (printlnOutput.indexOf(variableName) != -1) {
				printlnOutput = printlnOutput.replace(variableName, state["vars"][variableName]);
			}
		}

		return printlnOutput;
	};

	this.createPrintlnOutput = function(args, string) {
		for (var i = 0; i < args.length; i++) {
			if (args[i]["tag"] == "binop") {
				string = this.createPrintlnOutput(args[i]["args"], string);
			}
			else if (args[i]["tag"] == "identifier" || args[i]["tag"] == "literal") {
				string = args[i]["value"] + string;
			}
		}

		return string;
	}



}