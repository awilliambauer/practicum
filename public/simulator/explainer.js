var explainer = (function() {
    "use strict";

    var self = {};

    self.should_be_explained = function(sim_result) {
        if (!sim_result.statement) return true;
        else switch (sim_result.statement.tag) {
            case 'declaration': return false;
            default: return true;
        }
    };

    function format_identifier(id) {
        return id.replace("_", " ");
    }

    self.explanation_text_of = function(sim_result) {
        var stmt = sim_result.statement;
        var sr = sim_result.statement_result;
        if (!stmt) return "";
        var cs = sim_result.call_stack[sim_result.call_stack.length - 1];

        switch(stmt.tag) {
            case "function":
                return "Let's start";
            case "assignment":
                if (stmt.destination.tag === "index") {
                    return format_identifier(sr.name) + "'s " + sr.index + " element is " + sr.rhs;
                }
                return format_identifier(sr.name) + " is " + sr.rhs;
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
    };

    self.create_explanations = function(results) {
        return results.filter(self.should_be_explained).map(function(r) {
            r.prompt = self.explanation_text_of(r);
            return r;
        });
    };

    return self;
}());


