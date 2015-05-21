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

QUnit.test("use-if-secondbranch", function (assert) {
    var start = {
        branch: 1
    };
    var finish = {
        branch: 1,
        result: 1,
        prompt: "result is 1",
        done: true
    };
    var states = test_util.getStates("solve-use-if", start);
    assert.deepEqual(states[states.length - 1], finish);
});

QUnit.test("use-if-thirdbranch", function (assert) {
    var start = {
        branch: 2
    };
    var finish = {
        branch: 2,
        result: 2,
        prompt: "result is 2",
        done: true
    };
    var states = test_util.getStates("solve-use-if", start);
    assert.deepEqual(states[states.length - 1], finish);
});
