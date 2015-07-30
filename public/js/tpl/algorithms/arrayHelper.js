function ArrayHelper() {
    "use strict";

    this.copy_args = function(o) {
        for (var key in o) {
            return {
                name: key,
                type: 'array',
                value: o[key].map(function(i) { return {type:'int', value:i}; })
            };
        }
    };

    this.get_parameter = function(args) {
        // assumes everything is an array!
        for (var key in args) {
            return {
                name: key,
                type: 'array',
                value: args[key].map(function(i) { return {type:'int', value:i}; })
            };
        }
    }

    // HACK FIXME remove this asap
    this.True = function() { return true; };

    this.create_new_variable_bank = function() { return {}; };

    this.add_this_to_the_variable_bank = function(bank, variable) {
        bank[variable.name] = {type:variable.type, value:variable.value};
    }

    this.evaluate_expression = function(context, expr) {
        var arg1, arg2, obj, idx, arg1v, arg2v, r;

        // HACK this only works for integers and booleans kinda!
        // FIXME add type checking and make it behave correctly for overloaded operators.
        switch (expr.tag) {
            case 'binop':
                arg1 = this.evaluate_expression(context, expr.args[0]);
                arg2 = this.evaluate_expression(context, expr.args[1]);
                arg1v = arg1.value;
                arg2v = arg2.value;
                switch (expr.operator) {
                    case '<': return {type: 'bool', value: arg1v < arg2v};
                    case '<=': return {type: 'bool', value: arg1v <= arg2v};
                    case '>': return {type: 'bool', value: arg1v > arg2v};
                    case '>=': return {type: 'bool', value: arg1v >= arg2v};
                    case '==': return {type: 'bool', value: arg1v === arg2v};
                    case '!=': return {type: 'bool', value: arg1v !== arg2v};
                    // FIXME these do not short-circuit
                    case '&&': return {type: 'bool', value: arg1v && arg2v};
                    case '||': return {type: 'bool', value: arg1v || arg2v};
                    case '+': return {type: 'int', value: arg1v + arg2v};
                    case '-': return {type: 'int', value: arg1v - arg2v};
                    case '*': return {type: 'int', value: arg1v * arg2v};
                    // FIXME this probably doesn't do the correct thing for negatives
                    case '/': return {type: 'int', value: Math.floor(arg1v / arg2v)};
                    case '%': return {type: 'int', value: arg1v % arg2v};
                    case '=': arg1.value = arg2.value; return arg1;
                    default: throw new Error("Unknown binary operator " + expr.operator);
                }
            case 'postfix':
                arg1 = this.evaluate_expression(context, expr.args[0]);
                switch (expr.operator) {
                    case '++': arg1.value++; return arg1;
                    case '--': arg1.value--; return arg1;
                    default: throw new Error("Unknown postfix operator " + expr.operator);
                }
            case 'literal': return {type:expr.type, value:expr.value};
            case 'identifier':
                r = context[expr.value];
                if (!r) throw new Error("unknown identifier " + expr.value);
                return r;
            case 'index':
                obj = this.evaluate_expression(context, expr.object);
                idx = this.evaluate_expression(context, expr.index);
                if (obj.type !== 'array') throw new Error("Cannot index into object of type " + obj.type);
                r = obj.value[idx.value];
                if (!r) throw new Error("invalid array index " + idx.value + " of " + obj.type);
                return r;
            case 'reference':
                obj = this.evaluate_expression(context, expr.object);
                // HACK hooray for hacky array lengths
                if (obj.type === 'array' && expr.name === 'length') {
                    return {type:'int', value:obj.value.length};
                } else {
                    throw new Error("Unable to evaluate reference.");
                }

            default: throw new Error("expression type " + expr.tag + " cannot be evaluated");
        }
    };

    this.execute_statement = function(state, stmt) {
        switch (stmt.tag) {
            case 'expression': return this.evaluate_expression(state, stmt.expression);
            default: throw new Error("unkown statement type " + stmt.tag);
        }
    }

    this.get_next_statement = function(ast, stmt) {
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
            return this.get_next_statement(ast, parent);
        }
    }

    this.create_variable = function(variable_bank, declaration_stmt) {
        if (declaration_stmt.expression.args[0].tag !== 'identifier') throw new Error("not a valid variable declaration!");
        var name = declaration_stmt.expression.args[0].value;
        var val = this.evaluate_expression(variable_bank, declaration_stmt.expression.args[1]);
        return {
            name: name,
            type: val.type,
            value: val.value
        };
    }

    this.get_loop = function(ast) {
        // assume loop is the top node
        var loop = ast.body[0];
        if (!loop || loop.tag !== 'for') throw new Error("can't find the for loop!");
        return loop;
    }

    this.get_loop_init_variable = function(variable_bank, initializer) {
        if (initializer.tag !== 'declaration' || initializer.type !== 'int') throw new Error("for loop initializer isn't an int declaration!");
        return this.create_variable(variable_bank, initializer);
    }

    this.loop_condition_true = function(state, condition_stmt) {
        var e = this.evaluate_expression(state, condition_stmt);
        if (e.type !== 'bool') throw new Error("Condition is not of type boolean!");
        return e.value;
    }

    this.solve_the_problem = function(state) {
        return;

        console.info(state);

        // populate the variable bank
        state.vars = this.copy_args(state.args);
        var array_name = this.get_array_argument(state);

        console.info(array);

        // assume the first statement is a for loop
        var loop = state.ast.body[0];
        if (loop.tag !== 'for') throw new Error("can't find the for loop!");

        // run the initializer, assume it's a declaration of an int
        if (loop.initializer.tag !== 'declaration' || loop.initializer.type !== 'int') throw new Error("for loop initializer isn't an int declaration!");
        this.add_to_variable_bank(state, loop.initializer);

        var loop_condition = loop.condition;

        var MAX_ITER = 20;
        var counter = 0;

        while (this.loop_condition_true(state, loop_condition) && counter < MAX_ITER) {
            if (loop.body.length === 0) throw new Error ("Empty loop body!");
            var current_statement = loop.body[0];

            console.log("LOOP " + counter);

            do {
                if (current_statement.tag === 'if') {
                    throw new Error('unimplemented');
                } else {
                    this.execute_statement(state, current_statement);
                }
                current_statement = this.get_next_statement(loop, current_statement);
                console.info(current_statement);
            } while (current_statement);

            this.execute_statement(state, loop.increment);
            counter++;
        }

        console.info("OUTPUT:");
        var result = state.vars[array_name].value.map(function(x) { return x.value; });
        console.info(result);
    }
}

/**
 * Creates an initial state for array given a problem configuration.
 * @param problem: the problem configuration.
 * @param argumentIndex: which argument set is being used (i.e.,the parameters to the problem).
 */
function array_make_initial_state(problem, argumentIndex) {
    "use strict";

    // HACK this isn't being passed in as a parameter yet
    argumentIndex = 0;

    var ast = java_parsing.parse_method(problem.content.text);
    var args = problem.content.arguments[argumentIndex];

    return {
        ast: ast,
        args: args,
        vars: {}
    };
}

