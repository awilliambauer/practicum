
/// Tests related to testing individual language features, e.g., loops.
describe('TPL language features', function() {
    function check(fname, finish, start) {
        var states = tpl_test_util.run(fname, start ? {state:start} : undefined);
        expect(last(states).state).toEqual(finish);
    }

    it("should have references", function() {
        var start = {
            b: {},
            c: {a:"bar"},
            d: ["foo"]
        };
        var finish = {
            a: 1,
            b: {a: "foo"},
            c: {a:"bar"},
            d: ["barbar"],
        };
        check('feat-reference', finish, start);
    });

    it("should have if", function() {
        var start1 = {
            branch: 0
        };
        var finish1 = {
            branch: 0,
            result: 0
        };

        var start2 = {
            branch: 1
        };
        var finish2 = {
            branch: 1,
            result: 1
        };

        var start3 = {
            branch: 2
        };
        var finish3 = {
            branch: 2,
            result: 2
        };

        check("feat-if", finish1, start1);
        check("feat-if", finish2, start2);
        check("feat-if", finish3, start3);
    });

    it("should have while", function() {
        var finish = {x:30};
        check("feat-while", finish);
    });

    it("should have do-while", function() {
        var finish = {x:30};
        check("feat-dowhile", finish);
    });

    it("should have break", function() {
        var start = {i:0,s:0,arr:[0,0,0,0,0,10]};
        var finish = {i:3,s:5,arr:[1,2,2,0,0,10]};
        check("feat-break", finish, start);
    });

    it("should have for-each", function() {
        var start = {
            array:[1,2,3,4],
        };
        var finish = {
            array:[1,2,3,4],
            sum:10,
        };
        check("feat-foreach", finish, start);
    });

    it("should have parameters", function() {
        var finish = {x:3, y:6};
        var states = tpl_test_util.run("feat-parameters", {args:[3,4]});
        expect(last(states).state).toEqual(finish);
    });

    describe('annotations', function() {
        it("should have annotations", function() {
            var out = tpl_test_util.run("feat-annotations");
        });
    });
});
