QUnit.test("use-if-firstbranch", function (assert) {
    var start = {
        branch: 0
    };
    var finish = {
        branch: 0,
        result: 0,
        prompt: "result is 0",
        done: true
    };
    var states = test_util.getStates("solve-use-if", start);
    assert.deepEqual(states[states.length - 1], finish);
});
