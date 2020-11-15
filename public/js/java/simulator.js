
/** Helper functions to simulator java code (without explanations) */
var java_simulator = function() {
    "use strict";
    var self = {};

    /**
     * Evaluates the given expression to completion.
     * @param context: an object mapping local variable names to {type:string, value:*} objects.
     */
    function evaluate_expression(context, expr) {
        if (!context || !expr || !expr.tag) throw new Error("invalid arguments to evaluate!");

        var arg1, arg2, obj, idx, arg1v, arg2v, r, args;

        // HACK this only works for integers and booleans kinda!
        // FIXME add type checking and make it behave correctly for overloaded operators.
        switch (expr.tag) {
            case 'paren_expr':
                return evaluate_expression(context, expr.value);
                break;
            case 'binop':
                arg1 = evaluate_expression(context, expr.args[0]);
                arg2 = evaluate_expression(context, expr.args[1]);
                arg1v = arg1.value;
                arg2v = arg2.value;
                switch (expr.operator) {
                    case '<':
                        return {type: 'bool', value: arg1v < arg2v};
                    case '<=':
                        return {type: 'bool', value: arg1v <= arg2v};
                    case '>':
                        return {type: 'bool', value: arg1v > arg2v};
                    case '>=':
                        return {type: 'bool', value: arg1v >= arg2v};
                    case '==':
                        return {type: 'bool', value: arg1v === arg2v};
                    case '!=':
                        return {type: 'bool', value: arg1v !== arg2v};
                    // FIXME these do not short-circuit
                    case '&&':
                        return {type: 'bool', value: arg1v && arg2v};
                    case '||':
                        return {type: 'bool', value: arg1v || arg2v};
                    case '+':
                        return {type: 'int', value: arg1v + arg2v};
                    case '-':
                        return {type: 'int', value: arg1v - arg2v};
                    case '*':
                        return {type: 'int', value: arg1v * arg2v};
                    case '/':
                        return {
                            type: 'int',
                            value: arg1v / arg2v < 0 ? Math.ceil(arg1v / arg2v) : Math.floor(arg1v / arg2v)
                        };
                    case '%':
                        return {type: 'int', value: arg1v % arg2v};
                    case '=':
                        arg1.value = arg2.value;
                        return arg1;
                    case '+=':
                        arg1.value += arg2.value;
                        return arg1;
                    case '-=':
                        arg1.value -= arg2.value;
                        return arg1;
                    default:
                        throw new Error("Unknown binary operator " + expr.operator);
                }
            // case 'postfix':
            //     arg1 = evaluate_expression(context, expr.args[0]);
            //     switch (expr.operator) {
            //         case '++': arg1.value++; return arg1;
            //         case '--': arg1.value--; return arg1;
            //         default: throw new Error("Unknown postfix operator " + expr.operator);
            //     }
            case 'literal':
                return {type: expr.type, value: expr.value};
            case 'identifier':
                r = context[expr.value];
                if (!r) throw new Error("unknown identifier " + expr.value);
                return r;
            case 'index':
                obj = evaluate_expression(context, expr.object);
                idx = evaluate_expression(context, expr.index);
                if (obj.type !== 'array') throw new Error("Cannot index into object of type " + obj.type);
                r = obj.value[idx.value];
                if (!r) throw new Error("invalid array index " + idx.value + " of " + obj.type);
                return r;
            case 'reference':
                obj = evaluate_expression(context, expr.object);
                // HACK hooray for hacky array lengths
                if (obj.type === 'array' && expr.name === 'length') { // FIXME: get rid of this
                    return {type: 'int', value: obj.value.length};
                } else {
                    throw new Error("Unable to evaluate reference.");
                }
            case 'call':
                obj = expr.object; // HACK ignore defined functions
                args = [];
                for (let arg of expr.args) {
                    args.push(evaluate_expression(context, arg));
                }
                if (obj.value === 'range') {
                    var val = [];
                    if (args.length === 1) {
                        for (let i = 0; i < args[0].value; i++) {
                            val.push({type: 'int', value: i})
                        }
                    } else if (args.length <= 3) {
                        for (let i = args[0].value; i < args[1].value; i += (args.length === 2 ? 1 : args[2].value)) {
                            val.push({type: 'int', value: i});
                        }
                    } else {
                        throw new Error("wrong number of arguments to range (expected 1, 2, or 3)")
                    }
                    return {type:'array', value:val};
                } else if (obj.value === 'len' && args[0].type === 'array') {
                    return {type:'int', value:args[0].value.length};
                } else {
                    throw new Error("unable to evaluate function call.")
                }
            case "return":
                obj = expr.args;
                for (let i = 0; i < obj.value.length; i++) {
                    obj.value[i] = evaluate_expression(context, obj.value[i]);
                }
                return obj;
            default: throw new Error("expression type " + expr.tag + " cannot be evaluated");
        }
    }
    self.evaluate_expression = evaluate_expression;

    /**
     * Executes the given statement to completion.
     * @param context: an object mapping local variable names to {type:string, value:*} objects.
     */
    function execute_statement(context, stmt) {
        switch (stmt.tag) {
            case 'expression':
            case 'declaration':
                return this.evaluate_expression(context, stmt.expression);
            default: throw new Error("unknown statement type " + stmt.tag);
        }
    }
    self.execute_statement = execute_statement;

    /**
     * Returns the next statement that should execute after the given, with respect to the given root ast.
     * Will only work for straight-line code or exiting blocks.
     */
    self.get_next_statement = function(ast, stmt) {
        var parent = java_ast.parent_of(stmt, ast);
        if (!parent) return null;

        var children = java_ast.children_of(parent);
        for (var idx in children) {
            if (children[idx] === stmt) break;
        }
        idx++;
        if (idx < children.length) {
            return children[idx];
        } else {
            return self.get_next_statement(ast, parent);
        }
    };

    return self;
}();

