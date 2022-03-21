
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

        switch (expr.tag) {
            case 'method':
                args = [];
                for(let idx = 0; idx < expr.body.length; idx++){
                    args.push(evaluate_expression(context, expr.body[idx]));
                }
                return args;
            case 'expression':
                switch (expr.expression.tag){
                    case "return":
                      obj = evaluate_expression(context, expr.expression.args.value[0]);
                      obj.type = "return";
                      return obj;
                }
            case 'element':
              let correct_val = null;
              for(idx = 0; idx < context.values.length; idx++){
                  if (context.values[idx].name == expr.name){
                      correct_val = context.values[idx];
                  }
              }
              if (correct_val === null) Error("Unable to evaluate class reference.");
              return {type: correct_val.type, value: correct_val.value};
            case 'declaration':
                obj = evaluate_expression(context, expr.expression);
                obj.name = expr.expression.args[0].name;
                return obj;
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
                if (!r && expr.value !== "self") throw new Error("unknown identifier " + expr.value);
                if(expr.value === "self"){
                    return expr;
                }
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
                } else if (obj.type === "object"){
                    let correctVal = null;
                    for(idx = 0; idx < obj.values.length; idx++){
                        if (obj.values[idx].name == expr.name){
                            correctVal = obj.values[idx];
                        }
                    }
                    if (correctVal === null) Error("Unable to evaluate class reference.");
                    return {type: correctVal.type, value: correctVal.value};
                } else if (obj.tag === "identifier"){
                    return evaluate_expression(context, {tag: "element", name: expr.name});
                } else {
                    throw new Error("Unable to evaluate reference.");
                }
            case 'call':
                obj = expr.object;
                args = [];
                for (let arg of expr.args) {
                    args.push(evaluate_expression(context, arg));
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
                    for(let idx = 1; idx < context[instance_name].reference.body.length; idx++){
                        if (context[instance_name].reference.body[idx].name === reference_name){
                            return evaluate_expression(context[instance_name], context[instance_name].reference.body[idx]);
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