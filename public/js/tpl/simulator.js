// helper function, should hide this somewhere
function last(array) {
    return array[array.length - 1];
}

function simulator(ast, globals) {
    "use strict";

    var self = {};

    var call_stack = [];
    var MAX_STACK_LENGTH = 50;
    var MAX_STEP_COUNT = 10000;
    var total_steps = 0;

    function pop_next_statement() {
        // if call stack is empty, nothing left to do!
        if (call_stack.length === 0) {
            return null;
        }

        var ss = last(call_stack);

        // if current stack state is empty, then go up a level
        if (ss.to_execute.length === 0) {
            call_stack.pop();
            return null;
        }

        // otherwise pop an element off the current stack state.
        return ss.to_execute.pop();
    }

    function shallow_copy(object) {
        var copy = {};
        for (var id in object) {
            copy[id] = object[id];
        }
        return copy;
    }

    function push_stack_state(to_execute, marker) {
        if (call_stack.length >= MAX_STACK_LENGTH) {
            throw new Error("max stack size exceeded!");
        }

        var stmts = to_execute.slice();
        stmts.reverse();
        // copy parent context, or start with an empty one if this is the first thing.
        var context = call_stack.length > 0
            ? shallow_copy(last(call_stack).context)
            : {};
        call_stack.push({to_execute: stmts, marker:marker, context:context});
    }

    function shortCircuit(val, op) {
        return (val === true && op === "||") || (val === false && op === "&&");
    }

    function getLookupsArray(e) {
        var node = e;
        var lookups = [];
        // assemble stack of identifiers
        while (node.object.tag === "reference") {
            lookups.push(node.object.name);
            node = node.object;
        }
        lookups.push(node.object.value);
        return lookups;
    }

    /// add a new variable to the context, shadowing any conflicting variable name
    function add_to_context(id, value) {
        // add values as objects so they can be changed in children
        last(call_stack).context[id] = {value:value};
    }

    /// set a value in the current context, errors if not a current variable name
    function set_value(id, value) {
        var ctx = last(call_stack).context;

        // check locals first
        if (id in ctx) {
            ctx[id].value = value;
        } else {
            throw Error("unable to resolve reference " + id);
        }
    }

    function get_value(id) {
        var ctx = last(call_stack).context;

        // check locals first
        if (id in ctx) {
            return ctx[id].value;
        } else if (id in globals) {
            return globals[id];
        } else {
            throw Error("unable to resolve reference " + id);
        }
    }

    function resolveRef(ref) {
        if (ref.tag === "reference") {
            return resolveRef(ref.object)[ref.name];
        }
        return get_value(ref.value);
    }

    function resolveRefsList(ref, objs) {
        if (ref.tag === "reference") {
            var rec = resolveRefsList(ref.object, objs)[ref.name];
            objs.push(rec);
            return rec;
        }
        var l = get_value(ref.value);
        objs.push(l);
        return l;
    }

    function evaluate(expr, state, sr_info) {
        if (sr_info === undefined) {
            sr_info = {}; // supply a dummy object to avoid errors
        }
        switch (expr.tag) {
            case "binop":
                var lhs = expr.args[0];
                var rhs = expr.args[1];
                var lhs_info = {}
                var lv = evaluate(lhs, state, lhs_info);
                // check for boolean short circuit
                if (shortCircuit(lv, expr.operator)) {
                    sr_info.result = lv;
                    return lv;
                }
                var rhs_info = {}
                var rv = evaluate(rhs, state, rhs_info);
                sr_info.name = [lhs_info.name, expr.operator, rhs_info.name].join(" ");
                if (expr.operator === "+" && (typeof lv === "string" || typeof rv === "string")) {
                    sr_info.result = lv + rv;
                    return sr_info.result;
                } else {
                    switch (expr.operator) {
                        case "+": sr_info.result = lv + rv; break;
                        case "-": sr_info.result = lv - rv; break;
                        case "*": sr_info.result = lv * rv; break;
                        case "%": sr_info.result = lv % rv; break;
                        case "/": sr_info.result = lv / rv; break;
                        case ">": sr_info.result = lv > rv; break;
                        case ">=": sr_info.result = lv >= rv; break;
                        case "<": sr_info.result = lv < rv; break;
                        case "<=": sr_info.result = lv <= rv; break;
                        case "&&": sr_info.result = lv && rv; break;
                        case "||": sr_info.result = lv || rv; break;
                        case "==": sr_info.result = lv === rv; break;
                        case "!=": sr_info.result = lv !== rv; break;
                        default: throw new Error("unrecognized operator " + expr.operator);
                    }
                    return sr_info.result;
                }
                break;
            case "reference":
                sr_info.name = expr.name;
                sr_info.result = resolveRef(expr.object)[expr.name];
                return sr_info.result;
            case "identifier":
                sr_info.name = expr.value;
                sr_info.result = get_value(expr.value);
                return sr_info.result;
            case "index":
                sr_info.name = expr.object;
                sr_info.index = expr.index;
                sr_info.result = resolveRef(expr.object)[evaluate(expr.index, state)];
                return sr_info.result;
            case "literal":
                sr_info.name = expr.value
                sr_info.result = expr.value;
                return expr.value;
            case "call":
                var objs = [];
                resolveRefsList(expr.object, objs);
                // last lookup object is the function we want to call, and the one before that is the appropriate
                // this object for those functions that need one
                var fn = objs[objs.length - 1];
                var fn_this = objs[objs.length - 2];
                var args = expr.args.map(function (arg) { return evaluate(arg, state)});
                var ret = fn.apply(fn_this, args);
                sr_info.name = expr.object.name;
                sr_info.result = ret;
                return ret;
            default:
                throw new Error("expression type not recognized " + JSON.stringify(expr));
        }
    }

    function step(stmt, state) {
        total_steps += 1;
        if (total_steps > MAX_STEP_COUNT) {
            throw new Error("max step count exceeded!");
        }

        // HACK slap the current state in the global context
        globals["state"] = state;

        // evaluate all annotations on this statement first
        var annotations = stmt.annotations ? stmt.annotations : [];
        annotations = annotations.map(function(ann) {
            return {name:ann.name, args:[]};
        });

        var result;

        switch(stmt.tag) {
            case "declaration":
                add_to_context(stmt.name, undefined);
                break;
            case "assignment":
                var rhs = stmt.expression;
                var lhs = stmt.destination;
                var rhs_eval = evaluate(rhs, state);
                switch (lhs.tag) {
                    case "identifier":
                        set_value(lhs.value, rhs_eval);
                        result = {name:lhs.value, rhs:rhs_eval};
                        break;
                    case "reference":
                        resolveRef(lhs.object)[lhs.name] = rhs_eval;
                        result = {name:lhs.name, rhs:rhs_eval};
                        break;
                    case "index":
                        var lookups = getLookupsArray(lhs);
                        var index = evaluate(lhs.index, state);
                        resolveRef(lhs.object)[index] = rhs_eval;
                        result = {name:lookups[0], index:index, rhs:rhs_eval};
                        break;
                    default:
                        throw new Error("left-hand side of assignment has unrecognized type " + JSON.stringify(lhs));
                }
                break;
            case "expression":
                evaluate(stmt.expression, state);
                break;
            case "if":
                // TODO format condition expressions in prompts
                if (evaluate(stmt.condition, state)) {
                    push_stack_state(stmt.then_branch, 'then');
                } else if (stmt.else_branch !== null) {
                    push_stack_state(stmt.else_branch, 'else');
                }
                break;
            case "foreach":
                var col = evaluate(stmt.collection);
                if (!Array.isArray(col)) {
                    throw new Error("foreach expects an array, but found " + typeof col);
                }
                var to_exec = col.map(function(x) { return {tag:'foreach:increment', parent:stmt, element:x}; });
                push_stack_state(to_exec, 'foreach');
                break;
            case "foreach:increment":
                push_stack_state(stmt.parent.body);
                add_to_context(stmt.parent.variable, stmt.element);
                break;
            case "dowhile":
                last(call_stack).to_execute.push({tag:'dowhile:condition', parent:stmt});
                push_stack_state(stmt.body, 'do');
                break;
            case "dowhile:condition":
                if (evaluate(stmt.parent.condition, state)) {
                    last(call_stack).to_execute.push({tag:'dowhile:condition', parent:stmt.parent});
                    push_stack_state(stmt.parent.body, 'do');
                }
                break;
            case "while":
                var cond_info = {};
                if (evaluate(stmt.condition, state, cond_info)) {
                    last(call_stack).to_execute.push({tag:'while:condition', parent:stmt});
                    push_stack_state(stmt.body, 'while');
                }
                result = {condition_info:cond_info};
                break;
            case "while:condition":
                var cond_info = {};
                if (evaluate(stmt.parent.condition, state, cond_info)) {
                    last(call_stack).to_execute.push({tag:'while:condition', parent:stmt.parent});
                    push_stack_state(stmt.parent.body, 'while');
                }
                result = {condition_info:cond_info};
                break;
            case "break":
                do { // get loop body off the stack, may be inside ifs right now
                    var loopBody = call_stack.pop();
                } while (!isLoopMarker(loopBody.marker));

                if (loopBody.marker === 'while' || loopBody.marker === 'do') { // get rid of condition check
                    last(call_stack).to_execute.pop();
                }
                break;
            default:
                throw new Error("node tag not recognized " + JSON.stringify(stmt));
        }

        var cs = copy(call_stack);
        return {
            // the problem state
            state: state,
            // the most-recently executed statement
            statement: stmt,
            // the call stack
            call_stack: cs,
            // information about the last statement execution
            statement_result: result,
            // information about current variables
            variables: {
                in_scope: last(cs).context
            },
            annotations: annotations
        };
    }

    function isLoopMarker(marker) {
        return marker === "while" || marker === "do" || marker === "foreach";
    }

    self.is_done = function() {
        return call_stack.length === 0;
    };

    function copy(obj) {
        // copy state by sending it to JSON and back; it's easy, and it'll also
        // catch bugs where the state illegally contains non-json.
        return JSON.parse(JSON.stringify(obj));
    }

    // run the simulator for a single statement.
    // returns: an object containing the new state and last-executed statement,
    // or null if the computation has completed.
    self.run_next_statement = function(in_state) {
        var out_state = copy(in_state);

        while (!self.is_done()) {
            var s = pop_next_statement();
            if (s) {
                return step(s, out_state);
            }
        }

        return null;
    };

    self.start_function = function(name, args) {
        // HACK for now there's only one function, so start the only one.
        push_stack_state(ast.body, 'function');
        // push each argument onto the stack
        if (args.length !== ast.parameters.length) {
            throw new Error(sprintf("function '{0}' given {1} arguments, but has arity {2}", ast.name, args.length, ast.parameters.length));
        }
        for (var i in args) {
            add_to_context(ast.parameters[i].name, args[i]);
        }
    };

    self.run_all = function(start_state) {
        var results = [{state:start_state}];
        while (true) {
            var next = self.run_next_statement(results[results.length - 1].state);
            if (next === null) break;
            else results.push(next);
        }
        return results;
    };

    return self;
}

