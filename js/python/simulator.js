
/** Helper functions to simulate python code (without explanations) */
var python_simulator = function() {
    "use strict";
    var self = {};

    /**
     * Evaluates the given expression to completion.
     * @param context: an object mapping local variable names to {type:string, value:*} objects.
     */
    function evaluate_expression(context, expr) {
        if (!context || !expr || !expr.tag) throw new Error("invalid arguments to evaluate!");

        var arg1, arg2, obj, idx, arg1v, arg2v, r, args;
        // console.log(context);
        // console.log(expr);
        // console.log(expr.tag);
        // console.log(" ");
        switch (expr.tag) {
            case 'method':
                for(let i = 0; i < expr.body.length; i++){
                    var line_result = evaluate_expression(context, expr.body[i])
                    if (line_result.type === "return"){
                        return line_result;
                    } else {
                        let instance_name = expr.params[0].name;
                        for (let j = 0; j < context[instance_name].values.length; j++) {
                            if (context[instance_name].values[j].name === line_result.name) {
                                context[instance_name].values[j].value = line_result.value;
                                break;
                            }
                        }
                    }
                }
                break;
            case 'expression':
                switch (expr.expression.tag){
                    case "return":
                        obj = evaluate_expression(context, expr.expression.args.value[0]);
                        obj.type = "return";
                        return obj;
                }   
                
            case 'declaration':
                var exists = false;
                arg1 = expr.expression.args[0];
                if (context[arg1.value] !== undefined || arg1.tag === "reference"){
                    exists = true;
                } 
                if (exists === false){
                    context[arg1.value] = ({"type": "temp", "name": arg1.value, "value": null})
                }
                //If identifier does not exist, add to context temporarily (variable_bank)
                //If it does, act as normal.
                return evaluate_expression(context, expr.expression);
            case 'paren_expr':
                return evaluate_expression(context, expr.value);
            case 'binop':

                arg1 = evaluate_expression(context, expr.args[0]);
                arg2 = evaluate_expression(context, expr.args[1]);
                arg1v = arg1.value;
                arg2v = arg2.value;
                switch (expr.operator) {
                  case "<":
                    return { type: "bool", value: arg1v < arg2v };
                  case "<=":
                    return { type: "bool", value: arg1v <= arg2v };
                  case ">":
                    return { type: "bool", value: arg1v > arg2v };
                  case ">=":
                    return { type: "bool", value: arg1v >= arg2v };
                  case "==":
                    return { type: "bool", value: arg1v === arg2v };
                  case "!=":
                    return { type: "bool", value: arg1v !== arg2v };
                  case "and":
                    return { type: "bool", value: arg1v && arg2v };
                  case "or":
                    return { type: "bool", value: arg1v || arg2v };
                  case "+":
                    return { type: "int", value: arg1v + arg2v };
                  case "-":
                    return { type: "int", value: arg1v - arg2v };
                  case "*":
                    return { type: "int", value: arg1v * arg2v };
                  case "**":
                    return { type: "int", value: arg1v ** arg2v };
                  case "/":
                    return {
                      type: "int",
                      value:
                        arg1v / arg2v < 0
                          ? Math.ceil(arg1v / arg2v)
                          : Math.floor(arg1v / arg2v),
                    };
                  case "%":
                    return { type: "int", value: arg1v % arg2v };
                  case "=":
                    arg1.value = arg2.value;
                    return arg1;
                  case "+=":
                    arg1.value += arg2.value;
                    return arg1;
                  case "-=":
                    arg1.value -= arg2.value;
                    return arg1;
                  case "/=":
                    arg1.value /= arg2.value;
                    return arg1;
                  case "*=":
                    arg1.value *= arg2.value;
                    return arg1;
                  case "%=":
                    arg1.value %= arg2.value;
                    return arg1;
                  case "and":
                    return { type: "bool", value: arg1v && arg2v };
                  case "or":
                    return { type: "bool", value: arg1v || arg2v };
                  default:
                    throw new Error("Unknown binary operator " + expr.operator);
                }
            case 'literal':
                return {type: expr.type, value: expr.value};
            case 'identifier':
                r = context[expr.value];
                if (r === undefined){
                    if (expr.value.type === "object"){
                        r = context[expr.value.name];
                    } else if (context.name === expr.value){
                        r = context;
                    } else if (context.hasOwnProperty("values")) {
                        for (let i = 0; i < context.values.length; i++){
                            if (context.values[i].name === expr.value){
                                r = {"value": context.values[i].value, "type": context.values[i].type};
                                break;
                            }
                        }
                    } 
                }
                if (!r) throw new Error("unknown identifier " + expr.value);
                return r;
            case 'index':
                obj = evaluate_expression(context, expr.object);
                idx = evaluate_expression(context, expr.index);
                if (obj.type !== 'array') throw new Error("Cannot index into object of type " + obj.type);
                r = obj.value[idx.value];
                if (!r) throw new Error("invalid array index " + idx.value + " of " + obj.type);
                return r;
            case 'reference':
                obj = evaluate_expression(context, expr.object);
                if (obj.type === 'array' && expr.name === 'length') {
                    return {type: 'int', value: obj.value.length};
                } 
                
                else if (obj.type === "object"){
                    let correctVal = null;
                    for(let i = 0; i < obj.values.length; i++){
                        if (obj.values[i].name == expr.name){
                            correctVal = obj.values[i];
                        }
                    }
                    if (correctVal === null) Error("Unable to evaluate class reference.");
                    return {type: correctVal.type, name: correctVal.name, value: correctVal.value};
                } else if (obj.type === "instance") {
                    obj = obj.value
                    let correctVal = null;
                    for(let i = 0; i < obj.values.length; i++){
                        if (obj.values[i].name == expr.name){
                            correctVal = obj.values[i];
                        }
                    }
                    if (correctVal === null) Error("Unable to evaluate instance reference.");
                    return {type: correctVal.type, name: correctVal.name, value: correctVal.value};
                } else if (obj.type === "temp" || obj.temp === "temp") {
                    idx = obj.name;
                    obj = obj.value;
                    let correctVal = null;
                    for(let i = 0; i < obj.values.length; i++){
                        if (obj.values[i].name == expr.name){
                            correctVal = obj.values[i];
                        }
                    }
                    if (correctVal === null) Error("Unable to evaluate instance reference.");
                    return {type: correctVal.type, name: correctVal.name, value: correctVal.value};
                }

                
                else {
                    throw new Error("Unable to evaluate reference:");
                }
            case 'call':
                obj = expr.object;     
                args = [];
                for (let arg of expr.args) {
                    if(obj.tag === "reference"){
                        var class_name = obj.object.value;
                        args.push(evaluate_expression(context[class_name], arg));
                    } else {
                        args.push(evaluate_expression(context, arg));
                    }
                    
                }
                if (obj.value === 'range') {
                    var val = [];
                    if (args.length === 1) {
                        for (let i = 0; i < args[0].value; i++) val.push({type: 'int', value: i})
                    } else if (args.length <= 3) {
                        if (args.length === 3 && args[2].value < 0) {
                            for (let i = args[0].value; i > args[1].value; i += args[2].value) {
                                val.push({type: 'int', value: i});
                            }
                        } else if (args.length < 3 || args[2].value > 0) {
                            for (let i = args[0].value; i < args[1].value; i += (args.length === 2 ? 1 : args[2].value)) {
                                val.push({type: 'int', value: i});
                            }
                        } else {
                            throw new Error("step of range cannot be 0")
                        }
                    } else {
                        throw new Error("wrong number of arguments to range (expected 1, 2, or 3)")
                    }
                    return {type:'array', value:val};
                } else if (obj.value === 'len' && args[0].type === 'array') {
                    return {type:'int', value:args[0].value.length};
                } else if (obj.tag === 'reference'){
                    var reference_name = obj.name;
                    var instance_name = obj.object.value;
                    for(let i = 1; i < context[instance_name].reference.body.length; i++){
                        if (context[instance_name].reference.body[i].name === reference_name){
                            return evaluate_expression(context, context[instance_name].reference.body[i]);
                        }
                    }
                    throw new Error("unable to find function call.")
                } else {
                    throw new Error("unable to evaluate function call.")
                }
            case "return":
                obj = expr.args;
                for (let i = 0; i < obj.value.length; i++) {
                    obj.value[i] = evaluate_expression(context, obj.value[i]);
                }
                return obj;
            default: throw new Error("expression type " + expr.tag + " cannot be evaluated");
        }
    }
    self.evaluate_expression = evaluate_expression;

    /**
     * Executes the given statement to completion.
     * @param context: an object mapping local variable names to {type:string, value:*} objects.
     */
    function execute_statement(context, stmt) {
        switch (stmt.tag) {
            case 'expression':
            case 'declaration':

                return this.evaluate_expression(context, stmt.expression);
            default: throw new Error("unknown statement type " + stmt.tag);
        }
    }
    self.execute_statement = execute_statement;

    /**
     * Returns the next statement that should execute after the given, with respect to the given root ast.
     * Will only work for straight-line code or exiting blocks.
     */
    self.get_next_statement = function(ast, stmt) {
        var parent = java_ast.parent_of(stmt, ast);
        if (!parent) return null;

        var children = java_ast.children_of(parent);
        for (var idx in children) {
            if (children[idx] === stmt) break;
        }
        idx++;
        if (idx < children.length) {
            return children[idx];
        } else {
            return self.get_next_statement(ast, parent);
        }
    };

    return self;
}();




// Every method will either return something or change something, or both. So we want methods to return a list of changes.
// Every change gets added to the variable bank unless it is a return statement, which if it is means that you are declaring an identifier.