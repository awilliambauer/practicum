var test_util = (function () {"use strict";
    var self = {}

    self.parse = function(algoName) {
        var algoFile = new XMLHttpRequest();
        var ast;
        algoFile.open("GET", "base/tests/"+algoName+".txt", false);
        algoFile.onreadystatechange = function () {
            ast = simulator_parsing.browser_parse(algoFile.responseText);
        };
        algoFile.send(null);
        return ast;
    }

    self.getStates = function(algoName, startState, globals) {
        if (!globals) { globals = {Math:Math}; }
        var sim = simulator(self.parse(algoName), globals);
        return explainer.create_explanations(sim.run_all(startState));
    };

    self.run = function(algo, options) {
        options = options ? options : {};
        var globals = options.globals ? options.globals : {Math:Math};
        var args = options.args ? options.args : [];
        var state = options.state ? options.state : {};

        var sim = simulator(self.parse(algo), globals);
        return explainer.create_explanations(sim.run_all(state));
    }

    return self;
}());
