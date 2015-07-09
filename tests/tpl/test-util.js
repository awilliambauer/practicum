var tpl_test_util = (function () {"use strict";
    var self = {};

    self.parse = function(algoName, base) {
        var algoFile = new XMLHttpRequest();
        var source;
        base = base ? base : "base/tests/tpl/";
        algoFile.open("GET", base + algoName + ".tpl", false);
        algoFile.onreadystatechange = function () {
            source = algoFile.responseText;
        };
        algoFile.send(null);
        return simulator_parsing.browser_parse(source);
    };

    self.run = function(algo, options) {
        options = options ? options : {};
        var globals = options.globals ? options.globals : {Math:Math};
        var args = options.args ? options.args : [];
        var state = options.state ? options.state : {};

        var sim = simulator(self.parse(algo), globals);
        // HACK function name currently ignored
        sim.start_function(undefined, args);
        return explainer.create_explanations(sim.run_all(state));
    };

    self.run2 = function(ast, options) {
        options = options ? options : {};
        var globals = options.globals ? options.globals : {Math:Math};
        var args = options.args ? options.args : [];
        var state = options.state ? options.state : {};

        var sim = simulator(ast, globals);
        // HACK function name currently ignored
        sim.start_function(undefined, args);
        return explainer.create_explanations(sim.run_all(state));
    };

    return self;
}());
