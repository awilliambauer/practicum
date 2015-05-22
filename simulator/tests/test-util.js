var test_util = (function () {"use strict";
    var self = {}

    self.parse = function(algoName) {
        var algoFile = new XMLHttpRequest();
        var ast;
        algoFile.open("GET", "base/tests/"+algoName+".js", false);
        algoFile.onreadystatechange = function () {
            ast = simulator_parsing.browser_parse(algoFile.responseText);
        };
        algoFile.send(null);
        return ast;
    }

    self.getStates = function(algoName, startState) {
        var sim = simulator(self.parse(algoName));
        var states = [startState];
        while (true) {
            var next = sim.run_next_statement(states[states.length - 1]);
            if (next === null) break;
            else states.push(next.state);
        }
        return states;
    };

    return self;
}());
