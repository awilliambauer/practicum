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

    [prompt]
    "Welcome to classes/objects practice.";

    [no_step]
    let this_is_the_next_line_that_will_execute: Line;
    [no_step]
    this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);
    
    [prompt]
    "This is a class declaration. We'll revisit this later.";
    
    [no_step]
    while(helper.check_instantiation(ast.body) == false){
        [no_step]
        helper.go_next_line_without_reading();
    }

    let this_is_the_next_line_that_will_execute: Line;
    [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);

    [no_step]
    do {
        if (helper.check_instantiation(ast.body)){
            [prompt]
            "This is the instantiation of an object.";

            let Let_us_look_at_the_class_definition: AstNode;
            Let_us_look_at_the_class_definition = this_is_the_next_line_that_will_execute.expression.args[1].object;

            [no_step]
            let it_defines_a_new_object_which_we_will_add_to_the_variable_bank: Instance;
            [interactive("add_variable")] it_defines_a_new_object_which_we_will_add_to_the_variable_bank = helper.add_class_instance(variables, ast.body);

            [no_step]
            let theClass;
            [no_step]
            theClass = helper.get_class_from_name(Let_us_look_at_the_class_definition.value, ast.body);

            [no_step]
            let lineOutsideClass;
            [no_step]
            lineOutsideClass = this_is_the_next_line_that_will_execute;

            [prompt]
            "Now we enter the constructor for this class.";

            [no_step]
            let theConstructor;
            [no_step]
            theConstructor = helper.get_class_constructor(theClass);

            [no_step]
            let constructorIndex;
            [no_step]
            constructorIndex = 0;

            [no_step]
            this_is_the_next_line_that_will_execute = theConstructor.body[constructorIndex];
            [no_step]
            while (constructorIndex < helper.get_class_constructor_body_range(theClass)) {
                this_is_the_next_line_that_will_execute = theConstructor.body[constructorIndex];

                [prompt]
                "It assigns a value.";

                [no_step]
                helper.assign_value_within_object(variables, theConstructor.body[constructorIndex], it_defines_a_new_object_which_we_will_add_to_the_variable_bank);

                [no_step]
                constructorIndex = constructorIndex + 1;
            }
            [no_step]
            this_is_the_next_line_that_will_execute = lineOutsideClass;
            [no_step]
            helper.go_next_line_without_reading();
        }
    } while(helper.check_instantiation(ast.body));
    


    [no_step] if (helper.this_is_a_print_statement(ast)) {
        [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_print_statement(ast);

        let the_print_function_prints_out_the_values_passed_to_it;
        the_print_function_prints_out_the_values_passed_to_it = helper.get_print_output(this_is_the_next_line_that_will_execute, variables);
        [prompt]
        "The print statement below prints out the value(s) that the function returned. Enter that solution in the solution box!";
    }
}

//Wanted layout for TPL at this moment: 
//Skip class definitions until we get to first line which does not define a class.
//Do {iterate through code} while no print statements (There should only ever be one print statement.)
//If class instantiation, do {add to variable bank} while things in the class to instantiate, 
//then go back to line previously at (class instantiation line) and read next line (lineOutsideClass is used for this).
//Else if use a function, simulate the act of the function and change variable bank accordingly
//Else do whatever that line does.
//Once print is encountered, exit do while, find the print output and then ask for solution.