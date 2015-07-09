
QUnit.test("java parsing", function (assert) {
    function check(file) {
        var ast = java_parser_test_util.parse(file);
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

