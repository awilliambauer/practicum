/**
 * NOTE: assumes algorithm is a single function
 */
var simulator = (function() {
    "use strict";

    var self = {};
    self.stack = [];
    self.locals = {}; // TODO probably too simplistic given what stack allows
    self.ip = -1; // instruction pointer -- index of the current instruction for the body on top of the stack
    self.sp = -1; // stack pointer -- index of the top of the stack

    self.init = function(algo) {
        self.ast = simulator_parsing.browser_parse(algo);
        self.currentNode = self.ast; // initialize currentNode at the root
        self.ip = -1;
        self.sp = -1;
    };

    function advanceNode() {
        //console.log("before advanced node");
        //console.log("sp -> " + self.sp);
        //console.log("ip -> " + self.ip);
        //console.log(JSON.stringify(self.currentNode));
        self.ip += 1;
        while (self.ip === self.stack[self.sp].body.length) { // done with body on top of stack
            self.ip = self.stack.pop().oldIp;
            self.sp -= 1;
            if (self.sp === -1) { // we're done
                self.currentNode = null;
                return;
            }
        }
        if (self.ip < 0 || self.ip >= self.stack[self.sp].body.length) {
            throw new Error(self.ip + " is an invalid instruction pointer for " + JSON.stringify(self.stack));
        }
        self.currentNode = self.stack[self.sp].body[self.ip];
        //console.log("after advanced node");
        //console.log("sp -> " + self.sp);
        //console.log("ip -> " + self.ip);
        //console.log(JSON.stringify(self.currentNode));
    }

    function addToStack(statements) {
        //console.log("stack before add");
        //console.log("sp -> " + self.sp);
        //console.log("ip -> " + self.ip);
        //console.log(JSON.stringify(self.stack));
        self.stack.push({body: statements, oldIp: self.ip + 1});
        self.ip = -1;
        self.sp += 1;
        //console.log("stack after add");
        //console.log("sp -> " + self.sp);
        //console.log("ip -> " + self.ip);
        //console.log(JSON.stringify(self.stack));
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

    function step(state) {
        self.locals["state"] = state;
        var cur = self.currentNode;
        if (cur === null) {
            // TODO decide what should happen here
            state.done = true;
            return state;
        }
        switch(cur.tag) {
            case "function":
                state.prompt = "Let's start";
                addToStack(cur.body);
                break;
            case "declaration":
                throw new Error("no defined step behavior for declarations -- they should be skipped");
            case "expression":
                evaluate(cur.expression, state);
                break;
            case "if":
                // TODO format condition expressions in prompts
                if (evaluate(cur.condition, state)) {
                    state.prompt = "Condition is true, take the then branch";
                    addToStack(cur.then_branch);
                } else {
                    state.prompt = "Condition is false, take the else branch";
                    if (Array.isArray(cur.else_branch)) { // no if else, branch is list of statements
                        addToStack(cur.else_branch);
                    } else { // if else, branch is single statement
                        addToStack([cur.else_branch]);
                    }
                }
                break;
            default:
                throw new Error("node tag not recognized " + JSON.stringify(cur));
        }
        advanceNode();
        //console.log(JSON.stringify(self.stack));
        //console.log(JSON.stringify(self.currentNode));
        return state;
    }

    function copyState(state) {
        // TODO should this do something smarter?
        return JSON.parse(JSON.stringify(state));
    }

    self.nextState = function(stateIn) {
        //console.log("cur...");
        //console.log(JSON.stringify(self.currentNode));
        // copy the current state object
        var stateOut = copyState(stateIn);
        //console.log(stateOut);
        // skip declarations since there's nothing to do
        while(self.currentNode !== null && self.currentNode.tag === "declaration") {
            advanceNode();
        }
        return step(stateOut);
    };

    return self;
}());


