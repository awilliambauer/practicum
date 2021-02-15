function TplHelper() {
    "use strict";

    var sim = java_simulator;
    var lineNum = 0;
    this.current_code_block_index = -1;

    this.iterable = undefined;
    this.iterable2 = undefined;

    this.copy_args = function(o) {
        var args = [];
        for (var key in o) {
            var arg = {name: key};
            if (Array.isArray(o[key])) {
                arg.type = 'array';
                arg.value = o[key].map(function(i) { return {type:'int', value:i}; });
            } else if (typeof o[key] === "string" || o[key] instanceof String) {
                arg.type = 'string';
                arg.value = [...o[key]].map(function (i) { return { type: "char", value: i };});
            } else {
              arg.type = "int";
              arg.value = o[key];
            }
            args.push(arg);
        }
        return args;
    };
    // TODO
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
            } else if (typeof args[key] === "string" || args[key] instanceof String) {
                return {
                  name: key,
                  type: "string",
                  value: [...args[key]].map(function (i) {
                    return { type: "char", value: i };
                  }),
                };
            }
            return {
            name: key,
            type: "int",
            value: args[key],
            };
        }
    };

    this.get_next_code_block = function(ast) {
        this.current_code_block_index++;
        return ast["body"][this.current_code_block_index]["location"]["start"]["line"];
    };


    // HACK FIXME remove this asap
    this.True = function() { return true; };

    this.create_new_variable_bank = function() { return {}; };

    this.add_this_to_the_variable_bank = function(bank, variable) {
        bank[variable.name] = {type:variable.type, value:this.copy(variable.value)};
        return variable;
    };

    this.add_the_loop_array_to_the_variable_bank = function(bank, variable) {
        bank[variable.name] = {type: 'array', value: this.copy(variable.value)};
        return variable;
    }

    this.add_number_to_the_variable_bank = function(bank, number) {
        bank["number"] = {type: 'int', value: number};
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
            bank[v.name] = {type: v.type, value: JSON.parse(JSON.stringify(v.value))};
            ret.push(v);
        });
        return ret;
    };

    this.execute_the_loop_increment = function(variable_bank, iter_variable, is_inner) {
        var value;
        var cur_iterable = !is_inner ? this.iterable : this.iterable2;
        // if (cur_iterable.idx >= cur_iterable.value.length - 1) {
        //     value = this.next_loop_variable_value(iter_variable, is_inner);
        //     cur_iterable.idx++;
        // } else {
        cur_iterable.idx++;
        value = this.next_loop_variable_value(iter_variable, is_inner);
        // }
        var result = this.execute_statement(variable_bank, value);
        var variable = {};
        variable.name = iter_variable.value;
        variable.value = result.value;
        return variable;
    };

    this.next_loop_variable_value = function(iter_variable, is_inner) {
        let value;
        let cur_iterable = !is_inner ? this.iterable : this.iterable2;
        if (cur_iterable.value[cur_iterable.idx].hasOwnProperty("type") && (cur_iterable.value[cur_iterable.idx].type === "char") || (cur_iterable.value[cur_iterable.idx].type === "string")) {
            value = java_parsing.parse_statement(iter_variable.value + ' = "' + (cur_iterable.value[cur_iterable.idx]).value + '"');
        } else {
            value = java_parsing.parse_statement(iter_variable.value + ' = ' + (cur_iterable.value[cur_iterable.idx]).value);
        }
        return value;
    }

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

    function get_next_instance_variable(body) {
        lineNum = lineNum + 1;
        if(lineNum < body.length) {
            return body[lineNum];
        }
        return null;
    }

    this.get_next_line = function(body) {
        //get_next_instance_variable(body)
        return body[lineNum];
    }

    this.get_first_line = function(ast) {
        return ast.body[0];
    }

    this.get_iterable_array = function(is_inner) {
        return !is_inner ? this.iterable : this.iterable2;
    }

    //TODO
    this.get_the_next_line_in_this_block_to_execute = function(parent, current_statement, condition) {
        switch(parent.tag) {
            case "method":
                if (current_statement) {
                    lineNum++;
                    return get_next_statement(parent.body, current_statement);
                }
                return parent.body[lineNum++];
            case "for":
                if (parent.body.length === 0) throw new Error ("Empty loop body!");
                if (current_statement) return get_next_statement(parent.body, current_statement);
                return parent.body[0];
            case "while":
                if (parent.body.length === 0) throw new Error ("Empty loop body!");
                if (current_statement) return get_next_statement(parent.body, current_statement);
                return parent.body[0];
            case "if":
                if (condition) {
                    if (parent.then_branch.length === 0) throw new Error("Empty then branch");
                    if (current_statement) return get_next_statement(parent.then_branch, current_statement);
                    return parent.then_branch[0];
                } else {
                    if (parent.else_branch.length === 0) throw new Error("Empty else branch");
                    if (current_statement) return get_next_statement(parent.else_branch, current_statement);
                    return parent.else_branch[0];
                }
            default:
                throw new Error("Unknown code block parent: " + parent.tag);
        }
    };

    this.is_there_another_line_to_execute = function(parent, stmt, condition) {
        return !!this.get_the_next_line_in_this_block_to_execute(parent, stmt, condition);
    };

    this.is_if = function(stmt) {
        return stmt.tag === "if";
    };

    this.is_for = function(stmt) {
        return stmt.tag === "for";
    };

    this.has_else_if = function(stmt) {
        return stmt.else_is_elif;
    };

    this.get_elif = function(stmt) {
        return stmt.else_branch;
    };

    this.has_else = function(stmt) {
        return stmt.hasOwnProperty("else_branch") && stmt.else_branch.length > 0;
    };

    //TODO
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

    this.get_loop = function(ast) { // TODO: allow getting this at lower levels
        // assume loop is the top node
        var loop = ast.body[lineNum];
        if (!loop || loop.tag !== 'for') throw new Error("can't find the for or while loop!");
        return loop;
    };

    this.get_while_loop = function(ast) {
        // assume loop is the top node
        var loop = ast.body[lineNum];
        if (!loop || loop.tag !== 'while') throw new Error("can't find the for or while loop!");
        return loop;
    };

    //TODO: find where this is called and change input
    this.get_loop_init_variable = function(variable_bank, iter_variable, iterable, is_inner) {
        this.initialize_loop_iterable(variable_bank, iterable, is_inner);
        if (iter_variable.tag !== 'identifier') throw new Error("for loop initializer isn't an int declaration!");
        return this.create_variable(variable_bank, this.next_loop_variable_value(iter_variable, is_inner));
    };

    this.is_there_another_item_in_the_loop_sequence = function(variable_bank, is_inner) {
        let cur_iterable = !is_inner ? this.iterable : this.iterable2;
        return (cur_iterable.idx < cur_iterable.value.length - 1); // TODO: can't handle sequences of len:1
    };

    this.check_if_loop = function(ast) {
        if (ast.body[this.current_code_block_index] === 'for' || ast.body[this.current_code_block_index] === 'while') {
            return true;
        }
        return false;
    };

    this.check_for_loop = function(ast) {
        if(ast.body[lineNum].tag === 'for') {
            return false;
        }
        return true;
    };

    this.check_while_loop = function(ast) {
        if(ast.body[lineNum].tag === 'while') {
            return false;
        }
        return true;
    };

    this.check_for_if = function(ast) {
        if(ast.body[lineNum].tag === 'if') {
            return false;
        }
        return true;
    };

    this.get_instance_variables = function(variable_bank, ast) {
        // assume first two statements are instance varibale declarations
        var firstInst = ast.body[0];
        var secInst = ast.body[1];
        // return this.create_variable(variable_bank, firstInst);


    };

    // this.get_loop_init_variable = function(variable_bank, initializer) {
    //     if (initializer.tag !== 'declaration' || initializer.type !== 'int') throw new Error("for loop initializer isn't an int declaration!");
    //     return this.create_variable(variable_bank, initializer);
    // };

    this.initialize_loop_iterable = function(variable_bank, iterable, is_inner) {
        iterable = sim.evaluate_expression(variable_bank, iterable);
        if ((iterable.type !== 'array') && (iterable.type !== 'string')) throw new Error("for loop iterable isn't an array or string")
        if (!is_inner) {
            this.iterable = iterable;
            this.iterable.idx = 0;
            this.iterable.name = "loop sequence"; // TODO: give these more helpful names
        } else {
            this.iterable2 = iterable;
            this.iterable2.idx = 0;
            this.iterable2.name = "inner loop sequence";
        }
    }

    //TODO: remove this
    this.get_instance_variable = function(variable_bank, ast) {
        let variableName = ast["body"][lineNum]["expression"]["args"][0].value;
        let variableValue = ast["body"][lineNum]["expression"]["args"][1].value;
        let variableType = ast["body"][lineNum]["expression"]["args"][1].type;
        lineNum = lineNum + 1;
        return this.add_this_to_the_variable_bank(variable_bank, {
            name: variableName,
            type: variableType,
            value: variableValue
        });
    };

    this.this_is_a_variable_declaration_statement = function(ast) {
        return ast["body"][this.current_code_block_index]["tag"] === "declaration";
    };

    this.is_loop_arr_type = function(loop) {
        return loop.iterable.args === undefined;
    }

    this.does_this_conditional_evaluate_to_true = function(variable_bank, condition_stmt) {
        console.log("Value at conditional: ", condition_stmt);
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

    this.loop_array_index = function(variable_bank, array, is_inner) {
        let cur_iterable = !is_inner ? this.iterable : this.iterable2;
        var val = sim.evaluate_expression(variable_bank, {tag: 'literal', type: 'int', value: cur_iterable.idx});
        val["array"] = array;
        return val;
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

    this.is_this_an_array_element_assignment = function(stmt) {
        return (stmt.tag === "declaration" && stmt.expression.args[0].hasOwnProperty("tag") &&
                stmt.expressions.args[0].tag === "index")
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
        console.log('Assigning value for: ', variable_bank, stmt);
        var result = this.execute_statement(variable_bank, stmt);
        var variable = {};
        variable.name = stmt.expression.args[0].value;
        variable.value = result.value;
        return variable;
    };

    this.does_this_line_update_array = function(stmt) {
        return stmt.tag === "declaration" && stmt.hasOwnProperty("expression") && stmt.expression.tag === "binop" &&
               stmt.expression.args[0].tag === "index";
    };

    this.is_this_the_last_line = function(ast) {
        console.log("Full ast is ", ast.body);
        console.log("Line is " + (lineNum+1) + " of " + ast.body.length);
        return lineNum !== ast.body.length - 1;
    }; // TODO: factor out

    this.increment_the_line_number = function() {
        lineNum++;
    }; // TODO: factor out

    this.this_is_a_return_statement = function(ast) {
        if (this.current_code_block_index === -1) this.current_code_block_index = ast.body.length - 1; // TODO HACK for when current_code_block_index is not being used
        if (ast.body[this.current_code_block_index].tag === "expression") {
            if (ast.body[this.current_code_block_index].expression.hasOwnProperty("tag")) {
                if (ast.body[this.current_code_block_index].expression.tag === "return") {
                    return true;
                }
            }
        }
        return false;
    };

    this.get_return_statement = function(ast) {
        if (!this.this_is_a_return_statement(ast)) throw new Error("could not find return!");
        return ast.body[this.current_code_block_index];
    };

    this.is_this_a_return_statement = function(stmt) {
        return (stmt.tag === "expression" && stmt.expression.hasOwnProperty("tag") && stmt.expression.tag === "return");
    };

    this.get_return_output = function(stmt, variable_bank) {
        var return_args = stmt.expression.args.value;

        var return_vals = [];
        for (let i = 0; i < return_args.length; i++) {
            return_vals[i] = sim.evaluate_expression(variable_bank, return_args[i]);
        }

        return this.create_print_string(return_vals, "")
        // var return_output = this.create_return_output(return_args, "");
        //
        // console.log(return_args);
        //
        // for (var variable_name in state.vars) {
        //     while (return_output.indexOf(variable_name) !== -1) {
        //         return_output = return_output.replace(variable_name, state.vars[variable_name]);
        //     }
        // }
        //
        // console.log(return_output);
    };

    this.create_print_string = function(vals, string) {
        for (let i = 0; i < vals.length; i++) {
            if (vals[i].hasOwnProperty)
            if (!vals[i].hasOwnProperty("tag") || vals[i]["tag"] === "identifier" || vals[i]["tag"] === "literal") {
                if (!(vals[i]["type"] === "array")) string += vals[i]["value"];
                else string += this.create_print_string(vals[i]["value"], string);
            } else if (vals[i].tag === "binop") {
                string += this.create_print_string(vals[i].args, string); // TODO: what does this do?
            }
            if (i + 1 < vals.length) string += ",";
        }

        return string;
    };
}

/**
 * Creates an initial state for array given a problem configuration.
 * @param problem: the problem configuration.
 * @param argumentIndex: which argument set is being used (i.e.,the parameters to the problem).
 */
function make_initial_state(problem, variant) {
    "use strict";

    var ast = java_parsing.parse_method(problem.content.text);
    var args = variant.arguments;

    return {
        ast: ast,
        args: args,
        vars: {}
    };
}

