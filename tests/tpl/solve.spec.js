
/// Tests for slightly more complex TPL functions.
describe('TPL language features', function() {
    function check(fname, globals, finish, start) {
        var states = tpl_test_util.run(fname, {state:start, globals:globals});
        expect(last(states).state).toEqual(finish);
    }

    it("should should solve binop int div", function() {
        var start = {
            left: 10,
            right: 5,
            op: "/",
        };
        var finish = {
            left: 10,
            right: 5,
            op: "/",
            result: 2,
        };
        check("solve-binop", {eval:eval}, finish, start);
    });

    it("should should solve binop float mult", function() {
        var start = {
            left: 3.5,
            right: 1.5,
            op: "*",
        };
        var finish = {
            left: 3.5,
            right: 1.5,
            op: "*",
            result: 5.25,
        };
        check("solve-binop", {eval:eval}, finish, start);
    });

    it("should should solve binop lt", function() {
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
        check("solve-binop", {eval:eval}, finish, start);
    });

    it("should should solve binop ne", function() {
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
        check("solve-binop", {eval:eval}, finish, start);
    });
});

