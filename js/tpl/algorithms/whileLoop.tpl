function TPLAlgorithm() {
    // types:
    // AstNode: a java ast node
    // Line: a java ast node, but we want to highlight the line rather than the node
    // VariableBank: the bank of all local variables
    // Variable: a value that will be added to the variable bank, of form {name:string, type:string, value:*}.

    let ast;
    [no_step]
    ast = state.ast;

    [no_step]
    state.vars = helper.copy_args(state.args);

    let variables: VariableBank;
    [no_step]
    variables = helper.create_new_variable_bank();

    [prompt]
    "Welcome to while loop practice.";

    [no_step]
    {
        [prompt]
        "First, look at the function call.";

        let these_are_the_function_parameters: Parameter;
        these_are_the_function_parameters = helper.get_function_parameters(state.args);

        [no_step]
        if (state.vars.length > 0) {
            let add_the_parameters_to_the_variable_bank: Variable;
            [interactive("add_variable")]
            add_the_parameters_to_the_variable_bank = helper.add_other_parameters_to_the_variable_bank(variables, state.vars);
        }

        [prompt]
        "Now let’s walk through the code line-by-line while keeping track of variables.";
    }

    [no_step]
    while(helper.check_while_loop(ast)) {

        let this_is_the_next_line_that_will_execute: Line;
        [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);

        [no_step]
        let it_defines_a_new_local_variable_which_we_will_add_to_the_variable_bank: Variable;
        [interactive("add_variable")]
        it_defines_a_new_local_variable_which_we_will_add_to_the_variable_bank = helper.add_local_variable(variables, ast);
    }

    let this_is_the_next_line_that_will_execute: Line;
    [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_while_loop(ast);

    let loop;
    [no_step]
    loop = helper.get_while_loop(ast);
    [prompt]
    "We're at the beginning of a new while-loop block. Look at the loop header.";

    [no_step]
    let lets_visualize_our_sequence_with_an_array: Variable;

    let end_loop: Boolean;
    [no_step]
    end_loop = false;

    [no_step]
    {
        let this_is_the_loop_initialization: AstNode;
        let this_is_the_conditional_of_a_while_statement: AstNode;
        this_is_the_conditional_of_a_while_statement = loop.condition;

        [prompt]
        "A while loop will execute until the while loop condition is false.";

        [interactive("conditional")]
        while (helper.does_this_conditional_evaluate_to_true(variables, this_is_the_conditional_of_a_while_statement)) {
            [no_step]
            this_is_the_next_line_that_will_execute = null;
            let condition_outcome;
            [no_step]
            condition_outcome = null;
            let parent;
            [no_step]
            parent = loop;

            [no_step]
            do {
                [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_the_next_line_in_this_block_to_execute(parent, this_is_the_next_line_that_will_execute, condition_outcome);

                [no_step] if (helper.is_this_a_return_statement(this_is_the_next_line_that_will_execute)) {
                    let the_return_value_of_the_function_is_determined_here;
                    the_return_value_of_the_function_is_determined_here = helper.get_return_output(this_is_the_next_line_that_will_execute, variables);
                    [prompt]
                    "The print statement below prints out the value(s) that the function returned. Enter that solution in the solution box!";
                    return;
                }

                [no_step] if (helper.is_break(this_is_the_next_line_that_will_execute)) {
                    [prompt]
                    "We have encountered a break statement, so we exit the current loop entirely, skipping the rest of this iteration and all future iterations.";
                    break;
                }

                [no_step] if (helper.is_continue(this_is_the_next_line_that_will_execute)) {
                    [prompt]
                    "We have encountered a continue statement, so we skip the rest of this iteration and proceed to the next.";
                    break;
                }

                [no_step]
                if (helper.is_if(this_is_the_next_line_that_will_execute)) {
                    let this_is_the_conditional_of_the_if_statement: AstNode;
                    this_is_the_conditional_of_the_if_statement = this_is_the_next_line_that_will_execute.condition;

                    [interactive("conditional")]
                    if (helper.does_this_conditional_evaluate_to_true(variables, this_is_the_conditional_of_the_if_statement)) {
                        [prompt]
                        "Since it’s true we move on to the lines inside the if statement.";
                        [no_step]
                        parent = this_is_the_next_line_that_will_execute;
                        [no_step]
                        this_is_the_next_line_that_will_execute = null;
                        [no_step]
                        condition_outcome = true;
                    } else {
                        [prompt]
                        "Since it’s not true we will be ignoring all of the lines in the if statement.";
                        [no_step]
                        if (helper.has_else(this_is_the_next_line_that_will_execute)) {
                            [no_step]
                            parent = this_is_the_next_line_that_will_execute;
                            [no_step]
                            this_is_the_next_line_that_will_execute = null;
                            [no_step]
                            condition_outcome = false;
                        }
                    }
                } else {
                    [no_step]
                    if (helper.does_this_line_update_list(this_is_the_next_line_that_will_execute)) {
                        [prompt]
                        "This line updates the value of an element in the list.";

                        let the_expression_result_is_assigned_to_this_array_element: AstNode;
                        [no_step]
                        the_expression_result_is_assigned_to_this_array_element = this_is_the_next_line_that_will_execute.expression.args[0];

                        let this_is_the_array;
                        [no_step]
                        this_is_the_array = helper.select_the_list(variables, the_expression_result_is_assigned_to_this_array_element.object);

                        let this_is_the_index;
                        [no_step]
                        this_is_the_index = the_expression_result_is_assigned_to_this_array_element.index;

                        let this_is_the_array_element_that_is_being_updated: ArrayElement;
                        [interactive("list_element_click")]
                        this_is_the_array_element_that_is_being_updated = helper.select_the_index(variables, this_is_the_array, this_is_the_index);

                        let update_the_array_element: Variable;
                        [interactive("update_variable")]
                        update_the_array_element = helper.assign_the_new_value_to_the_list_element(this_is_the_array, this_is_the_array_element_that_is_being_updated, helper.select_the_list(variables, this_is_the_next_line_that_will_execute.expression.args[1]));
                    } else {
                        [prompt]
                        "This line updates the value of a variable.";
                        let update_the_variable_in_the_variable_bank: Variable;
                        [interactive("update_variable")]
                        update_the_variable_in_the_variable_bank = helper.assign_the_new_value_to_the_variable(variables, this_is_the_next_line_that_will_execute);
                    }
                }

                [no_step]
                if ((parent.id != loop.id) && (helper.is_there_another_line_to_execute(parent, this_is_the_next_line_that_will_execute, condition_outcome) == false)) {
                    [no_step]
                    this_is_the_next_line_that_will_execute = parent;
                    [no_step]
                    parent = loop;
                }
            } while (helper.is_there_another_line_to_execute(parent, this_is_the_next_line_that_will_execute, condition_outcome));

            [no_step] if (helper.is_break(this_is_the_next_line_that_will_execute)) {
                [no_step]
                this_is_the_next_line_that_will_execute = helper.get_while_loop(ast);
                break;
            }

            [no_step]
            end_loop = true;

            [prompt]
            "We have reached the end of this iteration of the while loop.";

            [no_step]
            end_loop = false;

            [no_step]
            this_is_the_next_line_that_will_execute = helper.get_while_loop(ast);
        }
    }

    [no_step] if (helper.this_is_a_return_statement(ast)) {
        let this_is_the_next_line_that_will_execute: Line;
        [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_return_statement(ast);

        let the_return_value_of_the_function_is_determined_here;
        the_return_value_of_the_function_is_determined_here = helper.get_return_output(this_is_the_next_line_that_will_execute, variables);
        [prompt]
        "The print statement below prints out the value(s) that the function returned. Enter that solution in the solution box!";
    }
}
