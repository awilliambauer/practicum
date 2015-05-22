var explainer = (function() {
    "use strict";

    var self = {};

    self.should_be_explained = function(sim_result) {
        if (!sim_result.statement) return true;
        else switch (sim_result.statement.tag) {
            case 'declaration': return false;
            default: return true;
        }
    }

    self.explanation_text_of = function(sim_result) {
        var stmt = sim_result.stmt;
        if (!stmt) return "";
        var cs = sim_result.call_stack[sim_result.call_stack.length - 1];

        switch(stmt.tag) {
            case "function":
                return "Let's start";
            case "expression":
                // FIXME
                return "asdfasdfasdf";
            case "if":
                if (cs.marker === 'then') {
                    return "Condition is true, take the then branch";
                } else {
                    return "Condition is false, take the else branch";
                }
            default:
                return "";
        }
    }

    self.create_explanations = function(results) {
        return results.filter(self.should_be_explained).map(function(r) {
            r.prompt = self.explanation_text_of(r);
            return r;
        });
    }

    return self;
}());


