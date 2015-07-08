QUnit.test("solve-simple-while", function (assert) {
    var finish = {x:30};
    var states = test_util.run("solve-while");
    assert.deepEqual(last(states).state, finish);
});