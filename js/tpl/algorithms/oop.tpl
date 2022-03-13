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

    //TODO: Add someway to describe the focus of each class investigation
    [prompt]
    "Welcome to class investigation 1.";
    [prompt]
    "Now let’s walk through the code line-by-line while keeping track of variables.";
    
    [no_step]
    while(helper.check_instantiation(ast) == false){
        [no_step]
        helper.go_next_line_without_reading();
    }


    let this_is_the_next_line_that_will_execute: Line;
    [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);

    [prompt]
    "This is the declaration of the class.";

    let Let_us_look_at_the_class_we_will_instantiate: AstNode;
    Let_us_look_at_the_class_we_will_instantiate = this_is_the_next_line_that_will_execute.expression.args[1].object;

    [no_step]
    let it_defines_a_new_local_variable_which_we_will_add_to_the_variable_bank: Instance;
    [interactive("add_variable")]
    it_defines_a_new_local_variable_which_we_will_add_to_the_variable_bank = helper.add_class_instance(variables, ast);

}