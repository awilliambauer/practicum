var java_parser_test_util = (function () {"use strict";
    var self = {};

    self.parse = function(algoName) {
        var algoFile = new XMLHttpRequest();
        var source;
        algoFile.open("GET", "base/tests/java_parser/"+algoName+".java", false);
        algoFile.onreadystatechange = function () {
            source = algoFile.responseText;
        };
        algoFile.send(null);
        return java_parsing.browser_parse(source);
    };

    return self;
}());
