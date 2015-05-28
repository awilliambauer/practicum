
QUnit.test("solve-simple-do-while", function (assert) {
    var finish = {x:30};
    var states = test_util.run("solve-dowhile");
    assert.equal(states.length, 11);
    assert.deepEqual(last(states).state, finish);
});
