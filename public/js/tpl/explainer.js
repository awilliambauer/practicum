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

    // convert camel case to nice text
    function format_identifier(id) {
        var words = id.split(/(?=[A-Z])/);
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1); // capitalize first letter of first word
        for (var i = 1; i < words.length; i++) {
            words[i] = words[i].toLowerCase(); // remove initial capital from other words
        }
        return words.join(" ");
    }

    self.explanation_text_of = function(sim_result) {
        var stmt = sim_result.statement;
        var sr = sim_result.statement_result;
        var annotations = sim_result.annotations;
        if (!stmt) return "";
        var cs = sim_result.call_stack[sim_result.call_stack.length - 1];

        // a non-empty prompt annotation overrides explanation
        if (annotations.hasOwnProperty("prompt") && annotations.prompt.length > 0) {
            if (annotations.prompt.length === 1) { // we expect a single expression as the argument
                return annotations.prompt[0];
            } else { // invalid use of prompt
                throw new Error("prompt annotation expects 0 or 1 arguments, " +
                                annotations.prompt + " were given");
            }
        }

        switch(stmt.tag) {
            case "function":
                return "Let's start";
            case "assignment":
                if (stmt.destination.tag === "index") {
                    return format_identifier(sr.name) + "'s " + sr.index + " element is " + sr.rhs;
                }
                // in expression thought process, we always ignore the right side when making the prompt
                return format_identifier(sr.name);
            case "expression":
                // empty prompt means use value of expression as prompt
                if (annotations.hasOwnProperty("prompt")) {
                    return sr.result;
                }
                return "";
            case "if":
                if (cs.marker === 'then') {
                    return "Condition is true, take the then branch";
                } else {
                    return "Condition is false, take the else branch";
                }
            case "while":
            case "while:condition":
                var prompt = format_identifier(sr.name) + "? ";
                if (sr.result) {
                    prompt += "Yes.";
                } else {
                    prompt += "No.";
                }
                return prompt;
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


