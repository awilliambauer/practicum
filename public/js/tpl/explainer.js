var explainer = (function() {
    "use strict";

    var self = {};

    self.should_be_explained = function(sim_result) {
        if (!sim_result.statement || sim_result.annotations.hasOwnProperty("no_step")) {
            return false;
        } else if (!sim_result.statement) {
            return false;
        } else {
            switch (sim_result.statement.tag) {
                case 'declaration':
                case 'dowhile': // skip over the do (condition checks will be dowhile:condition)
                case 'break': // for now we never explain breaks, so this removes the need to annotate each one
                    return false;
                default: return true;
            }
        }
    };

    // convert camel case to nice text
    function format_identifier(id) {
        if (id.indexOf('_') >= 0) {
            // assume underscored
            var s = id.replace(/_/g, ' ');
            return s.charAt(0).toUpperCase() + s.slice(1);
        } else {
            // assume camel-case
            var words = id.split(/(?=[A-Z])/);
            words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1); // capitalize first letter of first word
            for (var i = 1; i < words.length; i++) {
                words[i] = words[i].toLowerCase(); // remove initial capital from other words
            }
            return words.join(" ");
        }
    }

    self.explanation_text_of = function(sim_result) {
        var stmt = sim_result.statement;
        var sr = sim_result.statement_result;
        var annotations = sim_result.annotations;
        var cs = sim_result.call_stack[sim_result.call_stack.length - 1];
        var prompt = "";

        // a non-empty prompt annotation overrides explanation
        if (annotations.hasOwnProperty("prompt") && annotations.prompt.length > 0) {
            prompt = annotations.prompt.join(" ");
        } else {
            switch (stmt.tag) {
                case "function":
                    prompt = "Let's start";
                    break;
                case "assignment":
                    if (stmt.destination.tag === "index") {
                        prompt = format_identifier(sr.name) + "'s " + sr.index + " element is " + sr.rhs;
                    }
                    // in expression thought process, we always ignore the right side when making the prompt
                    prompt = format_identifier(sr.name);
                    break;
                case "expression":
                    // empty prompt means use value of expression as prompt
                    if (annotations.hasOwnProperty("prompt")) {
                        prompt = sr.result;
                    } else if (annotations.hasOwnProperty("question_answer")) {
                        prompt = format_identifier(sr.name);
                    } else {
                        prompt = format_identifier(sr.name);
                    }
                    break;
                case "if":
                    prompt = "Is this condition true? ";
                    // if we're calling a helper function in the conditional, use the function name as the prompt
                    if (stmt.condition.hasOwnProperty("object") && stmt.condition.object.hasOwnProperty("name")) {
                        prompt = format_identifier(stmt.condition.object.name) + "? ";
                    }
                    if (cs.marker === 'then') {
                        prompt += "Yes."
                    } else {
                        prompt += "No.";
                    }
                    break;
                case "while":
                case "while:condition":
                case "dowhile:condition":
                    var p = format_identifier(sr.name) + "? ";
                    if (sr.result) {
                        p += "Yes.";
                    } else {
                        p += "No.";
                    }
                    prompt = p;
                    break;
                case "foreach":
                    prompt = "Loop over " + format_identifier(sr.name);
                    break;
                case "foreach:increment":
                    prompt = format_identifier(stmt.parent.variable);
                    break;
                default:
                    prompt = "";
                    break;
            }
        }
        if (annotations.hasOwnProperty("add_to_prompt")) {
            prompt += " " + annotations.add_to_prompt.join(" ");
        }
        if (annotations.hasOwnProperty("question_answer")) {
            prompt += "? " + sr.result;
        }
        //var punc = ".?!";
        //if (punc.indexOf(prompt.charAt(prompt.length - 1)) === -1) {
        //    prompt += '.';
        //}
        return prompt;
    };

    self.create_explanations = function(results) {
        var ret = results.filter(self.should_be_explained).map(function(r) {
            r.prompt = self.explanation_text_of(r);
            return r;
        });
        return ret;
    };

    return self;
}());


