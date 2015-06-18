
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
        result: 2,
    };
    var states = test_util.run("solve-binop", {state:start, globals:{eval:eval}});
    assert.equal(states.length, 5); // 5 non-declaration lines
    assert.deepEqual(states[states.length - 1].state, finish);
    assert.equal(states[states.length - 1].prompt, "result is 2");
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
        result: 5.25,
    };
    var states = test_util.run("solve-binop", {state:start, globals:{eval:eval}});
    assert.equal(states.length, 5); // 5 non-declaration lines
    assert.deepEqual(states[states.length - 1].state, finish);
    assert.equal(states[states.length - 1].prompt, "result is 5.25");
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
        result: false,
    };
    var states = test_util.run("solve-binop", {state:start, globals:{eval:eval}});
    assert.equal(states.length, 5); // 5 non-declaration lines
    assert.deepEqual(states[states.length - 1].state, finish);
    assert.equal(states[states.length - 1].prompt, "result is false");
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
        result: true,
    };
    var states = test_util.run("solve-binop", {state:start, globals:{eval:eval}});
    assert.equal(states.length, 5); // 5 non-declaration lines
    assert.deepEqual(states[states.length - 1].state, finish);
    assert.equal(states[states.length - 1].prompt, "result is true");
});
