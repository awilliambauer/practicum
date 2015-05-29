QUnit.test("use-if-firstbranch", function (assert) {
    var start = {
        branch: 0
    };
    var finish = {
        branch: 0,
        result: 0,
    };
    var states = test_util.run("solve-use-if", {state:start});
    assert.deepEqual(states[states.length - 1].state, finish);
    assert.equal(states[states.length - 1].prompt, "result is 0");
});

QUnit.test("use-if-secondbranch", function (assert) {
    var start = {
        branch: 1
    };
    var finish = {
        branch: 1,
        result: 1,
    };
    var states = test_util.run("solve-use-if", {state:start});
    assert.deepEqual(states[states.length - 1].state, finish);
    assert.equal(states[states.length - 1].prompt, "result is 1");
});

QUnit.test("use-if-thirdbranch", function (assert) {
    var start = {
        branch: 2
    };
    var finish = {
        branch: 2,
        result: 2,
    };
    var states = test_util.run("solve-use-if", {state:start});
    assert.deepEqual(states[states.length - 1].state, finish);
    assert.equal(states[states.length - 1].prompt, "result is 2");
});
