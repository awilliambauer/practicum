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
    };

    function advanceNode() {
        //console.log("sp -> " + self.sp);
        //console.log("ip -> " + self.ip);
        self.ip += 1;
        if (self.ip === self.stack[self.sp].body.length) { // done with body on top of stack
            self.ip = self.stack.pop().oldIp;
            self.sp -= 1;
        }
        if (self.sp === -1) { // we're done
            self.currentNode = null;
            return;
        }
        if (self.ip < 0 || self.ip >= self.stack[self.sp].body.length) {
            throw self.ip + " is an invalid instruction pointer for " + self.stack;
        }
        self.currentNode = self.stack[self.sp].body[self.ip];
    }

    function shortCircuit(val, op) {
        return (val === true && op === "||") || (val === false && op === "&&");
    }

    function getLookupsArray(e) {
        var node = e;
        var lookups = [];
        // assemble stack of identifiers
        // awkward fencepost
        if (node.object.tag === "reference") {
            lookups.push(node.object.name);
            node = node.object;
        }
        while (node.object.tag === "reference") {
            lookups.push(node.object.name);
            node = node.object;
        }
        lookups.push(node.object.value);
        return lookups;
    }

    //function resolveLookup(id) {
    //    // check locals first
    //    if (self.locals[id] !== undefined) {
    //        return self.locals[id];
    //    }
    //    // check globals
    //    if (self.locals[id] !== undefined) {
    //        return window[id];
    //    }
    //    throw "unable to resolve reference " + id;
    //}

    function resolveLookups(l) {
        // resolve object
        var objs = [];
        var obj;
        // save lookups array
        var lookups = l.slice(0);
        // check locals first
        obj = self.locals[lookups.pop()];
        while(lookups.length > 0 && obj !== undefined) {
            objs.push(obj);
            obj = obj[lookups.pop()];
        }
        if (lookups.length == 0 && obj !== undefined) {
            objs.push(obj);
            return objs;
        }
        // check globals
        lookups = l.slice(0);
        objs = [];
        obj = window[lookups.pop()];
        while(lookups.length > 0 && obj !== undefined) {
            objs.push(obj);
            obj = obj[lookups.pop()];
        }
        if (lookups.length == 0 && obj !== undefined) {
            objs.push(obj);
            return objs;
        }
        throw "unable to resolve reference " + l;
    }

    function evaluate(expr, state) {
        var objs;
        var lookups;
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
                            objs = resolveLookups(getLookupsArray(lhs));
                            objs[objs.length - 1][lhs.name] = rhs_eval;
                            break;
                        case "index":
                            lookups = getLookupsArray(lhs);
                            objs = resolveLookups(lookups);
                            var index = evaluate(lhs.index, state);
                            state.prompt = lookups[0].replace("_", " ") + "'s " + index + " element is " + rhs_eval;
                            objs[objs.length - 1][index] = rhs_eval;
                            break;
                        default:
                            throw "left-hand side of assignment has unrecognized type " + JSON.stringify(lhs);
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
                return resolveLookups(getLookupsArray(expr)).pop()[expr.name];
            case "identifier":
                return self.locals[expr.value];
            case "index":
                return resolveLookups(getLookupsArray(expr)).pop()[evaluate(expr.index, state)];
            case "literal":
                return expr.value;
            case "call":
                lookups = getLookupsArray(expr);
                objs = resolveLookups(lookups);
                // last lookup object is the function we want to call, and the one before that is the appropriate
                // this object for those functions that need one
                var fn = objs[objs.length - 1];
                var fn_this = objs[objs.length - 2];
                var args = expr.args.map(function (arg) { return evaluate(arg, state)});
                var ret = fn.apply(fn_this, args);
                return ret;
            default:
                throw "expression type not recognized " + JSON.stringify(expr);
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
                self.stack.push({body: cur.body, oldIp: self.ip});
                self.sp += 1;
                break;
            case "declaration":
                throw "no defined step behavior for declarations -- they should be skipped";
            case "expression":
                evaluate(cur.expression, state);
                break;
        }
        advanceNode();
        return state;
    }

    function copyState(state) {
        // TODO should this do something smarter?
        return JSON.parse(JSON.stringify(state));
    }

    self.nextState = function(stateIn) {
        //console.log("cur...");
        //console.log(self.currentNode);
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


