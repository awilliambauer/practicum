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
        prompt: "d's 0 element is barbar",
        done: true
    };
    var states = test_util.getStates("solve-use-references", start);
    assert.equal(states.length, 8);
    //console.log(states[states.length - 1]);
    assert.deepEqual(states[states.length - 1], finish);
});
