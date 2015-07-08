
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

QUnit.test("parse-annotations", function(assert) {
    var ast = test_util.parse("solve-annotations");
    assert.equal(ast.body[1].annotations.length, 1);
    assert.equal(ast.body[1].annotations[0].name, "ImAnAnnotation");
    assert.equal(ast.body[2].annotations.length, 1);
    assert.equal(ast.body[2].annotations[0].name, "ImAnotherAnnotation");
    assert.equal(ast.body[2].then_branch[0].annotations.length, 2);
    assert.equal(ast.body[2].then_branch[0].annotations[0].name, "ImANestedAnnotation");
    assert.equal(ast.body[2].then_branch[0].annotations[1].name, "AndLookASecond");
});

