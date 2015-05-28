
QUnit.test("solve-simple-do-while", function (assert) {
    var finish = {x:3, y:6};
    var states = test_util.run("solve-parameters", {args:[3,4]});
    assert.deepEqual(last(states).state, finish);
});

