function TPLAlgorithm() {
    // types:
    // AstNode: a java ast node
    // Line: a java ast node, but we want to highlight the line rather than the node
    // VariableBank: the bank of all local variables
    // Variable: a value that will be added to the variable bank, of form {name:string, type:string, value:*}.

    let ast;
    [no_step]
    ast = state.ast;

    let variables: VariableBank;
    [no_step]
    variables = helper.create_new_variable_bank();

    let lineNum;
    [no_step]
    lineNum = 0;

    [no_step]
    let current_python_function; // keep track of the most recently called function. this is necessary for viz in controller.js
    [no_step]
    current_python_function = null;

    [prompt]
    "Welcome to classes/objects practice.";

    let this_is_the_next_line_that_will_execute: Line;
    [no_step]
    this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);

    [no_step]
    while(helper.check_instantiation(ast.body) == false){
        [no_step]
        helper.go_next_line_without_reading();
    }

    [interactive("next_line")]
    this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);

    [prompt]
    "We start here because every line before this is part of a class definition.";

    [no_step]
    do {
        [no_step]
        lineNum = helper.get_line_num();

        [no_step]
        if (helper.check_instantiation(ast.body)){
            [prompt]
            "This line of code instantiates an object.";

            let Let_us_look_at_the_class_definition: AstNode;
            [no_step]
            Let_us_look_at_the_class_definition = this_is_the_next_line_that_will_execute.expression.args[1].object;

            let we_will_add_this_object_to_the_variable_bank: Instance;

            we_will_add_this_object_to_the_variable_bank = helper.add_class_instance(variables, ast.body);

            let theClass;
            [no_step]
            theClass = helper.get_class_from_name(Let_us_look_at_the_class_definition.value, ast.body);

            let theConstructor;
            [no_step]
            theConstructor = helper.get_class_constructor(theClass);

            let constructorIndex;
            [no_step]
            constructorIndex = 0;

            [prompt]
            "In the constructor, we will match the parameter inputs with the constructer parameter variables.";

            [no_step]
            do {
                [interactive("next_line")]
                this_is_the_next_line_that_will_execute = theConstructor.body[constructorIndex];
                [no_step]
                current_python_function = "init";

                [prompt]
                "This line assigns a value.";

                let newVariable: Variable;
                [no_step]
                newVariable = null;

                [no_step]
                if (helper.line_has_a_function_call(this_is_the_next_line_that_will_execute)){
                    [prompt]
                    "This line has a function call.";

                    let functionLine;
                    [no_step]
                    functionLine = helper.copy(this_is_the_next_line_that_will_execute);

                    let functionCall;
                    [no_step]
                    functionCall = helper.get_function(this_is_the_next_line_that_will_execute);
                    [no_step]
                    current_python_function = functionCall.object.name;

                    let functionDefinition;
                    [no_step]
                    functionDefinition = helper.get_function_from_call(variables, functionCall.object);

                    let classReference;
                    [no_step]
                    classReference = functionDefinition.params[0].name;

                    let bodyIndex;
                    [no_step]
                    bodyIndex = 0;

                    let result: Variable;
                    [no_step]
                    result = null;

                    let condition_outcome;
                    [no_step]
                    condition_outcome = null;

                    let parent;
                    [no_step]
                    parent = ast;

                    // Jump into function

                    [interactive("next_line")]
                    this_is_the_next_line_that_will_execute = helper.get_function_body_line(functionDefinition, bodyIndex);
                    // use this to go to the def line instead
                    //this_is_the_next_line_that_will_execute = functionDefinition;

                    [no_step]
                    if (helper.has_params_to_add(functionDefinition)){
                        let param_values;
                        [no_step]
                        param_values = helper.get_param_values(we_will_add_this_object_to_the_variable_bank, functionCall, functionDefinition);
                        [no_step]
                        variables = helper.add_temp_param_variables(variables, param_values);
                    }
                    [no_step]
                    do {
                        [interactive("next_line")]
                        this_is_the_next_line_that_will_execute = helper.get_function_body_line(functionDefinition, bodyIndex);
                        [no_step] if (helper.does_this_stmt_update_bank(this_is_the_next_line_that_will_execute)){
                            let arg1;
                            let arg2;
                            [no_step]
                            arg1 = this_is_the_next_line_that_will_execute.expression.args[0];
                            [no_step]
                            arg2 = this_is_the_next_line_that_will_execute.expression.args[1];
                            [no_step]
                            if (helper.does_this_declare_a_new_variable(variables, arg1)){
                                [prompt]
                                "Here we set a value for the variable";
                                let temp: Variable;
                                [no_step]
                                temp = helper.add_temp_variable(variables, this_is_the_next_line_that_will_execute);
                            } else {
                                [prompt]
                                "We will assign a new value for the variable 1";
                                let result;
                                [no_step]
                                result = helper.get_line_result(variables, this_is_the_next_line_that_will_execute);
                                [no_step]
                                variables[classReference] = helper.update_object_in_variable_bank(variables, variables[classReference], result);
                            }
                        } else [no_step] if (helper.are_we_on_return_statement(this_is_the_next_line_that_will_execute)){
                            [no_step]
                            result = helper.get_line_result(variables, this_is_the_next_line_that_will_execute);
                            break;
                        } else [no_step] if (helper.is_if(this_is_the_next_line_that_will_execute)) {
                            [prompt]
                            "This is an if statement which means we need to determine whether the conditional part of the if statement is true or false.";
                            let this_is_the_conditional_of_the_if_statement: AstNode;
                            [no_step]
                            this_is_the_conditional_of_the_if_statement = this_is_the_next_line_that_will_execute.condition;

                            [interactive("conditional")]
                            if (helper.does_this_conditional_evaluate_to_true(variables, this_is_the_conditional_of_the_if_statement)) {
                                [prompt]
                                "Since it’s true we move on to the lines inside of this code block.";

                                [no_step]
                                parent = this_is_the_next_line_that_will_execute;

                                [no_step]
                                condition_outcome = true;
                            } else {
                                [prompt]
                                "Since it’s false we will be ignoring all of the lines in this code block.";

                                [no_step]
                                bodyIndex = bodyIndex + 2;

                                [no_step]
                                if (helper.has_else_if(this_is_the_next_line_that_will_execute)) {
                                    [prompt]
                                    "Since the if statement was false we now evaluate this elif case.";
                                    [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_elif(this_is_the_next_line_that_will_execute);
                                    [prompt]
                                    "Just like with if statements we need to decide whether the conditional part of the elif statement is true or false.";
                                    let this_is_the_conditional_of_an_elif_statement: AstNode;
                                    [no_step]
                                    this_is_the_conditional_of_an_elif_statement = this_is_the_next_line_that_will_execute.condition;

                                    [interactive("conditional")]
                                    if (helper.does_this_conditional_evaluate_to_true(variables, this_is_the_conditional_of_an_elif_statement)) {
                                        [prompt]
                                        "Since it’s true we move on to the lines inside of this code block.";
                                        [no_step]
                                        parent = this_is_the_next_line_that_will_execute;
                                        [no_step]
                                        condition_outcome = true;
                                    } else {
                                        [no_step]
                                        bodyIndex = bodyIndex + 2;

                                        [prompt]
                                        "Since it’s false we will be ignoring all of the lines in this code block.";

                                        [no_step]
                                        if (helper.has_else(this_is_the_next_line_that_will_execute)) {
                                            [prompt]
                                            "Since all previous if and elif statements were false we automatically move into the else case.";
                                            [no_step]
                                            parent = this_is_the_next_line_that_will_execute;
                                            [no_step]
                                            condition_outcome = false;
                                        } else {
                                            break;
                                        }
                                    }
                                } else {
                                    [no_step]
                                    if (helper.has_else(this_is_the_next_line_that_will_execute)) {
                                        [prompt]
                                        "Since all previous if and elif statements were false we automatically move into the else case.";
                                        [no_step]
                                        parent = this_is_the_next_line_that_will_execute;
                                        [no_step]
                                        condition_outcome = false;
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                        [no_step]
                        bodyIndex = bodyIndex + 1;
                    } while (bodyIndex < helper.get_class_method_body_range(functionDefinition));

                    [no_step]
                    if (helper.does_this_stmt_update_bank(functionLine)){
                        [no_step]
                        this_is_the_next_line_that_will_execute = functionLine;
                        let arg1;
                        let arg2;
                        [no_step]
                        arg1 = this_is_the_next_line_that_will_execute.expression.args[0];
                        [no_step]
                        arg2 = this_is_the_next_line_that_will_execute.expression.args[1];
                        [no_step]
                        current_python_function = "init";
                        [no_step]
                        if (helper.does_this_declare_a_new_variable(variables, arg1)){
                            [prompt]
                            "We will add the new variable and its value to the variable bank";
                            [no_step]
                            variables[arg1.value] = result;
                        } else {
                            [prompt]
                            "The value returned by the function is assigned to the variable.";
                            let toChange;
                            [no_step]
                            toChange = helper.get_value_for_update(functionLine, result);

                            [interactive("add_variable_object")]
                            we_will_add_this_object_to_the_variable_bank = helper.update_object_in_variable_bank(variables, we_will_add_this_object_to_the_variable_bank, toChange);
                        }
                    }
                    [no_step]
                    variables = helper.remove_temp_vars(variables);
                } else {
                    // not a function call


                    //Check to see if the value we are setting is an instance
                    [no_step]
                    if (helper.are_we_setting_an_instance(we_will_add_this_object_to_the_variable_bank, constructorIndex)){
                        [interactive("add_instance")]
                        we_will_add_this_object_to_the_variable_bank = helper.update_object_in_variable_bank(variables, we_will_add_this_object_to_the_variable_bank, constructorIndex);
                    } else {
                        // Check user input on this variable's value
                        [interactive("add_variable_object")]
                        we_will_add_this_object_to_the_variable_bank = helper.update_object_in_variable_bank(variables, we_will_add_this_object_to_the_variable_bank, constructorIndex);
                    }
                    
                    
                }
                [no_step]
                constructorIndex = constructorIndex + 1;
            } while (constructorIndex < helper.get_class_constructor_body_range(theClass));

            [no_step]
            helper.go_next_line_without_reading();
            [no_step]
            current_python_function = null;

            [interactive("next_line")]
            this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);
        }

        else [no_step] if (helper.line_has_a_function_call(this_is_the_next_line_that_will_execute)){
            [prompt]
            "This line has a function call.";

            let functionLine;
            [no_step]
            functionLine = this_is_the_next_line_that_will_execute;

            let functionCall;
            [no_step]
            functionCall = helper.get_function(this_is_the_next_line_that_will_execute);
            [no_step]
            current_python_function = functionCall.object.name;

            let functionDefinition;
            [no_step]
            functionDefinition = helper.get_function_from_call(variables, functionCall.object);

            let classReference;
            [no_step]
            classReference = functionDefinition.params[0].name;

            let bodyIndex;
            [no_step]
            bodyIndex = 0;

            let result: Variable;
            [no_step]
            result = null;

            [no_step]
            this_is_the_next_line_that_will_execute = functionDefinition;

            [no_step]
            if (helper.has_params_to_add(functionDefinition)){
                let param_values;
                [no_step]
                param_values = helper.get_param_values(variables, functionCall, functionDefinition);
                [no_step]
                variables = helper.add_temp_param_variables(variables, param_values);
            }

            [prompt]
            "This is the function definition.";

            [no_step]
            do {
                [interactive("next_line")]
                this_is_the_next_line_that_will_execute = helper.get_function_body_line(functionDefinition, bodyIndex);

                [no_step] if (helper.does_this_stmt_update_bank(this_is_the_next_line_that_will_execute)){
                    let arg1;
                    let arg2;
                    [no_step]
                    arg1 = this_is_the_next_line_that_will_execute.expression.args[0];
                    [no_step]
                    arg2 = this_is_the_next_line_that_will_execute.expression.args[1];
                    [no_step]
                    if (helper.does_this_declare_a_new_variable(variables, arg1)){
                        [prompt]
                        "Here we set a value for the variable";
                        let temp: Variable;
                        [no_step]
                        temp = helper.add_temp_variable(variables, this_is_the_next_line_that_will_execute);
                    } else {
                        [prompt]
                        "We will assign a new value for the variable.";
                        let result;
                        [no_step]
                        result = helper.get_line_result(variables, this_is_the_next_line_that_will_execute);
                        [no_step]
                        variables[classReference] = helper.update_object_in_variable_bank(variables, variables[classReference], result);
                    }
                } else [no_step] if (helper.are_we_on_return_statement(this_is_the_next_line_that_will_execute)){
                    [no_step]
                    result = helper.get_line_result(variables, this_is_the_next_line_that_will_execute);
                    break;
                } else [no_step] if (helper.is_if(this_is_the_next_line_that_will_execute)) {
                    [prompt]
                    "This is an if statement which means we need to determine whether the conditional part of the if statement is true or false.";
                    let this_is_the_conditional_of_the_if_statement: AstNode;
                    [no_step]
                    this_is_the_conditional_of_the_if_statement = this_is_the_next_line_that_will_execute.condition;

                    [interactive("conditional")]
                    if (helper.does_this_conditional_evaluate_to_true(variables, this_is_the_conditional_of_the_if_statement)) {
                        [prompt]
                        "Since it’s true we move on to the lines inside of this code block.";
                    } else {
                        [prompt]
                        "Since it’s false we will be ignoring all of the lines in this code block.";

                        [no_step]
                        bodyIndex = bodyIndex + 2;

                        [no_step]
                        if (helper.has_else_if(this_is_the_next_line_that_will_execute)) {
                            [prompt]
                            "Since the if statement was false we now evaluate this elif case.";
                            [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_elif(this_is_the_next_line_that_will_execute);
                            [prompt]
                            "Just like with if statements we need to decide whether the conditional part of the elif statement is true or false.";
                            let this_is_the_conditional_of_an_elif_statement: AstNode;
                            [no_step]
                            this_is_the_conditional_of_an_elif_statement = this_is_the_next_line_that_will_execute.condition;

                            [interactive("conditional")]
                            if (helper.does_this_conditional_evaluate_to_true(variables, this_is_the_conditional_of_an_elif_statement)) {
                                [prompt]
                                "Since it’s true we move on to the lines inside of this code block.";
                            } else {
                                [no_step]
                                bodyIndex = bodyIndex + 2;

                                [prompt]
                                "Since it’s false we will be ignoring all of the lines in this code block.";

                                [no_step]
                                if (helper.has_else(this_is_the_next_line_that_will_execute)) {
                                    [prompt]
                                    "Since all previous if and elif statements were false we automatically move into the else case.";
                                }
                                else {
                                    bodyIndex = bodyIndex - 1;
                                }
                            }
                        } else {
                            [no_step]
                            if (helper.has_else(this_is_the_next_line_that_will_execute)) {
                                [prompt]
                                "Since all previous if and elif statements were false we automatically move into the else case.";
                            } else {
                                [no_step]
                                bodyIndex = bodyIndex - 1;
                            }
                        }
                    }
                }
                [no_step]
                bodyIndex = bodyIndex + 1;
            } while (bodyIndex < helper.get_class_method_body_range(functionDefinition));


            [no_step]
            if (helper.does_this_stmt_update_bank(functionLine)){

                [prompt]
                "This function was called from a variable assignment. We need to return to that line to resume execution.";
                [no_step]
                current_python_function = null;
                [interactive("next_line")]
                this_is_the_next_line_that_will_execute = functionLine;
                let arg1;
                let arg2;
                [no_step]
                arg1 = this_is_the_next_line_that_will_execute.expression.args[0];
                [no_step]
                arg2 = this_is_the_next_line_that_will_execute.expression.args[1];

                [no_step]
                if (helper.does_this_declare_a_new_variable(variables, arg1)){
                    [no_step]
                    result.name = arg1.value;
                    [no_step]
                    result["value"] = result.value;

                    [no_step]
                    variables[arg1.value] = result;

                    let we_will_add_the_new_variable_and_its_value_to_the_variable_bank;

                    [no_step]
                    we_will_add_the_new_variable_and_its_value_to_the_variable_bank = variables;
                    [interactive("add_variable_from_function")]
                    we_will_add_the_new_variable_and_its_value_to_the_variable_bank[arg1.value] = result;
                } else {
                    [prompt]
                    "We will assign the value returned by the function to the variable.";
                    let toChange;
                    [no_step]
                    toChange = helper.get_value_for_update(functionLine, result.value);

                    [interactive("add_variable_object")]
                    we_will_add_this_object_to_the_variable_bank = helper.update_object_in_variable_bank(variables, we_will_add_this_object_to_the_variable_bank, toChange);
                }
            }
            [no_step]
            current_python_function = null;

            [no_step]
            variables = helper.remove_temp_vars(variables);
            [no_step]
            helper.go_next_line_without_reading();

            [interactive("next_line")]
            this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);
        }

        else {
            [prompt]
            "Another situation? We need to add another case.";
            [no_step]
            helper.go_next_line_without_reading();
            this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);
        }
    } while(helper.are_we_on_print_statement(ast) == false);

    [no_step]
    current_python_function = null;
    [no_step]
    if (helper.this_is_a_print_statement(ast)) {
        let the_print_function_prints_out_the_values_passed_to_it;
        [no_step]
        the_print_function_prints_out_the_values_passed_to_it = helper.get_print_output(this_is_the_next_line_that_will_execute, variables);
        [prompt]
        "The print statement below prints out the value(s) within the parenthesis. Enter that solution in the solution box!";
    }
}

//Wanted layout for TPL at this moment:
//Skip class definitions until we get to first line which does not define a class.
//Do {iterate through code} while no print statements (There should only ever be one print statement.)
//  If class instantiation, do {add to variable bank} while things in the class to instantiate,
//  then go back to line previously at (class instantiation line) and read next line (lineOutsideClass is used for this).
//  Else if use a function, simulate the act of the function and change variable bank accordingly
//  do {iterate through function} while function body has line
//
//  Else do whatever that line does.
//  Once print is encountered, exit do while,
//find the print output and then ask for solution.
