
QUnit.test("solve-simple-do-while", function (assert) {
    var start = {};
    var finish = {x:30};
    var states = test_util.getStates("solve-dowhile", start);
    console.log(states.map(function(s){return s.statement;}));
    assert.equal(states.length, 11);
    assert.deepEqual(last(states).state, finish);
});
