
QUnit.test("solve-simple-do-while", function (assert) {
    var finish = {x:30};
    var states = test_util.run("solve-dowhile");
    assert.deepEqual(last(states).state, finish);
});
