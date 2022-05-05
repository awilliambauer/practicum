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
    "Welcome to nested for loop practice.";

    [prompt]
    "These problems assume you are comfortable with for loops already. If not, we recommend trying the for loop investigation problems first.";

    [prompt]
    "Let’s walk through the code line-by-line while keeping track of variables.";

    [no_step]
    while(helper.check_for_loop(ast)) {

        let this_is_the_next_line_that_will_execute: Line;
        [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);

        [no_step]
        let it_defines_a_new_local_variable_which_we_will_add_to_the_variable_bank: Variable;
        [interactive("add_variable")]
        it_defines_a_new_local_variable_which_we_will_add_to_the_variable_bank = helper.add_local_variable(variables, ast);
    }

    let this_is_the_next_line_that_will_execute: Line;
    [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_loop(ast);

    let loop;
    [no_step]
    loop = helper.get_loop(ast);
    [prompt]
    "We're at the beginning of a new for-loop block. Look at the loop header.";

    [no_step]
    let lets_visualize_our_sequence: Variable;

    [no_step]
    {
        let this_is_the_loop_initialization: AstNode;
        let this_is_the_loop_iterable: AstNode;
        let this_is_the_loop_variable: AstNode;
        [no_step]
        this_is_the_loop_iterable = loop.iterable;
        [no_step]
        this_is_the_loop_variable = loop.variable;

        [prompt]
        "The loop variable will be iterating through a loop sequence that range generates from the range call.";

        [no_step]
        if (helper.is_loop_called_without_range(loop)) {
            [prompt]
            "The for loop will end when the loop variable has moved through each element in the sequence. Now let’s move on into the for loop.";

            lets_visualize_our_sequence = helper.get_iterable_sequence(variables, this_is_the_loop_iterable, false);

            let add_the_sequence_to_the_variable_bank: Variable;
            [interactive("add_variable")]
            add_the_sequence_to_the_variable_bank = helper.add_the_loop_sequence_to_the_variable_bank(variables, lets_visualize_our_sequence, false);

            let this_is_the_first_index_for_the_loop_sequence: ArrayElement;
            [interactive("list_element_click")]
            this_is_the_first_index_for_the_loop_sequence = helper.loop_sequence_index(variables, lets_visualize_our_sequence, false, true);
        } else {
            lets_visualize_our_sequence = helper.get_iterable_sequence(variables, this_is_the_loop_iterable, false);

            let add_the_sequence_to_the_variable_bank: Variable;
            [interactive("add_variable")]
            add_the_sequence_to_the_variable_bank = helper.add_this_to_the_variable_bank(variables, lets_visualize_our_sequence, false);

            let this_is_the_first_index_for_the_loop_sequence: ArrayElement;
            [interactive("list_element_click")]
            this_is_the_first_index_for_the_loop_sequence = helper.loop_sequence_index(variables, lets_visualize_our_sequence, false, true);

            [prompt]
            "The for loop will end when the loop variable has moved through each element in the sequence.";
        }
        [prompt]
        "Let's set the value of our loop variable to the first element of the outer sequence.";

        let add_the_starting_value_for_the_loop_variable_to_the_variable_bank: Variable;
        [interactive("add_variable")]
        add_the_starting_value_for_the_loop_variable_to_the_variable_bank = helper.add_this_to_the_variable_bank(variables, helper.get_loop_init_variable(variables, this_is_the_loop_variable, this_is_the_loop_iterable, false));

        [prompt]
        "Now let’s move on into the for loop.";
    }

    let iterations: Boolean;
    [no_step]
    iterations = false;

    let end_loop: Boolean;
    [no_step]
    end_loop = false;

    [interactive("conditional")]
    do {

        [no_step]
        if (iterations) {
            let now_we_need_to_update_the_loop_variable: AstNode;
            now_we_need_to_update_the_loop_variable = loop.increment;

            let this_is_the_next_index_for_the_loop_sequence: ArrayElement;
            [interactive("list_element_click")]
            this_is_the_next_index_for_the_loop_sequence = helper.loop_sequence_index(variables, lets_visualize_our_sequence, false, false);

            let update_the_value_of_the_loop_variable_in_the_variable_bank: Variable;
            [interactive("update_variable")]
            update_the_value_of_the_loop_variable_in_the_variable_bank = helper.execute_the_loop_increment(variables, loop.variable, false);
        }

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
                let the_print_function_prints_out_the_values_passed_to_it;
                the_print_function_prints_out_the_values_passed_to_it = helper.get_return_output(this_is_the_next_line_that_will_execute, variables);
                [prompt]
                "The function ends as soon as we hit a return statement regardless of any more for loop iterations or anything else happening in the problem.";
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
            if (helper.is_for(this_is_the_next_line_that_will_execute)) {
                let inner_loop;
                [no_step]
                inner_loop = this_is_the_next_line_that_will_execute;
                [prompt]
                "We're at the beginning of a nested for-loop block. Look at the loop header.";

                let this_is_the_inner_loop_initialization: AstNode;
                let this_is_the_inner_loop_iterable: AstNode;
                let this_is_the_inner_loop_variable: AstNode;
                [no_step]
                this_is_the_inner_loop_iterable = inner_loop.iterable;
                [no_step]
                this_is_the_inner_loop_variable = inner_loop.variable;
                [no_step]
                let lets_visualize_our_inner_sequence: Variable;

                [prompt]
                "Again the loop variable starts at index 0 and will be moving through the sequence range generates.";

                [no_step]
                if (helper.is_loop_called_without_range(inner_loop)) {
                    [prompt]
                    "The for loop will end when the loop variable has moved through each element in the sequence. Now let’s move on into the for loop.";

                    lets_visualize_our_inner_sequence = helper.get_iterable_sequence(variables, this_is_the_inner_loop_iterable, true);

                    let add_the_inner_sequence_to_the_variable_bank: Variable;
                    [interactive("add_variable")]
                    add_the_inner_sequence_to_the_variable_bank = helper.add_the_loop_sequence_to_the_variable_bank(variables, lets_visualize_our_inner_sequence, true);

                    let this_is_the_first_index_for_the_inner_loop_sequence: ArrayElement;
                    [interactive("list_element_click")]
                    this_is_the_first_index_for_the_inner_loop_sequence = helper.loop_sequence_index(variables, lets_visualize_our_inner_sequence, true, true);
                } else {
                    lets_visualize_our_inner_sequence = helper.get_iterable_sequence(variables, this_is_the_inner_loop_iterable, true);

                    let add_the_inner_sequence_to_the_variable_bank: Variable;
                    [interactive("add_variable")]
                    add_the_inner_sequence_to_the_variable_bank = helper.add_this_to_the_variable_bank(variables, lets_visualize_our_inner_sequence, true);

                    let this_is_the_first_index_for_the_inner_loop_sequence: ArrayElement;
                    [interactive("list_element_click")]
                    this_is_the_first_index_for_the_inner_loop_sequence = helper.loop_sequence_index(variables, lets_visualize_our_inner_sequence, true, true);

                    [prompt]
                    "The for loop will end when the loop variable has moved through each element in the sequence.";
                }
                [prompt]
                "Let’s set our loop variable to the first element of the inner sequence.";

                let add_the_starting_value_for_the_loop_variable_to_the_variable_bank: Variable;
                [interactive("add_variable")]
                add_the_starting_value_for_the_loop_variable_to_the_variable_bank = helper.add_this_to_the_variable_bank(variables, helper.get_loop_init_variable(variables, this_is_the_inner_loop_variable, this_is_the_inner_loop_iterable, true));

                [prompt]
                "Now let’s move on into the for loop.";

                let inner_iterations: Boolean;
                [no_step]
                inner_iterations = false;

                [interactive("conditional")]
                do {

                    [no_step]
                    if (inner_iterations) {
                        let now_we_need_to_update_the_inner_loop_variable: AstNode;
                        now_we_need_to_update_the_inner_loop_variable = inner_loop.increment;

                        let this_is_the_next_index_for_the_inner_loop_sequence: ArrayElement;
                        [interactive("list_element_click")]
                        this_is_the_next_index_for_the_inner_loop_sequence = helper.loop_sequence_index(variables, lets_visualize_our_inner_sequence, true, false);

                        let update_the_value_of_the_inner_loop_variable_in_the_variable_bank: Variable;
                        [interactive("update_variable")]
                        update_the_value_of_the_inner_loop_variable_in_the_variable_bank = helper.execute_the_loop_increment(variables, inner_loop.variable, true);
                    }

                    [no_step]
                    this_is_the_next_line_that_will_execute = null;
                    let inner_condition_outcome;
                    [no_step]
                    inner_condition_outcome = null;
                    let inner_parent;
                    [no_step]
                    inner_parent = inner_loop;

                    [no_step]
                    do {
                        [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_the_next_line_in_this_block_to_execute(inner_parent, this_is_the_next_line_that_will_execute, inner_condition_outcome);

                        [no_step] if (helper.is_this_a_return_statement(this_is_the_next_line_that_will_execute)) {
                            let the_print_function_prints_out_the_values_passed_to_it;
                            the_print_function_prints_out_the_values_passed_to_it = helper.get_return_output(this_is_the_next_line_that_will_execute, variables);
                            [prompt]
                            "The function ends as soon as we hit a return statement regardless of any more for loop iterations or anything else happening in the problem.";
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
                                inner_parent = this_is_the_next_line_that_will_execute;
                                [no_step]
                                this_is_the_next_line_that_will_execute = null;
                                [no_step]
                                inner_condition_outcome = true;
                            } else {
                                [prompt]
                                "Since it’s not true we will be ignoring all of the lines in the if statement.";
                                [no_step]
                                if (helper.has_else(this_is_the_next_line_that_will_execute)) {
                                    [no_step]
                                    inner_parent = this_is_the_next_line_that_will_execute;
                                    [no_step]
                                    this_is_the_next_line_that_will_execute = null;
                                    [no_step]
                                    inner_condition_outcome = false;
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
                        if ((inner_parent.id != inner_loop.id) && (helper.is_there_another_line_to_execute(inner_parent, this_is_the_next_line_that_will_execute, inner_condition_outcome) == false)) {
                            [no_step]
                            this_is_the_next_line_that_will_execute = inner_parent;
                            [no_step]
                            inner_parent = inner_loop;
                        }
                    } while (helper.is_there_another_line_to_execute(inner_parent, this_is_the_next_line_that_will_execute, inner_condition_outcome));

                    [no_step] if (helper.is_break(this_is_the_next_line_that_will_execute)) {
                        [no_step]
                        this_is_the_next_line_that_will_execute = inner_loop;
                        break;
                    }

                    [no_step]
                    end_loop = true;

                    [prompt]
                    "We have reached the end of this iteration of the inner for loop.";

                    [no_step]
                    end_loop = false;

                    [no_step]
                    this_is_the_next_line_that_will_execute = inner_loop;

                    [no_step]
                    inner_iterations = true;
                } while (helper.is_there_another_item_in_the_loop_sequence(variables, true));

            [no_step]
            end_loop = true;

            [prompt]
            "The inner for loop has been completed so now we move back to the outer for loop and continue.";

            [no_step]
            end_loop = false;

            } else {

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

            }

        } while (helper.is_there_another_line_to_execute(parent, this_is_the_next_line_that_will_execute, condition_outcome));

        [no_step] if (helper.is_break(this_is_the_next_line_that_will_execute)) {
            [no_step]
            this_is_the_next_line_that_will_execute = helper.get_loop(ast);
            break;
        }

        [no_step]
        end_loop = true;

        [prompt]
        "We have reached the end of this iteration of the outer for loop.";

        [no_step]
        end_loop = false;

        [no_step]
        this_is_the_next_line_that_will_execute = helper.get_loop(ast);

        [no_step]
        iterations = true;
    } while (helper.is_there_another_item_in_the_loop_sequence(variables, false));

    [no_step] if (helper.this_is_a_print_statement(ast)) {
        let this_is_the_next_line_that_will_execute: Line;
        [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_print_statement(ast);

        let the_print_function_prints_out_the_values_passed_to_it;
        the_print_function_prints_out_the_values_passed_to_it = helper.get_print_output(this_is_the_next_line_that_will_execute, variables);

        [prompt]
        "Enter the value(s) that print in the solution box!";
    }

}
