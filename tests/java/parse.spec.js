
describe('java parsing', function() {
    var all_test_files = [
        "array01",
        "array02",
        "array03",
        "array04",
        "ifelse01",
        "ifelse02",
        "ifelse03",
        "ifelse04",
        "ifelse05"
    ];

    it("should parse programs", function() {
        function check(file) {
            var ast = java_parser_test_util.parse_program(file);
            expect(typeof ast).toEqual("object");
        }

        all_test_files.forEach(check);
    });

    it("should parse expressions", function() {
        function check(source, tag) {
            var ast = java_parsing.parse_expression(source);
            expect(typeof ast).toEqual("object");
            expect(ast.tag).toEqual(tag);
        }

        check("x", "identifier");
        check("2", "literal");
        check('2 + 3 + "asdf"', "binop");
    });

    it("should type literals", function() {
        function check(source, type) {
            var ast = java_parsing.parse_expression(source);
            expect(typeof ast).toEqual("object");
            expect(ast.tag).toEqual("literal");
            expect(ast.type).toEqual(type);
        }

        check('"x"', "string");
        check("2", "int");
        check('2.0', "double");
    });

    it("should have location info", function() {
        function check(file) {
            var ast = java_parser_test_util.parse_program(file);

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
});

