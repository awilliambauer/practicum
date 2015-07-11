var main_simulator = (function () {"use strict";
    var self = {};
    var states;
    var currentState;

    self.getHelper = function(algoName) {
        if (algoName == "expressions") {
            return new ExpressionsHelper();
        }
        else if (algoName == "if_else") {
            return new IfElseHelper();
        }
    }

    self.parse = function(algoName) {
        return fetch("js/tpl/algorithms/" + algoName + ".tpl.txt").then(function(response) {
            if (response.status === 200) {
                return response.text().then(function(source) {
                    return simulator_parsing.browser_parse(source);
                });

            } else {
                throw new Error(response.status + ' ' + response.statusText);
            }
        });
    };

    self.initialize = function(algo, options) {
        options = options ? options : {};
        var args = options.args ? options.args : [];
        var state = options.state ? options.state : {};

        var globals = {
            helper: self.getHelper(algo)
        }

        return self.parse(algo).then(function(ast) {
            var sim = simulator(ast, globals);
            // HACK function name currently ignored
            sim.start_function(undefined, args);
            states = explainer.create_explanations(sim.run_all(state));
            currentState = 0;
        });

    };

    self.next = function() {
        if (currentState + 1 < states.length) {
            return states[currentState++];
        }
        else {
            return null;
        }
    }

    return self;
}());
