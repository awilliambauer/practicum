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
    "Welcome to if/else practice.";

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
    while(helper.check_for_if(ast)) {

        let this_is_the_next_line_that_will_execute: Line;
        [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);

        [no_step]
        let it_defines_a_new_local_variable_which_we_will_add_to_the_variable_bank: Variable;
        [interactive("add_variable")]
        it_defines_a_new_local_variable_which_we_will_add_to_the_variable_bank = helper.add_local_variable(variables, ast);
    }

    [no_step] do {

        let this_is_the_next_line_that_will_execute: Line;
        [no_step]
        this_is_the_next_line_that_will_execute = null;
        let condition_outcome;
        [no_step]
        condition_outcome = null;
        let parent;
        [no_step]
        parent = ast;

        [no_step] do {
            [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_the_next_line_in_this_block_to_execute(parent, this_is_the_next_line_that_will_execute, condition_outcome);

            [no_step] if (helper.is_this_a_return_statement(this_is_the_next_line_that_will_execute)) {
                let the_return_value_of_the_function_is_determined_here;
                the_return_value_of_the_function_is_determined_here = helper.get_return_output(this_is_the_next_line_that_will_execute, variables);
                [prompt]
                "The print statement below prints out the value(s) that the function returned. Enter that solution in the solution box!";
                return;
            }

            [no_step]
            if (helper.is_if(this_is_the_next_line_that_will_execute)) {
                [prompt]
                "It’s an if statement which means we need to determine whether the conditional part of the if statement is true or false.";
                let this_is_the_conditional_of_the_if_statement: AstNode;
                this_is_the_conditional_of_the_if_statement = this_is_the_next_line_that_will_execute.condition;

                [interactive("conditional")]
                if (helper.does_this_conditional_evaluate_to_true(variables, this_is_the_conditional_of_the_if_statement)) {
                    [prompt]
                    "Since it’s true we move on to the lines inside of this code block.";
                    [no_step]
                    parent = this_is_the_next_line_that_will_execute;
                    [no_step]
                    this_is_the_next_line_that_will_execute = null;
                    [no_step]
                    condition_outcome = true;
                } else {
                    [prompt]
                    "Since it’s false we will be ignoring all of the lines in this code block.";
                    [no_step]
                    if (helper.has_else_if(this_is_the_next_line_that_will_execute)) {
                        [prompt]
                        "Since the if statement was false we now evaluate this elif case.";
                        [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_elif(this_is_the_next_line_that_will_execute);
                        [prompt]
                        "Just like with if statements we need to decide whether the conditional part of the elif statement is true or false.";
                        let this_is_the_conditional_of_an_elif_statement: AstNode;
                        this_is_the_conditional_of_an_elif_statement = this_is_the_next_line_that_will_execute.condition;

                        [interactive("conditional")]
                        if (helper.does_this_conditional_evaluate_to_true(variables, this_is_the_conditional_of_an_elif_statement)) {
                            [prompt]
                            "Since it’s true we move on to the lines inside of this code block.";
                            [no_step]
                            parent = this_is_the_next_line_that_will_execute;
                            [no_step]
                            this_is_the_next_line_that_will_execute = null;
                            [no_step]
                            condition_outcome = true;
                        } else {
                            [prompt]
                            "Since it’s false we will be ignoring all of the lines in this code block.";

                            [no_step]
                            if (helper.has_else(this_is_the_next_line_that_will_execute)) {
                                [prompt]
                                "Since all previous if and elif statements were false we automatically move into the else case.";
                                [no_step]
                                parent = this_is_the_next_line_that_will_execute;
                                [no_step]
                                this_is_the_next_line_that_will_execute = null;
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
                            this_is_the_next_line_that_will_execute = null;
                            [no_step]
                            condition_outcome = false;
                        } else {
                            break;
                        }
                    }
                }
            } else {
                [prompt]
                "This line updates the value of a variable.";

                let update_the_variable_in_the_variable_bank: Variable;
                [interactive("update_variable")]
                update_the_variable_in_the_variable_bank = helper.assign_the_new_value_to_the_variable(variables, this_is_the_next_line_that_will_execute);
                [no_step]
                if (helper.is_there_another_line_to_execute(parent, this_is_the_next_line_that_will_execute, condition_outcome) == false) {
                    [prompt]
                    "Now we can move back out of this code block to the main part of the function and skip any elif or else statements that come later.";
                }
            }

        } while (helper.is_there_another_line_to_execute(parent, this_is_the_next_line_that_will_execute, condition_outcome));
    } while (helper.is_this_the_last_line(ast));

    [no_step] if (helper.this_is_a_return_statement(ast)) {
        let this_is_the_next_line_that_will_execute: Line;
        [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_return_statement(ast);

        let the_return_value_of_the_function_is_determined_here;
        the_return_value_of_the_function_is_determined_here = helper.get_return_output(this_is_the_next_line_that_will_execute, variables);
        [prompt]
        "The print statement below prints out the value(s) that the function returned. Enter that solution in the solution box!";
    }
}