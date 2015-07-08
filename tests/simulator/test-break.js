
QUnit.test("solve-break", function (assert) {
    var start = {i:0,s:0,arr:[0,0,0,0,0,10]};
    var finish = {i:3,s:5,arr:[1,2,2,0,0,10]};
    var states = test_util.run("solve-break", {state:start});
    assert.deepEqual(last(states).state, finish);
});
