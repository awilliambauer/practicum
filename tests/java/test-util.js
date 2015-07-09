var java_parser_test_util = (function () {"use strict";
    var self = {};

    self.load = function(name) {
        var algoFile = new XMLHttpRequest();
        var source;
        algoFile.open("GET", "base/tests/java/"+name+".java", false);
        algoFile.onreadystatechange = function () {
            source = algoFile.responseText;
        };
        algoFile.send(null);
        return source;
    }

    self.parse_program = function(name) {
        return java_parsing.parse_program(self.load(name));
    };

    self.parse_expression = function(name) {
        return java_parsing.parse_expression(self.load(name));
    };

    return self;
}());
