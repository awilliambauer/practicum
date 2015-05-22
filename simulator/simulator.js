function simulator(ast) {
    "use strict";

    var self = {};

    var call_stack = [];

    self.locals = {}; // TODO probably too simplistic given what stack allows

    function pop_next_statement() {
        // if call stack is empty, nothing left to do!
        if (call_stack.length === 0) {
            return null;
        }

        var ss = call_stack[call_stack.length - 1];

        // if current stack state is empty, then go up a level
        if (ss.to_execute.length === 0) {
            call_stack.pop();
            return null;
        }

        // otherwise pop an element off the current stack state.
        return ss.to_execute.pop();
    }

    function push_stack_state(to_execute) {
        var stmts = to_execute.slice();
        stmts.reverse();
        call_stack.push({to_execute: stmts});
    }

    // initialize by pushing the function onto the stack
    push_stack_state([ast]);

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

    function resolveLookup(id) {
        // check locals first
        if (self.locals[id] !== undefined) {
            return self.locals[id];
        }
        // check globals
        if (window[id] !== undefined) {
            return window[id];
        }
        throw "unable to resolve reference " + id;
    }

    function resolveRef(ref) {
        if (ref.tag === "reference") {
            return resolveRef(ref.object)[ref.name];
        }
        return resolveLookup(ref.value);
    }

    function resolveRefsList(ref, objs) {
        if (ref.tag === "reference") {
            var rec = resolveRefsList(ref.object, objs)[ref.name];
            objs.push(rec);
            return rec;
        }
        var l = resolveLookup(ref.value);
        objs.push(l);
        return l;
    }

    function evaluate(expr, state) {
        switch (expr.tag) {
            case "binop":
                var lhs = expr.args[0];
                var rhs = expr.args[1];
                if (expr.operator === "=") {
                    // NOTE assumes we only assign to local variables
                    var rhs_eval = evaluate(rhs, state);
                    switch (lhs.tag) {
                        case "identifier":
                            state.prompt = lhs.value.replace("_", " ") + " is " + rhs_eval;
                            self.locals[lhs.value] = rhs_eval;
                            break;
                        case "reference":
                            state.prompt = lhs.name.replace("_", " ") + " is " + rhs_eval;
                            resolveRef(lhs.object)[lhs.name] = rhs_eval;
                            break;
                        case "index":
                            var lookups = getLookupsArray(lhs);
                            var index = evaluate(lhs.index, state);
                            state.prompt = lookups[0].replace("_", " ") + "'s " + index + " element is " + rhs_eval;
                            resolveRef(lhs.object)[index] = rhs_eval;
                            break;
                        default:
                            throw new Error("left-hand side of assignment has unrecognized type " + JSON.stringify(lhs));
                    }
                } else {
                    var lv = evaluate(lhs, state);
                    // check for boolean short circuit
                    if (shortCircuit(lv, expr.operator)) {
                        return lv;
                    }
                    var rv = evaluate(rhs, state);
                    if (expr.operator === "+" && (typeof lv === "string" || typeof rv === "string")) {
                        return lv + rv;
                    } else {
                        switch(expr.operator) {
                            case "+":
                                return lv + rv;
                            case "-":
                                return lv - rv;
                            case "*":
                                return lv * rv;
                            case "%":
                                return lv % rv;
                            case "/":
                                return lv / rv;
                            case ">":
                                return lv > rv;
                            case ">=":
                                return lv >= rv;
                            case "<":
                                return lv < rv;
                            case "<=":
                                return lv <= rv;
                            case "&&":
                                return lv && rv;
                            case "||":
                                return lv || rv;
                            case "==":
                                return lv === rv;
                            case "!=":
                                return lv !== rv;
                        }
                    }
                }
                break;
            case "reference":
                return resolveRef(expr.object)[expr.name];
            case "identifier":
                return self.locals[expr.value];
            case "index":
                return resolveRef(expr.object)[evaluate(expr.index, state)];
            case "literal":
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
                return ret;
            default:
                throw new Error("expression type not recognized " + JSON.stringify(expr));
        }
    }

    function step(stmt, state) {
        // TODO what does this do?
        self.locals["state"] = state;

        switch(stmt.tag) {
            case "function":
                state.prompt = "Let's start";
                push_stack_state(stmt.body);
                break;
            case "declaration":
                // FIXME nothin' to do, for now
                break;
            case "expression":
                evaluate(stmt.expression, state);
                break;
            case "if":
                // TODO format condition expressions in prompts
                if (evaluate(stmt.condition, state)) {
                    state.prompt = "Condition is true, take the then branch";
                    push_stack_state(stmt.then_branch);
                } else {
                    state.prompt = "Condition is false, take the else branch";
                    push_stack_state(stmt.else_branch);
                }
                break;
            default:
                throw new Error("node tag not recognized " + JSON.stringify(stmt));
        }
    }

    self.is_done = function() {
        return call_stack.length === 0;
    }

    // run the simulator for a single statement.
    // returns: an object containing the new state and last-executed statement,
    // or null if the computation has completed.
    self.run_next_statement = function(in_state) {
        // copy state by sending it to JSON and back; it's easy, and it'll also
        // catch bugs where the state illegally contains non-json.
        var out_state = JSON.parse(JSON.stringify(in_state));

        while (!self.is_done()) {
            var s = pop_next_statement();
            if (s) {
                step(s, out_state);
                return {state:out_state, statement:s};
            }
        }

        return null;
    }

    return self;
}

