
QUnit.test("solve-binop-int-div", function (assert) {
    var start = {
        left: 10,
        right: 5,
        op: "/",
        //prompt: "",
    };
    var finish = {
        left: 10,
        right: 5,
        op: "/",
        //prompt: "result is 2",
        result: 2,
    };
    var states = test_util.getStates("solve-binop", start, {eval:eval});
    assert.equal(states.length, 6); // 5 non-declaration lines + 1 start
    assert.deepEqual(states[states.length - 1].state, finish);
});

QUnit.test("solve-binop-float-mult", function (assert) {
    var start = {
        left: 3.5,
        right: 1.5,
        op: "*",
        //prompt: "",
    };
    var finish = {
        left: 3.5,
        right: 1.5,
        op: "*",
        //prompt: "result is 5.25",
        result: 5.25,
    };
    var states = test_util.getStates("solve-binop", start, {eval:eval});
    assert.equal(states.length, 6); // 5 non-declaration lines + 1 start
    assert.deepEqual(states[states.length - 1].state, finish);
});

QUnit.test("solve-binop-lt", function (assert) {
    var start = {
        left: 10,
        right: 5,
        op: "<",
        //prompt: "",
    };
    var finish = {
        left: 10,
        right: 5,
        op: "<",
        //prompt: "result is false",
        result: false,
    };
    var states = test_util.getStates("solve-binop", start, {eval:eval});
    assert.equal(states.length, 6); // 5 non-declaration lines + 1 start
    assert.deepEqual(states[states.length - 1].state, finish);
});

QUnit.test("solve-binop-ne", function (assert) {
    var start = {
        left: 10,
        right: 5,
        op: "!=",
        //prompt: "",
    };
    var finish = {
        left: 10,
        right: 5,
        op: "!=",
        //prompt: "result is true",
        result: true,
    };
    var states = test_util.getStates("solve-binop", start, {eval:eval});
    assert.equal(states.length, 6); // 5 non-declaration lines + 1 start
    assert.deepEqual(states[states.length - 1].state, finish);
});
