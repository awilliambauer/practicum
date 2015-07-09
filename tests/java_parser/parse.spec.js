
QUnit.test("java program parsing", function (assert) {
    function check(file) {
        var ast = java_parser_test_util.parse_program(file);
        assert.equal(typeof ast, "object");
    }

    check("array01");
    check("array02");
    check("array03");
    check("array04");
    check("ifelse01");
    check("ifelse02");
    check("ifelse03");
    check("ifelse04");
    check("ifelse05");
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
