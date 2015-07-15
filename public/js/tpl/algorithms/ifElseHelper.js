function IfElseHelper() {

	this.currentCodeBlockIndex = -1;
	this.currentIfElseIndex = -1;
	this.currentStatementIndex = -1;

	this.getIfElseBlocks = function(AST, state) {
        var ifElseBlocks = {};
        ifElseBlocks.type = "codeBlock";
        ifElseBlocks.blockIds = [];

		for (i = 0; i < AST["body"].length; i++) {
			if (AST["body"][i]["tag"] == "if") {
                ifElseBlocks.blockIds.push(AST["body"][i]["id"]);
			}
		}
		return ifElseBlocks;

	};

	this.getParameters = function(AST, state) {
		var parameters = {};
		for (i = 0; i < AST["params"].length; i++) {
			var name = AST["params"][i]["name"];
			var value = state["initialization"][name];
			parameters[name] = value;
		}
		return parameters;
	};

	this.addToTheVariableBank = function(parameters, AST, state) {
		for (var variableName in parameters) {
			state["vars"][variableName] = parameters[variableName];
		}

		for (v in state["vars"]) {
			//console.log("var: " + v + " value: " + state["vars"][v]);
		}
        return parameters;
	};

	this.areWeAtTheEnd = function(AST, state) {
		for (variableName in parameters) {
			state["vars"][variableName] = parameters[variableName];
		}
	};

	this.getNextCodeBlock = function(AST, state) {
		this.currentCodeBlockIndex++;
		return AST["body"][this.currentCodeBlockIndex]["location"]["start"]["line"];
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
		var variableObject = {};
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

	this.getNextIfElseStatement = function(AST, state) {
		this.currentIfElseIndex++;

		if (this.currentIfElseIndex == 0) {
			return AST["body"][this.currentCodeBlockIndex];
		}
		else if (this.currentIfElseIndex == 1) {
			return AST["body"][this.currentCodeBlockIndex]["else_branch"];
		}
		else if (this.currentIfElseIndex == 2) {
			return AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"];
		}
		else if (this.currentIfElseIndex == 3) {
			return AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"];
		}
		else if (this.currentIfElseIndex == 4) {
			return AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"]["else_branch"];
		}
		else if (this.currentIfElseIndex == 5) {
			return AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"]["else_branch"]["else_branch"];
		}
	};

    this.getElseStatementLineNum = function(statement) {
        console.log(statement[0]["location"]["start"]["line"] - 1);
        return statement[0]["location"]["start"]["line"] - 1;
    }

    this.getElseIfStatementLineNum = function(statement) {
        console.log("if else");
        console.log(statement["location"]["start"]["line"]);
        return statement["location"]["start"]["line"];
    }

	this.doesThisStatementHaveAConditional = function(statement) {
		if (statement.hasOwnProperty("condition")) {
			return true;
		}
		else {
			// we're going into an "else" branch, so we should reset the if/else index
			this.currentIfElseIndex = -1;
			return false;
		}
	};

	this.doesThisConditionalEvaluateToTrue = function(statement, state) {
		if (this.evaluateConditional(statement["condition"], state)) {
			// we're going into an "if" or "else if" branch, so we should reset the if/else index
			this.currentIfElseIndex = -1;
			return true;
		}
		else {
			return false;
		}
	};

    this.crossOut = function(statement, crossedOutLines, AST, state) {
        var lineNum = statement[0]["location"]["start"]["line"];
        if (typeof crossedOutLines === "undefined") {
            var lines = [];
        }
        else {
            var lines = crossedOutLines.slice();
        }
        lines.push(lineNum);
        return lines;
    }

    this.crossOutOtherBranches = function(statement, crossedOutLines, AST, state) {
        console.log("crossing out other branches");
        console.log(statement);
        console.log(AST["body"][this.currentCodeBlockIndex]);

        var branchesToCrossOut = this.getBranchesToCrossOut(statement["else_branch"], []);
        console.log("cross out branch ids:");
        console.log(branchesToCrossOut);

        crossedOutLines = crossedOutLines.concat(branchesToCrossOut);
        return crossedOutLines;
    }

    this.getBranchesToCrossOut = function(statement, branchIds) {

        if (statement.hasOwnProperty("tag") && statement.tag === "if") {
            branchIds.push(statement.location.start.line);
            var thenBranchIds = this.getBranchesToCrossOut(statement["then_branch"]);
            var elseBranchIds = this.getBranchesToCrossOut(statement["else_branch"]);
            branchIds = branchIds.concat(thenBranchIds);
            branchIds = branchIds.concat(elseBranchIds);
            return branchIds;
        }
        else {
            // the else line isn't in the ast, so we have to add it manually
            branchIds.push(statement[0].location.start.line - 1)
            for (var i = 0; i < statement.length; i++) {
                branchIds.push(statement[i].location.start.line);
            }
            return branchIds;
        }
    }

	this.isThereAnotherIfElseStatement = function(AST, state) {

		var nextElseBranch;

        if (this.currentIfElseIndex + 1 == 1) {
			nextElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"];
		}
		else if (this.currentIfElseIndex + 1 == 2) {
			nextElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"];
		}
		else if (this.currentIfElseIndex + 1 == 3) {
			nextElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"];
		}
		else if (this.currentIfElseIndex + 1 == 4) {
			nextElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"]["else_branch"];
		}
		else if (this.currentIfElseIndex + 1 == 5) {
			nextElseBranch = AST["body"][this.currentCodeBlockIndex]["else_branch"]["else_branch"]["else_branch"]["else_branch"]["else_branch"];
		}

		if (typeof nextElseBranch != "undefined") {
			return true;
		}
		else {
			// there are no more statemenets in the code blcok, so we shoud reset the if/else index
			this.currentIfElseIndex = -1;
			return false;
		}

	};

	this.getNextStatement = function(statements, AST, state) {
		this.currentStatementIndex++;
		return statements[this.currentStatementIndex]["location"]["start"]["line"];
	};

	this.isThereAnotherStatementToExecute = function(statements, AST, state) {
		if (typeof statements[this.currentStatementIndex + 1] != "undefined") {
			//console.log("there is another statement");
			return true;
		}
		else {
			// there are no more statements in this branch, so we should reset the statement index
			this.currentStatementIndex = -1;
			//console.log("there are no more statements");
			return false;
		}
	};

	this.executeUpdateVariableStatement = function(statements, AST, state) {

		// we are updating a variable's value
		if (statements[this.currentStatementIndex]["expression"]["tag"] == "binop" && statements[this.currentStatementIndex]["expression"]["operator"] == "=") {
			var updatedVariable = statements[this.currentStatementIndex]["expression"]["args"][0]["value"];
			var newValue = this.evaluateArg(statements[this.currentStatementIndex]["expression"]["args"][1], state);
			//console.log("updated variable: " + updatedVariable + " new value: " + newValue);

			var parameters = {}
			parameters[updatedVariable] = newValue;
			return parameters;
		}
		else {
			//console.log("this expresison type is not currently supported: " + statement["expression"]["tag"]);
			return null;
		}
	};

	this.evaluateConditional = function(condition, state) {
		if (condition["tag"] == "binop") {
			var arg1 = this.evaluateArg(condition["args"][0], state);
			var arg2 = this.evaluateArg(condition["args"][1], state);

			if (condition["operator"] == "<") {
				//console.log("checking " + arg1 + " < " + arg2);
				return arg1 < arg2;
			}
			else if (condition["operator"] == "<=") {
				//console.log("checking " + arg1 + " <= " + arg2);
				return arg1 <= arg2;
			}
			else if (condition["operator"] == "==") {
				//console.log("checking " + arg1 + " == " + arg2);
				return arg1 == arg2;
			}
			else if (condition["operator"] == ">=") {
				//console.log("checking " + arg1 + " >= " + arg2);
				return arg1 >= arg2;
			}
			else if (condition["operator"] == ">") {
				//console.log("checking " + arg1 + " > " + arg2);
				return arg1 > arg2;
			}
		}
		else {
			//console.log("tried to evaluate non-binop conditional. not currently supported");
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
			//console.log("computing binop with arg1: " + arg1 + " arg2: " + arg2 + " operator: " + arg["operator"]);

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
				string = string + args[i]["value"];
			}
		}

		return string;
	};

}