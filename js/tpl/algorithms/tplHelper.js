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
    
    this.get_context = function(variable_bank, representation_of_function_call) {
        // TODO: add a new get_context function to simulator that takes the variable bank and an AST for the function call
        // goal is not to support arbitrary number of function calls. just one additional function call.

        // console.log("vb: " + variable_bank);
        // console.log(variable_bank);
        
        // one method calls a second method, parameters and local variables from initial variables fade
        // OVERALL: make the variable bank hold all information needed for a visualization
        
        var source_of_truth = {"curr": {}, "prev": {}};
        return source_of_truth;
    }

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

    this.create_new_variable_bank = function() { 
        return {}; 
    };

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
            bank[v.name] = {type: v.type, value: this.copy(v.value)};
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

    this.is_still_inside_constructor = function(stmt) {
        if (!stmt) return false;

        if (stmt.location.start.col === 2) { //HACK do not hard code indent level
            return true;
        }
        return false;
    }

    this.is_there_another_line_to_execute = function(parent, stmt, condition) {
        return !!this.get_the_next_line_in_this_block_to_execute(parent, stmt, condition);
    };

    this.is_there_an_instantiation = function(astBody){
        if(astBody[lineNum+1].tag === 'declaration'){
            if(astBody[lineNum+1].expression.tag === 'binop'){
                if(astBody[lineNum+1].expression.args[1].tag === 'call'){
                    return true;
                }
                return false;
            }
            return false;
        }
        return false;
    }

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

    this.check_instantiation = function(astBody) {
        if(astBody[lineNum].tag === 'declaration'){
            if(astBody[lineNum].expression.tag === 'binop'){
                if(astBody[lineNum].expression.args[1].tag === 'call'){
                    if(astBody[lineNum].expression.args[1].object.tag === 'identifier'){
                        return true;
                    }
                    return false;
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

    this.get_references = function(line){
        if (line.tag === "declaration") {
            let arg1 = line.expression.args[0];
            if (arg1.hasOwnProperty("object")){
                return arg1.object;
            }
            
        }
        return null;
    }

    this.initialize_loop_iterable = function(variable_bank, iterable, is_inner) {
        iterable = sim.evaluate_expression(variable_bank, iterable); // passes in variable_bank as context
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
        lineNum += 1;
        return this.add_this_to_the_variable_bank(variable_bank, {
            name: variableName,
            type: variableType,
            value: variableValue
        });
    };

    this.add_temp_variable = function(variable_bank, line) {
        let temp_name = line.expression.args[0].name;
        if (temp_name === undefined){
            temp_name = line.expression.args[0].value;
        }
        let temp_value = sim.evaluate_expression(variable_bank, line.expression.args[1]).value;
        let temp_type = "temp";
        variable_bank[temp_name] = {name: temp_name, value: temp_value, type: temp_type};
        return {name: temp_name, value: temp_value, type: temp_type};
    }

    this.get_param_values = function(instance, function_call, function_definition){
        let param_values = [];
        let call_params = this.copy(function_call.args);
        let def_params = function_definition.params.slice(1);
        if (instance.hasOwnProperty("params")){
            for(let jdx = 0; jdx < instance.params.length; jdx++){
                for (let idx = 0; idx < call_params.length; idx++){
                    if (call_params[idx].tag === "literal"){
                        param_values.push({name: def_params[idx].name, value: call_params[idx].value});
                        call_params[idx].tag = null;
                    }
                    else if (instance.params[jdx].name === call_params[idx].value){
                        param_values.push({name: def_params[idx].name, value: instance.params[jdx].value});
                        call_params[idx].value = null;
                    }
                }
            }
            for(let jdx = 0; jdx < instance.values.length; jdx++){
                let curr_value = instance.values[jdx];
                for (let idx = 0; idx < call_params.length; idx++){
                    if (call_params[idx].tag === "literal"){
                        param_values.push({name: def_params[idx].name, value: call_params[idx].value});
                        call_params[idx].tag = null;
                    }
                    else if (curr_value.name === call_params[idx].value){
                        param_values.push({name: def_params[idx].name, value: curr_value.value});
                    }
                }
            }
            return param_values;
        } else {
            for(const [key, value] of Object.entries(instance)){
                for (let idx = 0; idx < call_params.length; idx++){
                    if (call_params[idx].tag === "literal"){
                        param_values.push({name: def_params[idx].name, value: call_params[idx].value});
                        call_params[idx].tag = null;
                    }
                    else if (key === call_params[idx].value){
                        param_values.push({name: def_params[idx].name, value: value});
                        call_params[idx].value = null;
                    }
                }
            }
            return param_values; 
        }
        
    }

    this.add_temp_param_variables = function(variable_bank, param_values){
        for (let idx = 0; idx < param_values.length; idx++){
            let tag = "literal";
            if (param_values[idx].value.type === "object") {
                tag = "reference";
            }
            variable_bank[param_values[idx].name] = {
                name: param_values[idx].name, 
                tag: tag,
                temp: "temp", 
                value: param_values[idx].value
            };
        }
        return variable_bank;
    }

    this.remove_temp_vars = function(variable_bank) {
        for (const [key, value] of Object.entries(variable_bank)){
            if (value.temp === "temp" || value.type === "temp"){
                value.value = null;
                delete variable_bank[key];
            }
        }
        return variable_bank;
    }

    this.add_class_instance = function(variable_bank, astBody) {
        let variableName = astBody[lineNum]["expression"]["args"][0].value;
        let variableValues = astBody[lineNum]["expression"]["args"][1].args;
        let className = astBody[lineNum]["expression"]["args"][1]["object"].value;
        let classReference = this.get_class_from_name(className, astBody);
        if (classReference === false) throw new Error("could not find a definition for a class with this name!");
        this.convert_self_to_instance_name(classReference, variableName);
        return this.add_the_object_to_the_variable_bank(variable_bank, {
            name: variableName,
            reference: classReference,
            values: variableValues
        });
    }

    this.update_object_in_variable_bank = function(bank, object, variable) {
        if (Number.isInteger(variable)){
            let curr_var = object.values[variable];
            if (curr_var !== undefined){
                curr_var.value = sim.evaluate_expression(bank, curr_var.hidden_val).value;
            }
        }
        else {
            if (variable.hasOwnProperty("reference") && variable.reference !== null){
                let references = [variable.reference.name];
                let curr_obj = variable.reference;
                while (curr_obj.hasOwnProperty("object")){
                    references.push(curr_obj.object.value);
                    curr_obj = curr_obj.object;
                }
                
                let relevant_object = object;
                if (relevant_object.hasOwnProperty("values")){
                    for (let jdx = references.length; jdx > 0; jdx--){
                        for (let idx = 0; idx < relevant_object.values.length; idx++) {
                            if (relevant_object.values[idx].name === references[jdx-1]) {
                                relevant_object = relevant_object.values[idx]; 
                                break; 
                            }
                        }
                    }
                }
                else {
                    for (let i = 0; i < relevant_object.value.values.length; i++) {
                        if (relevant_object.value.values[i].name === variable.name) {
                            // Find a match
                            relevant_object.value.values[i].value = variable.value;
                            return object;
                        } // Need to add here to check if the reference is depth of two or one etc.
                    }
                }
            }
            for (let idx = 0; idx < object.values.length; idx++) {
                if (object.values[idx].name === variable.name) {
                    // Find a match
                    object.values[idx].value = variable.value;
                    return object;
                } // Need to add here to check if the reference is depth of two or one etc.
            }
            // No match
            object.values.push(variable);
        }
        return object;
    }

    this.add_the_object_to_the_variable_bank = function(bank, variable) {
        // Variable.reference[0] is the init function of the correct class
        // Variable.values is the array of params that instantiate the class object
        

        let class_definition = variable.reference;
        let parameters = class_definition.body[0].params.slice(1); // Ignoring first parameter (self)
        let param_list = [];
        for (let i in parameters){
            param_list.push(parameters[i].name);
        }
        let class_constructor_body = variable.reference.body[0].body;
        let variable_bank_values = this.create_bank(class_constructor_body.length);        

        for (let idx = 0; idx < class_constructor_body.length; idx++) {
            if(class_constructor_body[idx].tag === "declaration"){
                if (class_constructor_body[idx].expression.args[1].hasOwnProperty("tag") && class_constructor_body[idx].expression.args[1].tag === "literal"){
                    let declaration_identifier = class_constructor_body[idx].expression.args[0].name; //Case if setting a literal
                    if (declaration_identifier === undefined){
                        declaration_identifier = class_constructor_body[idx].expression.args[0].value;
                    }
                    let declaration_value = class_constructor_body[idx].expression.args[1];
                    variable_bank_values[idx]["name"] = declaration_identifier;
                    variable_bank_values[idx]["value"] = "";
                    variable_bank_values[idx]["hidden_val"] =  {"value": declaration_value.value, "type": declaration_value.type, "tag": "literal"};
                    variable_bank_values[idx]["type"] =  declaration_value.type;
                } else { //Case if setting a reference
                    let declaration_identifier = class_constructor_body[idx].expression.args[0].name;
                    let declaration_value = class_constructor_body[idx].expression.args[1];
                    let declaration_type = "reference";
                    if (declaration_value.tag === "identifier"){
                        for(let i = 0; i < param_list.length; i++){
                            let declaration_param_match = class_constructor_body[idx].expression.args[1]
                            if (declaration_param_match.value === param_list[i]){
                                declaration_value = variable.values[i];
                                declaration_type = declaration_value.type;
                                if (declaration_value.tag === "identifier"){
                                    declaration_type = "instance";
                                    declaration_value.value = bank[declaration_value.value];
                                }
                            }
                        }
                    }
                    variable_bank_values[idx]["name"] = declaration_identifier;
                    variable_bank_values[idx]["value"] = "";
                    if (declaration_value.hasOwnProperty("tag") && declaration_value.tag === "call") {
                        variable_bank_values[idx]["hidden_val"] = declaration_value;
                    } else {
                        variable_bank_values[idx]["hidden_val"] = {"value": declaration_value.value, "type": declaration_type, "tag": "literal"};
                    }
                    variable_bank_values[idx]["type"] =  declaration_type;
                }
            }
            
        }
        

        bank[variable.name] = {type: 'object', name: variable.name, reference: variable.reference, values: variable_bank_values, params: []};
        for (let idx = 0; idx < parameters.length; idx++) {
            bank[variable.name].params.push(sim.evaluate_expression(bank, variable.values[idx]));
            bank[variable.name].params[idx].name = param_list[idx];
        }
        return bank[variable.name];
    }

    this.get_line_result = function(bank, line) {
        let reference = this.get_references(line);
        let result = sim.evaluate_expression(bank, line);
        result.reference = reference;
        return result;
    }

    this.convert_self_to_instance_name = function(node, instance_name){
        for (const [key, value] of Object.entries(node)) {
            if (value === "self"){
                node[key] = instance_name;
            } else {
                if (this.has_children(node[key]) && key !== "location"){
                    this.convert_self_to_instance_name(node[key], instance_name);
                }      
            }
        }
    }

    this.create_bank = function(class_constructor_body_length){
        let bank = [];
        for(let i = 0; i < class_constructor_body_length; i++){
            bank.push({});
        }
        return bank
    }

    this.has_children = function(node){
        return (typeof node) === "object";
    }

    this.has_params_to_add = function(function_definition){
        return function_definition.params.length > 1;
    }

    this.get_class_name = function(astBody) {
        return astBody[lineNum]["expression"]["args"][1]["object"].value;
    }
    
    this.get_class_from_name = function(className, astBody) {
        for (const [k, currAstElement] of Object.entries(astBody)) {
            if (currAstElement.hasOwnProperty("tag")
                && currAstElement.tag === "class"
                && currAstElement.name == className) {
                    return currAstElement;
                }
            }
        return false;
    }

    this.does_this_declare_a_new_variable = function(bank, reference){
        if (reference.hasOwnProperty("object")) {
            if (reference.object.tag === "identifier"){
                return false;
            }
            else if (reference.object.tag === "reference"){
                if (reference.object.object.tag === "identifier"){
                    return false;
                }
            }
        
        }
        for(const [key, value] in Object.entries(bank)){
            if (key === reference.name){
                return false;
            }
        }
        return true;
    }

    this.get_class_constructor = function(classBody) {
        if (classBody.body[0].name === "__init__" && classBody.body[0].tag === "method"){
            return classBody.body[0];
        }
        throw new Error("Class constructor is not properly defined.");
    }

    this.get_class_constructor_body_range = function(classBody) {
        return classBody.body[0].location.end.line - classBody.body[0].location.start.line - 1;
    }

    this.get_class_method_body_range = function(method) {
        return method.location.end.line - method.location.start.line - 1;

    }

    this.get_value_for_update = function(function_line, new_value) {
        let variable = function_line.expression.args[0];
        variable.value = new_value.value;
        return variable;
    }

    this.get_function_body_line = function(function_definition, index){
        let curr_line = function_definition.body[0];
        let prev_line = function_definition.body[0];
        let if_length = 0;
        let then_index = 0;
        let in_then_branch = false;
        let go_to_else = false;
        let in_if = false;
        if (index > 0){
            for (let i = 0; i < index+1; i++){
                if (function_definition.body[i-if_length].tag === "if" && !in_if){
                    prev_line = curr_line;
                    curr_line = function_definition.body[i-if_length];
                    if_length += 1;
                    in_if = true;
                } else if (go_to_else){
                    if (prev_line.hasOwnProperty("else_branch")){
                        curr_line = prev_line.else_branch;
                        if(Array.isArray(curr_line)){ //Due to how the parser works, it adds else (of elif's) into an array. Also with else statements we never want to get the line with the else, so i+= 1
                            curr_line = curr_line[0];
                            i += 1;
                        }
                        if_length += 1;
                        go_to_else = false;
                    } else {
                        if_length -= 1;
                        curr_line = function_definition.body[i-if_length];
                        prev_line = curr_line;
                        go_to_else = false;
                    }
                } else if (in_if && !in_then_branch){
                    prev_line = curr_line;
                    curr_line = curr_line.then_branch[then_index];
                    then_index += 1;
                    if_length += 1;
                    in_then_branch = true;
                    if (then_index >= prev_line.then_branch.length-1){
                        go_to_else = true;
                        then_index = 0;
                        in_then_branch = false;
                    }
                } else if (in_if && in_then_branch){
                    curr_line = prev_line.then_branch[then_index];
                    then_index += 1;
                    if_length += 1;
                    if (then_index >= prev_line.then_branch.length-1){
                        go_to_else = true;
                        then_index = 0;
                        in_then_branch = false;
                    }
                } else {
                    prev_line = curr_line;
                    curr_line = function_definition.body[i-if_length];
                }
            }
        }
        return curr_line;
    }

    this.get_expression = function(node) {
        if (!node.hasOwnProperty("expression")) throw new Error("This node does not have an expression");
        return node.expression;

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

    this.does_this_stmt_update_bank = function(stmt) {
        return stmt.tag === "declaration" && stmt.hasOwnProperty("expression") && stmt.expression.tag === "binop";
    };
    
    this.is_this_the_last_line = function(ast) {
        return lineNum !== ast.body.length - 1;
    }; // TODO: factor out when lineNum is deprecated

    this.this_is_a_function = function(ast) {
        if (ast.tag === "method") {     
            return true;
        }
        return false;
    };

    this.line_has_a_function_call = function(line) {
        if (line.tag === "declaration") {     
            if(line.expression.tag === "call"){
                return true;
            }
            else if(line.expression.hasOwnProperty("args")){
                if(line.expression.args[1].tag === "call"){
                    return true;
                }
            }
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
        return (ast.body[this.current_code_block_index]);
    };

    this.are_we_on_print_statement = function(ast) {
        if (!this.this_is_a_print_statement(ast)) throw new Error("could not find print!");
        if (ast.body[lineNum].tag === "expression") {
            if (ast.body[lineNum].expression.hasOwnProperty("tag")) {
                if (ast.body[lineNum].expression.tag === "print") {
                    return true;
                }
            }
        }
        return false;
    };

    this.are_we_on_return_statement = function(stmt) {
        if (stmt.tag === "expression") {
            if (stmt.expression.hasOwnProperty("tag")) {
                if (stmt.expression.tag === "return") {
                    return true;
                }
            }
        }
        return false;
    };

    this.is_this_a_return_statement = function(stmt) {
        return (stmt.tag === "expression" && stmt.expression.hasOwnProperty("tag") && stmt.expression.tag === "return");
    };

    this.evaluate_class_function = function(stmt, variable_bank){
        let return_vals = sim.evaluate_expression(variable_bank, stmt);
        if (return_vals !== undefined){
            if (return_vals.type === "return"){
                return return_vals;
            } 
        }      
    }

    this.get_function = function(line){
        if (line.expression.tag === "call"){
            return line.expression;
        } else {
            return line.expression.args[1];
        }
    }
    
    this.simple_bank = function(curr_messy_bank, old_simple_bank) {
        let bank_simplified = {};
        for (const obj in curr_messy_bank) {
            let obj_values = curr_messy_bank[obj]["values"];
            
            let constructor_parameters = {};
            if (curr_messy_bank[obj].hasOwnProperty("params")) {
                let obj_params = curr_messy_bank[obj]["params"];
                for (const i in obj_params) {
                    let name = obj_params[i]["name"];
                    let value = obj_params[i]["value"];
                    constructor_parameters[name] = {value: value, local: true};
                }
            }
        
            let vars = {}
            for (const i in obj_values) {
                let value = obj_values[i]["value"];
                let name = obj_values[i]["name"];
                let local = true;
                if (obj_values[i]["type"] == "reference") {
                    name = "self." + name;
                    local = false;
                }
                vars[name] = {value: value, local: local};
            }
            bank_simplified[obj] = {};
            bank_simplified[obj]["variables"] = vars;
            bank_simplified[obj]["parameters"] = constructor_parameters;
        }
        
        let the_new_simple_bank = {"current_vb": bank_simplified, "previous_vb": old_simple_bank["current_vb"]};
        
        // Send the simple VB over to the controller
        controller.acceptSimpleVariableBank(the_new_simple_bank);
        return the_new_simple_bank;
    }

    this.get_function_from_call = function(bank, call){
        if (call.object.hasOwnProperty("tag")){
            if (call.object.tag === "identifier"){
                let class_reference = bank[call.object.value].reference;
                for (let idx = 0; idx < class_reference.body.length; idx++){
                    if (class_reference.body[idx].name === call.name){
                        console.log("FUNCTION CALL");
                        return class_reference.body[idx];
                    }
                }
            }
        }
        throw new Error("Could not find method: ", call.name);
    }

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
            if (print_args[i].tag === "call"){
                print_vals[i] = this.evaluate_class_function(print_args[i], variable_bank)
            } else {
                print_vals[i] = sim.evaluate_expression(variable_bank, print_args[i]);
            }
        }
        return this.create_print_string(print_vals, "");
    };

    this.get_line_num = function(){
        return lineNum;
    }

    this.create_print_string = function(vals, string) {
        for (let i = 0; i < vals.length; i++) {
            if (!vals[i].hasOwnProperty("tag") || vals[i]["tag"] === "identifier" || vals[i]["tag"] === "literal") {
                if (vals[i]["type"] !== "array") string += vals[i]["value"];
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
