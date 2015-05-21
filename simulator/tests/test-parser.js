
QUnit.test("parse-reference", function(assert) {
    var ast = test_util.parse("solve-references");
    assert.equal(ast.tag, 'function');
    // make sure . left-associates
    assert.equal(ast.body[0].expression.object.name, 'c');
});

QUnit.test("parse-add", function(assert) {
    var ast = test_util.parse("solve-add");
    assert.equal(ast.tag, 'function');
    // make sure + left-associates
    assert.equal(ast.body[0].expression.args[1].value, 3);
});

