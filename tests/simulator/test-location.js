
function check_locations(assert, file) {
    var ast = test_util.parse(file);

    // ensure ever ast node has a location object.
    function check_node(node) {
        assert.equal(typeof node.location, "object");
        assert.equal(typeof node.location.start, "object");
        assert.equal(typeof node.location.start.line, "number");
        assert.equal(typeof node.location.start.col, "number");
        assert.equal(typeof node.location.end, "object");
        assert.equal(typeof node.location.end.line, "number");
        assert.equal(typeof node.location.end.col, "number");

        for (var key in node) {
            var val = node[key];
            if (key !== 'location' && val) {
                if (Array.isArray(val)) {
                    val.forEach(check_node);
                } else if (typeof val === 'object') {
                    check_node(val);
                }
            }
        }
    }

    check_node(ast);
}

QUnit.test("solve-location-info", function (assert) {
    // TODO this should really load _every_ test file, even new ones, raher than a hard-coded list.
    check_locations(assert, "solve-dowhile");
    check_locations(assert, "solve-use-if");
    check_locations(assert, "solve-use-references");
    check_locations(assert, "solve-break");
    check_locations(assert, "solve-annotations");
});
