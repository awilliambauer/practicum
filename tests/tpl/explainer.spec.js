
/// Test of prompts produced by the explainer
describe('explainer prompts', function () {
    it("binop while conditions", function () {
        var algo = "function f() {\
                        let x; x = 0;\
                        while(x<5){ \
                            x = x + 1;\
                        }\
                    }";
        var data = tpl_test_util.run2(simulator_parsing.browser_parse(algo), {state:{x:0}});
        var prompts = data.map(function(d) { return d.prompt; });
        //console.log(prompts);
    })
});
