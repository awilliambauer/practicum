function ArrayHelper() {
    "use strict";

    var sim = java_simulator;

    this.copy_args = function(o) {
        var args = [];
        for (var key in o) {
            var arg = {name: key};
            if (Array.isArray(o[key])) {
                arg.type = 'array';
                arg.value = o[key].map(function(i) { return {type:'int', value:i}; });
            } else {
                arg.type = 'int';
                arg.value = o[key];
            }
            args.push(arg);
        }
        return args;
    };

    this.get_array_parameter = function(args) {
        // assumes only one array
        for (var key in args) {
            if (Array.isArray(args[key])) {
                return {
                    name: key,
                    type: 'array',
                    value: args[key].map(function (i) {
                        return {type: 'int', value: i};
                    })
                };
            }
        }
    };


    // HACK FIXME remove this asap
    this.True = function() { return true; };

    this.create_new_variable_bank = function() { return {}; };

    this.add_this_to_the_variable_bank = function(bank, variable) {
        bank[variable.name] = {type:variable.type, value:this.copy(variable.value)};
        return variable;
    };

    this.get_array_indices = function(array) {
        var indices = [];
        for (var i = 0; i < array.value.length; i++) {
            indices.push(i);
        }
        return indices;
    };

    this.get_array_length = function(array) {
        return {
            name: array.name + ".length",
            type: 'int',
            value: array.value.length
        }
    };

    this.add_other_parameters_to_the_variable_bank = function(bank, variables) {
        var ret = [];
        variables.forEach(function (v) {
            if (v.type !== "array") {
                bank[v.name] = {type: v.type, value: v.value};
                ret.push(v);
            }
        });
        return ret;
    };

    this.execute_the_loop_increment = function(variable_bank, increment_stmt) {
        var result = this.execute_statement(variable_bank, increment_stmt);
        var variable = {};
        variable.name = increment_stmt.expression.args[0].value;
        variable.value = result.value;
        return variable;
    };

    function get_next_statement(body, stmt) {
        for (var idx in body) {
            if (body[idx] === stmt) break;
        }
        idx++;
        if (idx < body.length) {
            return body[idx];
        }
        return null;
    }

    this.get_the_next_loop_body_line_to_execute = function(parent, current_statement, condition) {
        switch(parent.tag) {
            case "for":
                if (parent.body.length === 0) throw new Error ("Empty loop body!");
                if (current_statement) {
                    return get_next_statement(parent.body, current_statement);
                }
                return parent.body[0];
            case "if":
                if (condition) {
                    if (parent.then_branch.length === 0) throw new Error("Empty then branch");
                    if (current_statement) {
                        return get_next_statement(parent.then_branch, current_statement);
                    }
                    return parent.then_branch[0];
                } else {
                    if (parent.else_branch.length === 0) throw new Error("Empty else branch");
                    if (current_statement) {
                        return get_next_statement(parent.else_branch, current_statement);
                    }
                    return parent.else_branch[0];
                }
            default:
                throw new Error("parent must be a for loop or an if");
        }
    };

    this.is_there_another_line_to_execute = function(parent, stmt, condition) {
        return !!this.get_the_next_loop_body_line_to_execute(parent, stmt, condition);
    };

    this.is_if = function(stmt) {
        return stmt.tag === "if";
    };

    this.has_else = function(stmt) {
        return stmt.hasOwnProperty("else_branch") && stmt.else_branch.length > 0;
    };

    this.get_loop_end = function(loop) {
        return loop.location.end.line-1;
    };

    this.copy = function(x) {
        return JSON.parse(JSON.stringify(x));
    };

    this.create_scratch = function(x) {
        return [this.copy(x)];
    };

    this.create_variable = function(variable_bank, declaration_stmt) {
        if (declaration_stmt.expression.args[0].tag !== 'identifier') throw new Error("not a valid variable declaration!");
        var name = declaration_stmt.expression.args[0].value;
        var val = sim.evaluate_expression(variable_bank, declaration_stmt.expression.args[1]);
        return {
            name: name,
            type: val.type,
            value: val.value
        };
    };

    this.get_loop = function(ast) {
        // assume loop is the top node
        var loop = ast.body[0];
        if (!loop || loop.tag !== 'for') throw new Error("can't find the for loop!");
        return loop;
    };

    this.get_loop_init_variable = function(variable_bank, initializer) {
        if (initializer.tag !== 'declaration' || initializer.type !== 'int') throw new Error("for loop initializer isn't an int declaration!");
        return this.create_variable(variable_bank, initializer);
    };

    this.does_this_conditional_evaluate_to_true = function(variable_bank, condition_stmt) {
        var e = sim.evaluate_expression(variable_bank, condition_stmt);
        if (e.type !== 'bool') throw new Error("Condition is not of type boolean!");
        return e.value;
    };

    this.all_array_lookups_in_the_expression = function(scratch_list) {
        return java_ast.find_all(function(n) {
            return n.tag === 'index';
        }, scratch_list[0]);
    };

    this.calculate_answer = function(variable_bank) {
        for (var key in variable_bank) {
            var v = variable_bank[key];
            if (v.type === 'array') {
                return v.value.map(function(x) { return x.value; });
            }
        }
    };

    this.execute_statement = function(variable_bank, stmt) {
        return sim.execute_statement(variable_bank, stmt);
    };

    function replace_expr_with_literal(expr, val) {
        // clear out old tag-specific data
        for (var prop in expr) {
            if (prop !== 'id' && prop !== 'location') {
                delete expr[prop];
            }
        }
        // replace with literal data
        expr.tag = 'literal';
        expr.type = val.type;
        expr.value = val.value;

        return expr;
    }

    this.evaluate_this_expression = function(variable_bank, array, expr) {
        var val = sim.evaluate_expression(variable_bank, expr);
        val["array"] = array;
        return val;
    };

    this.evaluate_this_expression2 = function(variable_bank, expr) {
        var array = sim.evaluate_expression(variable_bank, expr);
        array.name = expr.value;
        return array;
    };


    this.evaluate_this_expression_and_add_to_scratch = function(variable_bank, scratch_list) {
        var value = sim.evaluate_expression(variable_bank, last(scratch_list));
        var new_line = this.copy(last(scratch_list));
        scratch_list.push(new_line);

        return replace_expr_with_literal(new_line, value);
    };

    this.do_the_array_lookup = function(scratch_list, array, index, origExpr) {
        if (array.type !== 'array') throw new Error("Cannot index into object of type " + array.type);
        var value = array.value[index.value];
        if (!value) throw new Error("invalid array index " + index.value + " of " + array.type);

        var new_line = this.copy(last(scratch_list));
        scratch_list.push(new_line);

        return replace_expr_with_literal(java_ast.find_by_id(origExpr.id, new_line), value);
    };

    this.assign_the_new_value_to_the_array_element = function(array, index, value) {
        array.value[index.value] = value;
        return {
            index: this.copy(index),
            value: this.copy(array.value),
            name: array.name
        };
    };

    this.assign_the_new_value_to_the_variable = function(variable_bank, stmt) {
        var result = this.execute_statement(variable_bank, stmt);
        var variable = {};
        variable.name = stmt.expression.args[0].value;
        variable.value = result.value;
        return variable;
    };

    this.does_this_line_update_array = function(stmt) {
        return stmt.tag === "expression" && stmt.expression.tag === "binop" &&
            stmt.expression.operator === "=" && stmt.expression.args[0].tag === "index";
    };
}

/**
 * Creates an initial state for array given a problem configuration.
 * @param problem: the problem configuration.
 * @param argumentIndex: which argument set is being used (i.e.,the parameters to the problem).
 */
function array_make_initial_state(problem, variant) {
    "use strict";

    var ast = java_parsing.parse_method(problem.content.text);
    var args = variant.arguments;

    return {
        ast: ast,
        args: args,
        vars: {}
    };
}

