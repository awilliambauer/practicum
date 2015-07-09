
var all_test_files = [
    "array01",
    "array02",
    "array03",
    "array04",
    "ifelse01",
    "ifelse02",
    "ifelse03",
    "ifelse04",
    "ifelse05"
];

QUnit.test("java program parsing", function (assert) {
    function check(file) {
        var ast = java_parser_test_util.parse_program(file);
        assert.equal(typeof ast, "object");
    }

    all_test_files.forEach(check);
});

QUnit.test("java expression parsing", function (assert) {
    function check(source, tag) {
        var ast = java_parsing.parse_expression(source);
        assert.equal(typeof ast, "object");
        assert.equal(ast.tag, tag);
    }

    check("x", "identifier");
    check("2", "literal");
    check('2 + 3 + "asdf"', "binop");
});

QUnit.test("java literals", function (assert) {
    function check(source, type) {
        var ast = java_parsing.parse_expression(source);
        assert.equal(typeof ast, "object");
        assert.equal(ast.tag, "literal");
        assert.equal(ast.type, type);
    }

    check('"x"', "string");
    check("2", "int");
    check('2.0', "double");
});

QUnit.test("java location info", function (assert) {
    function check(file) {
        var ast = java_parser_test_util.parse_program(file);

        // ensure ever ast node has a location object.
        function check_node(node) {
            assert.equal(typeof node.location, "object");
            assert.equal(typeof node.location.start, "object");
            assert.equal(typeof node.location.start.line, "number");
            assert.equal(typeof node.location.start.col, "number");
            assert.equal(typeof node.location.end, "object");
            assert.equal(typeof node.location.end.line, "number");
            assert.equal(typeof node.location.end.col, "number");

            for (var key in node) {
                var val = node[key];
                if (key !== 'location' && val) {
                    if (Array.isArray(val)) {
                        val.forEach(check_node);
                    } else if (typeof val === 'object') {
                        check_node(val);
                    }
                }
            }
        }

        check_node(ast);
    }

    all_test_files.forEach(check);
});

