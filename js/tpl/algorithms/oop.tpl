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
    "Welcome to classes/objects practice.";
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

    //TODO: support multiple classes in a problem

    [no_step]
    let theClass;
    [no_step]
    theClass = helper.get_class_from_name(helper.get_class_name(ast), ast);

    [no_step]
    let theConstructor;
    [no_step]
    theConstructor = helper.get_class_constructor(theClass);

    //let this_is_the_constructor: Line;
    //[interactive("next_line")] this_is_the_constructor = helper.jump_inside_constructor(theConstructor.body, this_is_the_next_line_that_will_execute);

    [prompt]
    "Now we enter the constructor.";

    [no_step]
    helper.jump_inside_constructor(theConstructor.body, this_is_the_next_line_that_will_execute);
    [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_next_line(theConstructor.body, this_is_the_next_line_that_will_execute);

    // step through the constructor
    // while inside constructor: fill in values to object line by line
    // example: see type, look up type's value in corresponding function call, add that value to variable bank

}