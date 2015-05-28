
QUnit.test("solve-simple-for-each", function (assert) {
    var start = {
        array:[1,2,3,4],
    };
    var finish = {
        array:[1,2,3,4],
        sum:10,
    };
    var states = test_util.getStates("solve-foreach", start);
    assert.deepEqual(last(states).state, finish);
});

