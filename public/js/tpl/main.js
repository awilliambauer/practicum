var main_simulator = (function () {"use strict";
    var self = {};
    var states;
    var currentState;
    var waitingForUserResponse;

    self.getHelper = function(algoName) {
        if (algoName == "expressions") {
            return new ExpressionsHelper();
        }
        else if (algoName == "if_else") {
            return new IfElseHelper();
        }
    };

    self.parse = function(algoName) {
        return fetch("js/tpl/algorithms/" + algoName + ".tpl.txt").then(function(response) {
            if (response.status === 200) {
                return response.text().then(function(source) {
                    return simulator_parsing.browser_parse(source);
                });

            } else {
                throw new Error(response.status + ' ' + response.statusText);
            }
        });
    };

    self.initialize = function(algo, options) {
        options = options ? options : {};
        var args = options.args ? options.args : [];
        var state = options.state ? options.state : {};
        var waitingForUserResponse = false;

        var globals = {
            helper: self.getHelper(algo)
        }

        return self.parse(algo).then(function(ast) {
            var sim = simulator(ast, globals);
            // HACK function name currently ignored
            sim.start_function(undefined, args);
            states = explainer.create_explanations(sim.run_all(state));
            currentState = -1;
        });

    };

    self.next = function(fadeLevel) {
        switch (fadeLevel) {
            case 0:
                return self.getNextState();
                break;
            case 1:
                return self.getNextStateWithInteractivity();
                break;
        }
    };

    // returns the next state in the states array
    self.getNextState = function() {
        if (currentState + 1 < states.length) {
            currentState = currentState + 1;
            return states[currentState];
        }
        return states[states.length - 1];
    };

    // returns a state that asks the user to respond
    self.getNextStateWithInteractivity = function() {
        if (waitingForUserResponse) {
            console.log("waiting for user response!");
        }
        else if (currentState + 1 < states.length) {
            if (states[currentState + 1].annotations.hasOwnProperty("interactive")) {
                // the next step is interactive. we don't want to show the user the answer in the
                // next state yet, so we're going to continue showing them the current state, but
                // send the UI a note that it should ask for a user response here
                var returnState = self.copy(states[currentState]);
                returnState.prompt = self.getInteractivePrompt(states[currentState + 1].prompt);
                returnState.askForResponse = {};
                waitingForUserResponse = true;
                return returnState;
            }
            else {
                currentState = currentState + 1;
                return states[currentState];
            }
        }
        return states[states.length - 1];
    };

    // checks whether or not the user's answer was correct. checks whether statement_result.rhs
    // has the answer passed in as a parameter stored at the property passed in as a parameter
    // returns a state object that the UI should display in response to the answer check
    self.checkAnswer = function(answer, property) {
        if (!waitingForUserResponse) {
            console.error("Called checkAnswer, but the simulator wasn't waiting for an answer");
        }
        else {
            var correctAnswer = states[currentState + 1].statement_result.rhs[property];
            console.log("answers:");
            console.log(answer);
            console.log(correctAnswer);
            if (JSON.stringify(answer) === JSON.stringify(correctAnswer)) {
                currentState = currentState + 1;
                waitingForUserResponse = false;
                var returnState = self.copy(states[currentState])
                returnState.prompt = "Great job! That is correct."
                return returnState;
            }
            else {
                var returnState = self.copy(states[currentState]);
                returnState.prompt = "Sorry, that is not correct. Try again!<br>" + self.getInteractivePrompt(states[currentState + 1].prompt);
                returnState.askForResponse = {};
                return returnState;
            }
        }
    };

    self.copy = function(obj) {
        // copy state by sending it to JSON and back; it's easy, and it'll also
        // catch bugs where the state illegally contains non-json.
        return JSON.parse(JSON.stringify(obj));
    };

    // for now, change "this is" to "click on" for interactive prompts. not sure yet
    // how general this is, so we may need to change this to something less hacky
    self.getInteractivePrompt = function(prompt) {
        if (prompt.indexOf("This is ") != -1) {
            prompt = "Click on " + prompt.substring(prompt.indexOf("This is ") + 8);
        }
        return prompt;
    }

    return self;
}());
