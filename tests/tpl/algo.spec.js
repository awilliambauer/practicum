
/// Test simulation of actual TPL algorithms
describe('TPL algorithms', function() {
    function parse(name) {
        return tpl_test_util.parse(name, "base/public/js/tpl/algorithms/");
    }

    function run(name, options) {
        return last(tpl_test_util.run2(parse(name), options));
    }


    describe("run expressions", function() {
        function check(problem, answer) {
            var start = expressions_make_initial_state({content: problem});
            var out = run("expressions", {state:start, globals: {helper: new ExpressionsHelper()}});
            expect(last(out.state.problemLines)[0]).toEqual(answer);
        }

        it("1", function(){
            check("7", {value:7, type:"int"});
        });
        it("2", function(){
            check('"7"', {value:'7', type:"string"});
        });
        it("3", function(){
            check("22 % 7 + 4 * 3 - 6.0 / 2.0", {value:10, type:"double"});
        });
        it("4", function(){
            check('"hello" + 6 * 3', {value:'hello18', type:"string"});
        });
        it("5", function(){
            check('4.0 + "CSE142" + 143', {value:'4.0CSE142143', type:"string"});
        });
    });
});

