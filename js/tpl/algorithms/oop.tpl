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

    //TODO: Add some way to describe the focus of each class investigation
    //TODO: support multiple classes in a problem
    [prompt]
    "Welcome to classes/objects practice.";

    //TODO: step through and SIMULATE each line. store the methods within the class definition

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
        // simulate line inside class?
    }

    let this_is_the_next_line_that_will_execute: Line;
    [interactive("next_line")] this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);

    [prompt]
    "This is the instantiation of an object.";

    //[no_step]
    let Let_us_look_at_the_class_definition: AstNode;
    //[no_step]
    Let_us_look_at_the_class_definition = this_is_the_next_line_that_will_execute.expression.args[1].object;

    [no_step]
    let it_defines_a_new_object_which_we_will_add_to_the_variable_bank: Instance;
    [interactive("add_variable")] it_defines_a_new_object_which_we_will_add_to_the_variable_bank = helper.add_class_instance(variables, ast.body);

    [no_step]
    let theClass;
    [no_step]
    theClass = helper.get_class_from_name(helper.get_class_name(ast.body), ast.body);

    // record current position to revisit later
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
    while (helper.is_still_inside_constructor(this_is_the_next_line_that_will_execute)) {
        //TODO: look ahead one line
        this_is_the_next_line_that_will_execute = theConstructor.body[constructorIndex];

        [prompt]
        "It assigns a value.";

        [no_step]
        helper.assign_value_within_object(variables, theConstructor.body[constructorIndex], it_defines_a_new_object_which_we_will_add_to_the_variable_bank);

        [no_step]
        constructorIndex = constructorIndex + 1;
        // TODO: use a method that advances constructor and returns line outside of it when done
    }

    [no_step]
    this_is_the_next_line_that_will_execute = lineOutsideClass;

    //this_is_the_next_line_that_will_execute = helper.get_next_line(ast.body, this_is_the_next_line_that_will_execute);
    // doesn't work. call a helper to reset linenum where it should be
    // need to clear highlight of class name

    // return to outside scope
    // check the print line

    [prompt]
    "end of tpl";
}