QUnit.test("use-references", function (assert) {
    var start = {
        b: {},
        c: {a:"bar"},
        d: ["foo"]
    };
    var finish = {
        a: 1,
        b: {a: "foo"},
        c: {a:"bar"},
        d: ["barbar"],
    };
    var states = test_util.run("solve-use-references", {state:start});
    assert.equal(states.length, 6);
    assert.deepEqual(states[states.length - 1].state, finish);
    assert.equal(states[states.length - 1].prompt, "d's 0 element is barbar");
});
