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
        var algoFile = new XMLHttpRequest();
        algoFile.open("GET", "base/tests/"+algoName+".js", false);
        var states = [startState];
        algoFile.onreadystatechange = function () {
            simulator.init(algoFile.responseText);

            while(!states[states.length - 1].done) {
                states.push(simulator.nextState(states[states.length - 1]));
            }

        };
        algoFile.send(null);
        return states;
    };

    return self;
}());
