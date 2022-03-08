const RELATIVE_SRC_DIR = "../../../include/source/"; //It might be necessary to change this depending on your folder system.
const HORIZONTAL_TAB = 9; // Unicode control code
const NEW_LINE = 10; // Unicode control code
// see: https://en.wikipedia.org/wiki/List_of_Unicode_characters#Control_codes

function TplHelper() {
    "use strict";

    var sim = python_simulator;
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

    this.get_function_parameters = function(args) {
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

    this.create_new_variable_bank = function() { return {}; };

    this.add_this_to_the_variable_bank = function(bank, variable) {
        bank[variable.name] = {type:variable.type, value:this.copy(variable.value)};
        return variable;
    };

    this.add_the_loop_sequence_to_the_variable_bank = function(bank, variable) {
        bank[variable.name] = {type: 'array', value: this.copy(variable.value)};
        return variable;
    }

    this.add_number_to_the_variable_bank = function(bank, number) {
        bank["number"] = {type: 'int', value: number};
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
        cur_iterable.idx++;
        value = this.next_loop_variable_value(iter_variable, is_inner);
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
            value = python_parsing.parse_statement(iter_variable.value + ' = "' + (cur_iterable.value[cur_iterable.idx]).value + '"');
        } else {
            value = python_parsing.parse_statement(iter_variable.value + ' = ' + (cur_iterable.value[cur_iterable.idx]).value);
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

    this.get_next_line = function(body) {
        return body[lineNum];
    }

    this.get_iterable_sequence = function(variable_bank, iterable, is_inner) {
        this.initialize_loop_iterable(variable_bank, iterable, is_inner);
        return !is_inner ? this.iterable : this.iterable2;
    }

    this.get_the_next_line_in_this_block_to_execute = function(parent, current_statement, condition) {
        switch(parent.tag) {
            case "method":
                if (current_statement) {
                    lineNum++;
                    return get_next_statement(parent.body, current_statement);
                }
                return parent.body[lineNum++];
            case "block":
                if (current_statement) {
                    lineNum++;
                    return get_next_statement(parent.body, current_statement);
                }
                return parent.body[lineNum++];
            case "for":
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

    this.is_break = function(stmt) {
        return stmt.tag === "break";
    };

    this.is_continue = function(stmt) {
        return stmt.tag === "continue";
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

    this.copy = function(x) {
        return JSON.parse(JSON.stringify(x));
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

    this.get_loop_init_variable = function(variable_bank, iter_variable, iterable, is_inner) {
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

    this.go_next_line_without_reading = function() {
        lineNum++;
    }

    this.check_instantiation = function(ast) {
        if(ast.body[lineNum].tag === 'declaration'){
            if(ast.body[lineNum].expression.tag === 'binop'){
                if(ast.body[lineNum].expression.args[1].tag === 'call'){
                    return true;
                }
                return false;
            }
            return false;
        }
        return false;
    }

    this.get_object_reference = function(ast) {
        return ast.body[lineNum].expression.args[1].object.value;
    }

    this.initialize_loop_iterable = function(variable_bank, iterable, is_inner) {
        iterable = sim.evaluate_expression(variable_bank, iterable);
        if ((iterable.type !== 'array') && (iterable.type !== 'string')) throw new Error("for loop iterable isn't an array or string")
        if (iterable.type === 'string' && !iterable.value[0].hasOwnProperty('type')) {
            iterable = JSON.parse(JSON.stringify((iterable))); // deep copy
            iterable.value = [...iterable.value].map(function (i) { return { type: "char", value: i };});
        }
        if (!is_inner) {
            this.iterable = iterable;
            this.iterable.idx = 0;
            this.iterable.name = "loop sequence"; // TODO: rework naming convention for arbitrary number of loops?
        } else {
            this.iterable2 = iterable;
            this.iterable2.idx = 0;
            this.iterable2.name = "inner loop sequence";
        }
    }

    this.add_local_variable = function(variable_bank, ast) {
        let variableName = ast["body"][lineNum]["expression"]["args"][0].value;
        let variableValue = ast["body"][lineNum]["expression"]["args"][1].value;
        let variableType = ast["body"][lineNum]["expression"]["args"][1].type;
        lineNum = lineNum + 1;
        console.log(variableName, variableValue, variableType);
        return this.add_this_to_the_variable_bank(variable_bank, {
            name: variableName,
            type: variableType,
            value: variableValue
        });
    };

    this.add_class_instance = function(variable_bank, ast) {
        let variableName = ast["body"][lineNum]["expression"]["args"][0].value;
        let variableValues = ast["body"][lineNum]["expression"]["args"][1].args;
        let classReference = this.get_class_from_name(ast["body"][lineNum]["expression"]["args"][1]["object"].value, ast)
        if (classReference === false) throw new Error("could not find a definition for a class with this name!");
        return this.add_the_object_to_the_variable_bank(variable_bank, {
            name: variableName,
            reference: classReference,
            values: variableValues
        });
    }

    this.add_the_object_to_the_variable_bank = function(bank, variable) {
        //Variable.reference is the params of the init function of the correct class
        //Variable.values is the array of params that instantiate the class object
        bank[variable.name] = {type: 'object', reference: this.copy(variable.reference), values: this.copy(variable.values)};
        return variable
    }
    
    this.get_class_from_name = function(className, ast) {
        let currAstElement;
        for (let idx = 0; idx < ast["body"].length; idx++){
            currAstElement = ast["body"][idx];
            if (currAstElement.hasOwnProperty("tag") && currAstElement.tag === "class") {
                if (currAstElement.name == className) {
                    return currAstElement;
                }
            }
        }
        return false;
    }

    this.is_loop_called_without_range = function(loop) {
        return loop.iterable.args === undefined;
    }

    this.does_this_conditional_evaluate_to_true = function(variable_bank, condition_stmt) {
        var e = sim.evaluate_expression(variable_bank, condition_stmt);
        if (e.type !== 'bool') throw new Error("Condition is not of type boolean!");
        return e.value;
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

    this.select_the_index = function(variable_bank, list, expr) {
        var val = sim.evaluate_expression(variable_bank, expr);
        val["array"] = list;
        return val;
    };

    this.select_the_list = function(variable_bank, expr) {
        var list = sim.evaluate_expression(variable_bank, expr);
        list.name = expr.value;
        return list;
    };

    this.loop_sequence_index = function(variable_bank, sequence, is_inner, first) {
        let cur_iterable = !is_inner ? this.iterable : this.iterable2;
        var val;
        if(first) {
            val = sim.evaluate_expression(variable_bank, {tag: 'literal', type: 'int', value: cur_iterable.idx});
        }
        else {
            val = sim.evaluate_expression(variable_bank, {tag: 'literal', type: 'int', value: cur_iterable.idx + 1});
        }
        val["array"] = sequence;
        return val;
    };

    this.assign_the_new_value_to_the_list_element = function(list, index, value) {
        list.value[index.value] = value;
        return {
            index: this.copy(index),
            value: this.copy(list.value),
            name: list.name
        };
    };

    this.assign_the_new_value_to_the_variable = function(variable_bank, stmt) {
        var result = this.execute_statement(variable_bank, stmt);
        var variable = {};
        variable.name = stmt.expression.args[0].value;
        variable.value = result.value;
        return variable;
    };

    this.does_this_line_update_list = function(stmt) {
        return stmt.tag === "declaration" && stmt.hasOwnProperty("expression") && stmt.expression.tag === "binop" &&
               stmt.expression.args[0].tag === "index";
    };

    this.is_this_the_last_line = function(ast) {
        return lineNum !== ast.body.length - 1;
    }; // TODO: factor out when lineNum is deprecated

    this.this_is_a_function = function(ast) {
        // console.log(JSON.stringify(ast, null, 2));
        if (ast.tag === "method") {     
            return true;
        }
        return false;
    };

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

    this.this_is_a_print_statement = function(ast) {
        if (this.current_code_block_index === -1) this.current_code_block_index = ast.body.length - 1; // TODO HACK for when current_code_block_index is not being used
        if (ast.body[this.current_code_block_index].tag === "expression") {
            if (ast.body[this.current_code_block_index].expression.hasOwnProperty("tag")) {
                if (ast.body[this.current_code_block_index].expression.tag === "print") {
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

    this.get_print_statement = function(ast) {
        if (!this.this_is_a_print_statement(ast)) throw new Error("could not find print!");
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
        return this.create_print_string(return_vals, "");
    };

    this.get_print_output = function(stmt, variable_bank) {
        var print_args = stmt.expression.args.value;
        var print_vals = [];
        for (let i = 0; i < print_args.length; i++) {
            print_vals[i] = sim.evaluate_expression(variable_bank, print_args[i]);
        }
        return this.create_print_string(print_vals, "");
    };

    this.create_print_string = function(vals, string) {
        for (let i = 0; i < vals.length; i++) {
            if (!vals[i].hasOwnProperty("tag") || vals[i]["tag"] === "identifier" || vals[i]["tag"] === "literal") {
                if (!(vals[i]["type"] === "array")) string += vals[i]["value"];
                else string += this.create_print_string(vals[i]["value"], string);
            } else if (vals[i].tag === "binop") {
                string += this.create_print_string(vals[i].args, string);
            }
            if (i + 1 < vals.length) string += ",";
        }
        return string;
    };
}

function load_file(filePath) {
    var result = null;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", filePath, false);
    xmlhttp.send();
    if (xmlhttp.status==200) {
        result = xmlhttp.responseText;
    }
    return result;
}


/**
 * Creates an initial state for a problem configuration.
 * @param problem: the problem configuration.
 * @param argumentIndex: which argument set is being used (i.e.,the parameters to the problem).
 */
function make_initial_state(problem, variant) {
    "use strict";

    var ast;

    if (problem.content.hasOwnProperty('src')) {
        console.log("Pulling problem " + problem.title + " from a src file.");
        let filename = RELATIVE_SRC_DIR + problem.content.src;
        let problem_raw = load_file(filename);

        if (variant.arguments) {
            // Inject python for initial values at start of raw code
            let initialv_raw = "";
            for (const [key, value] of Object.entries(variant.arguments)) {
                let v = value;
                if(Object.prototype.toString.call(value) === '[object Array]') {
                    v = "[" + value + "]";
                }
                let this_value = key + " = " + v + "\n";
                initialv_raw = initialv_raw + this_value;
            }
            problem_raw = initialv_raw + problem_raw;
            // console.log(problem_raw);
        }
        ast = python_parsing.parse_program(problem_raw);
    } else { // if problem.content lacks a src, fallback to using problem.content.text
        console.log("Pulling problem " + problem.title + " directly from json.");
        ast = python_parsing.parse_program(problem.content.text);
    }

    var args = variant.arguments;

    return {
        ast: ast,
        args: args,
        vars: {}
    };
}
