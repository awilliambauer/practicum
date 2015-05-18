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
        self.ip += 1;
        if (self.ip === self.stack[self.sp].body.length) { // done with body on top of stack
            self.ip = self.stack.pop().oldIp;
            self.sp -= 1;
        }
        if (self.sp === -1) { // we're done
            return null;
        }
        if (self.ip < 0 || self.ip >= self.stack[self.sp].body.length) {
            throw self.ip + " is an invalid instruction pointer for " + self.stack;
        }
        self.currentNode = self.stack[self.sp].body[self.ip];
    }

    function evaluate(expr, state) {
        switch (expr.tag) {
            case "binop":
                var lhs = expr.args[0];
                var rhs = expr.args[1];
                if (expr.operator === "=") {
                    switch (lhs.tag) {
                        case "identifier":
                            state.prompt = lhs.value.replace("_", " ") + " is " + evaluate(rhs, state);
                            self.locals[lhs.value] = evaluate(rhs, state);
                            break;
                        case "reference": // TODO extend for chained references
                            state.prompt = lhs.name.replace("_", " ") + " is " + evaluate(rhs, state);
                            self.locals[lhs.object.value][lhs.name] = evaluate(rhs, state);
                    }
                } else {
                    var lv = evaluate(lhs, state);
                    var rv = evaluate(rhs, state);
                    if (expr.operator === "+" && (typeof lv === "string" || typeof rv === "string")) {
                        return lv + rv;
                    } else {
                        return eval(lv + expr.operator + rv);
                    }
                }
                break;
            case "reference": // TODO extend for chained references
                return self.locals[expr.object.value][expr.name];
                break;
            case "identifier":
                return self.locals[expr.value];
                break;
            case "literal":
                return expr.value;
            case "call":
                if (expr.object.tag === "identifier") {
                    var fnName = expr.object.value;
                    if (typeof self.locals[fnName] === "function") {
                        return self.locals[fnName].apply(this, expr.args.map(function (arg) { return evaluate(arg, state)}));
                    } else if (typeof window[fnName] === "function") {
                        var arg = evaluate(expr.args[0], state);
                        return window[fnName].apply(this, [arg]);
                        //return window[fnName].apply(this, expr.args.map(function (arg) { return evaluate(arg, state)}));
                    } else {
                        throw fnName + " not a defined function";
                    }
                } else {
                    throw "only calling eval is currently supported";
                }
                break;
        }
    }

    self.nextState = function(state) {
        console.log("cur...");
        console.log(self.currentNode);
        self.locals["state"] = state;
        var cur = self.currentNode;
        if (cur === null) {
            // TODO decide what should happen here
            return state;
        }
        switch(cur.tag) {
            case "function":
                state.prompt = "Let's start";
                self.stack.push({body: cur.body, oldIp: self.ip});
                self.sp += 1;
                self.ip = 0;
                self.currentNode = self.stack[self.sp].body[self.ip];
                break;
            case "declaration":
                // skip since there's nothing to do
                advanceNode();
                return self.nextState(state);
            case "expression":
                evaluate(cur.expression, state);
                advanceNode();
                break;
        }
        return state;
    };

    return self;
}());

var algoFile = new XMLHttpRequest();
algoFile.open("GET", "tests/test1.js", false);
algoFile.onreadystatechange = function () {
    simulator.init(algoFile.responseText);
    console.log(JSON.stringify(simulator.ast));
    var state = {
        left: 10,
        right: 5,
        op: "/",
        prompt: ""
    };
    while(state.result === undefined) {
        state = simulator.nextState(state);
        console.log("state -> " + state.prompt);
    }
    console.log("state -> " + state.result);
};
algoFile.send(null);
