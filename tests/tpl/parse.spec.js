
/// tests related to the parser, e.g., can it parse every file, is location information embedded.
describe('TPL parsing', function() {
    var all_test_files = [
        "feat-add",
        "feat-annotations",
        "feat-assignment",
        "feat-break",
        "feat-dowhile",
        "feat-foreach",
        "feat-if",
        "feat-parameters",
        "feat-types",
        "feat-reference",
        "feat-while",
        "solve-binop",
    ];

    var all_algo_files = [
        "expressions"
    ];

    it("should parse programs", function() {
        function check(ast) {
            expect(typeof ast).toEqual("object");
        }

        all_test_files.forEach(function(file) {
            check(tpl_test_util.parse(file));
        });

        all_algo_files.forEach(function(file) {
            check(tpl_test_util.parse(file, "base/public/js/tpl/algorithms/", ".tpl.txt"));
        });
    });

    it("should have location info", function() {
        function check(ast) {
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

        all_test_files.forEach(function(file) {
            check(tpl_test_util.parse(file));
        });

        all_algo_files.forEach(function(file) {
            check(tpl_test_util.parse(file, "base/public/js/tpl/algorithms/", ".tpl.txt"));
        });
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

    it("should have types", function() {
        var ast = tpl_test_util.parse("feat-types");
        expect(ast.body[0].tag).toEqual('declaration');
        expect(ast.body[0].type).toEqual('foo');
        expect(ast.body[1].tag).toEqual('declaration');
        expect(ast.body[1].type).toEqual('bar');
        expect(ast.body[2].tag).toEqual('declaration');
        expect(ast.body[2].type).toEqual(undefined);
    });
});

