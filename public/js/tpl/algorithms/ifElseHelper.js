function IfElseHelper() {

    this.currentCodeBlockIndex = -1;
    this.currentIfElseIndex = 0;
    this.currentStatementIndex = -1;

    this.getIfElseBlocks = function(AST) {
        var ifElseBlocks = {};
        ifElseBlocks.type = "codeBlock";
        ifElseBlocks.blockIds = [];

        for (i = 0; i < AST["body"].length; i++) {
            if (AST["body"][i]["tag"] === "if") {
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
            if (typeof value === "string") {
                console.warn("initial parameter " + name + " is a string");
            }
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

    this.getNextCodeBlock = function(AST) {
        this.currentCodeBlockIndex++;
        return AST["body"][this.currentCodeBlockIndex]["location"]["start"]["line"];
    };

    this.areThereMoreCodeBlocks = function(AST) {
        if (this.currentCodeBlockIndex + 1 < AST["body"].length) {
            this.currentIfElseIndex = 0; // reset index upon entering new block
            return true;
        } else {
            return false;
        }
    };

    this.thisIsAVariableDeclarationStatement = function(AST) {
        return AST["body"][this.currentCodeBlockIndex]["tag"] === "declaration";
    };

    this.getDeclaredVariable = function(AST) {
        var variableObject = {};
        var variableName = AST["body"][this.currentCodeBlockIndex]["expression"]["args"][0].value;
        var variableValue = AST["body"][this.currentCodeBlockIndex]["expression"]["args"][1].value;
        variableObject[variableName] = variableValue;
        return variableObject;
    };

    this.thisIsAnIfElseStatement = function(AST) {
        return AST["body"][this.currentCodeBlockIndex]["tag"] === "if";
    };

    // NOTE assumes no nested ifs (an if inside a then branch)
    this.getNextIfElseStatement = function(AST) {
        var index = this.currentIfElseIndex++;
        var ret = AST["body"][this.currentCodeBlockIndex];
        while (index > 0) {
            ret = ret.else_branch;
            index--;
        }
        return ret;
    };

    this.getElseStatementLineNum = function(statement) {
        return statement[0]["location"]["start"]["line"] - 1;
    };

    this.getElseIfStatementLineNum = function(statement) {
        return statement["location"]["start"]["line"];
    };

    this.doesThisStatementHaveAConditional = function(statement) {
        return statement.hasOwnProperty("condition");
    };

    this.doesThisConditionalEvaluateToTrue = function(statement, state) {
        return this.evaluateExpr(statement["condition"], state);
    };

    function merge(d1, d2) {
        var r = {};
        var key;
        for (key in d1) {
            r[key] = d1[key];
        }
        for (key in d2) {
            r[key] = d2[key];
        }
        return r;
    }

    // using an object as a set, all values are placeholder
    this.crossOut = function(statement, crossedOutLines) {
        var lines = {};
        if (crossedOutLines) {
            lines = JSON.parse(JSON.stringify(crossedOutLines));
        }
        statement.forEach(function (line) {
            var start = line.location.start.line;
            var end = line.location.end.line;
            while (start <= end) {
                lines[start++] = 1;
            }
        });
        return lines;
    };

    // using an object as a set, all values are placeholder
    this.crossOutOtherBranches = function(statement, crossedOutLines) {
        var branchesToCrossOut = this.getBranchesToCrossOut(statement["else_branch"], {});
        if (typeof crossedOutLines === "undefined") {
            var lines = {};
        } else {
            var lines = JSON.parse(JSON.stringify(crossedOutLines));
        }

        lines = merge(lines, branchesToCrossOut);
        return lines;
    };

    // using an object as a set, all values are placeholder
    this.getBranchesToCrossOut = function(statement, branchIds) {
        if (statement) {
            if (statement.hasOwnProperty("tag") && statement.tag === "if") {
                branchIds[statement.location.start.line] = 1;
                var thenBranchIds = this.getBranchesToCrossOut(statement["then_branch"], {});
                var elseBranchIds = this.getBranchesToCrossOut(statement["else_branch"], {});
                branchIds = merge(branchIds, thenBranchIds);
                branchIds = merge(branchIds, elseBranchIds);
                return branchIds;
            }
            else {
                // the else line isn't in the ast, so we have to add it manually
                branchIds[statement[0].location.start.line - 1] = 1;
                for (var i = 0; i < statement.length; i++) {
                    branchIds[statement[i].location.start.line] = 1;
                }
                return branchIds;
            }
        }
        return branchIds;
    };

    // NOTE assumes no nested ifs (an if inside a then branch)
    this.isThereAnotherIfElseStatement = function(AST) {

        var index = this.currentIfElseIndex;
        var nextElseBranch = AST["body"][this.currentCodeBlockIndex];
        while (index > 0 && nextElseBranch) {
            nextElseBranch = nextElseBranch.else_branch;
            index--;
        }

        return nextElseBranch && true; // make it true or leave it a falsy value
    };

    this.getNextStatement = function(statements) {
        this.currentStatementIndex++;
        return statements[this.currentStatementIndex]["location"]["start"]["line"];
    };

    this.isThereAnotherStatementToExecute = function(statements) {
        if (typeof statements[this.currentStatementIndex + 1] !== "undefined") {
            //console.log("there is another statement");
            return true;
        } else {
            // there are no more statements in this branch, so we should reset the statement index
            this.currentStatementIndex = -1;
            //console.log("there are no more statements");
            return false;
        }
    };

    this.executeUpdateVariableStatement = function(statements, AST, state) {
        var updatedVariable, newValue, parameters;
        // we are updating a variable's value
        if (statements[this.currentStatementIndex]["expression"]["tag"] === "binop") {
            updatedVariable = statements[this.currentStatementIndex]["expression"]["args"][0]["value"];
            var newValue = this.evaluateExpr(statements[this.currentStatementIndex]["expression"]["args"][1], state);
            var oldValue = this.evaluateExpr(statements[this.currentStatementIndex]["expression"]["args"][0], state);

            switch (statements[this.currentStatementIndex]["expression"]["operator"]) {
                case '=': break; // do nothing, newValue already correct
                case '+=': newValue = oldValue + newValue; break;
                case '-=': newValue = oldValue - newValue; break;
                case '*=': newValue = oldValue * newValue; break;
                case '/=': newValue = Math.floor(oldValue / newValue); break;
                case '%=': newValue = oldValue % newValue; break;
                default: throw new Error('unkown binary operator ' + statements[this.currentStatementIndex]["expression"]["operator"]);
            }

            parameters = {};
            parameters[updatedVariable] = newValue;
            return parameters;
        } else if (statements[this.currentStatementIndex]["expression"]["tag"] === "postfix") {
            updatedVariable = statements[this.currentStatementIndex]["expression"]["args"][0]["value"];
            switch (statements[this.currentStatementIndex]["expression"]["operator"]) {
                case "++":
                    newValue = this.evaluateExpr(statements[this.currentStatementIndex]["expression"]["args"][0], state) + 1;
                    break;
                case "--":
                    newValue = this.evaluateExpr(statements[this.currentStatementIndex]["expression"]["args"][0], state) - 1;
                    break;
                default:
                    throw new Error("unrecognized postfix operator: " + statements[this.currentStatementIndex]["expression"]["operator"]);
            }

            parameters = {};
            parameters[updatedVariable] = newValue;
            return parameters;
        } else {
            throw new Error("this expresison type is not currently supported: " + statement["expression"]["tag"]);
        }
    };

    this.evaluateExpr = function(expr, state) {
        if (expr.tag === "binop") {
            var arg1 = this.evaluateExpr(expr.args[0], state);
            var arg2 = this.evaluateExpr(expr.args[1], state);

            // Will probably need to update this to work with strings and doubles?!
            if (expr.operator === "<") {
                //console.log("checking " + arg1 + " < " + arg2);
                return arg1 < arg2;
            } else if (expr.operator === "<=") {
                //console.log("checking " + arg1 + " <= " + arg2);
                return arg1 <= arg2;
            } else if (expr.operator === "==") {
                //console.log("checking " + arg1 + " == " + arg2);
                return arg1 === arg2;
            } else if (expr.operator === "!=") {
                //console.log("checking " + arg1 + " != " + arg2);
                return arg1 !== arg2;
            } else if (expr.operator === ">=") {
                //console.log("checking " + arg1 + " >= " + arg2);
                return arg1 >= arg2;
            } else if (expr.operator === ">") {
                //console.log("checking " + arg1 + " > " + arg2);
                return arg1 > arg2;
            } else if (expr.operator === "&&") {
                //console.log("checking " + arg1 + " && " + arg2);
                return arg1 && arg2;
            } else if (expr.operator === "||") {
                //console.log("checking " + arg1 + " || " + arg2);
                return arg1 || arg2;
            } else if (expr.operator === "+") {
                return arg1 + arg2;
            } else if (expr.operator === "-") {
                return arg1 - arg2;
            } else if (expr.operator === "/") {
                return arg1 / arg2;
            } else if (expr.operator === "*") {
                return arg1 * arg2;
            }
        } else if (expr.tag === "literal") {
            return expr.value;
        } else if (expr.tag === "identifier") {
            return state.vars[expr.value];
        } else {
            throw new Error("expr type " + binop.tag + " cannot be evaluated");
        }
    };

    this.thisIsAPrintlnStatement = function(AST) {
        if (AST["body"][this.currentCodeBlockIndex]["tag"] === "expression") {
            if (AST["body"][this.currentCodeBlockIndex]["expression"].hasOwnProperty("object")) {
                if (AST["body"][this.currentCodeBlockIndex]["expression"]["object"].hasOwnProperty("name")) {
                    if (AST["body"][this.currentCodeBlockIndex]["expression"]["object"]["name"] === "println") {
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
            while (printlnOutput.indexOf(variableName) !== -1) {
                printlnOutput = printlnOutput.replace(variableName, state["vars"][variableName]);
            }
        }

        return printlnOutput;
    };

    this.createPrintlnOutput = function(args, string) {
        for (var i = 0; i < args.length; i++) {
            if (args[i]["tag"] === "binop") {
                string = this.createPrintlnOutput(args[i]["args"], string);
            } else if (args[i]["tag"] === "identifier" || args[i]["tag"] === "literal") {
                string = string + args[i]["value"];
            }
        }

        return string;
    };

}

function if_else_make_initial_state(problem, variant) {
    "use strict";

    var ast = java_parsing.parse_method(problem.content.text);
    var args = JSON.parse(JSON.stringify(variant.arguments));

    return {
        variant: variant,
        AST: ast,
        prompt: "First, look at the structure of the code in the problem",
        initialization: args,
        lineNum: 1,
        vars: {},
        highlighted: [],
        problemText: problem.content.text
    };
}

