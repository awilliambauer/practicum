
/// tests related to the parser, e.g., can it parse every file, is location information embedded.
describe('TPL parsing', function() {
    var all_test_files = [
        "feat-break"
    ];

    it("should parse programs", function() {
        function check(file) {
            var ast = tpl_test_util.parse(file);
            expect(typeof ast).toEqual("object");
        }

        all_test_files.forEach(check);
    });

    it("should have location info", function() {
        function check(file) {
            var ast = tpl_test_util.parse(file);

            // ensure ever ast node has a location object.
            function check_node(node) {
                expect(typeof node.location).toEqual( "object");
                expect(typeof node.location.start).toEqual( "object");
                expect(typeof node.location.start.line).toEqual( "number");
                expect(typeof node.location.start.col).toEqual( "number");
                expect(typeof node.location.end).toEqual( "object");
                expect(typeof node.location.end.line).toEqual( "number");
                expect(typeof node.location.end.col).toEqual( "number");

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

        all_test_files.forEach(check);
    });

    it("should parse annotations", function() {
        var ast = tpl_test_util.parse("feat-annotations");
        expect(ast.body[1].annotations.length).toEqual(1);
        expect(ast.body[1].annotations[0].name).toEqual("ImAnAnnotation");
        expect(ast.body[2].annotations.length).toEqual(1);
        expect(ast.body[2].annotations[0].name).toEqual("ImAnotherAnnotation");
        expect(ast.body[2].then_branch[0].annotations.length).toEqual(2);
        expect(ast.body[2].then_branch[0].annotations[0].name).toEqual("ImANestedAnnotation");
        expect(ast.body[2].then_branch[0].annotations[1].name).toEqual("AndLookASecond");
    });

    it("should left-associate .", function() {
        var ast = tpl_test_util.parse("feat-reference");
        expect(ast.tag).toEqual('function');
        // make sure . left-associates
        expect(ast.body[1].expression.object.name).toEqual('pop');
    });

    it("should left-associate +", function() {
        var ast = tpl_test_util.parse("feat-add");
        expect(ast.tag).toEqual('function');
        // make sure + left-associates
        expect(ast.body[0].expression.args[1].value).toEqual(3);
    });
});

