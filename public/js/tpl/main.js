var main_simulator = (function () {"use strict";
    var self = {};
    var states;
    var currentState;
    var waitingForUserResponse;
    var numTries;

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

        var globals = {
            helper: self.getHelper(algo)
        }

        d3.text("js/tpl/algorithms/" + algo + ".tpl.txt", function(error, algoText) {
            if (error) return console.error(error);
            var ast = simulator_parsing.browser_parse(algoText);
            var sim = simulator(ast, globals);
            // HACK function name currently ignored
            sim.start_function(undefined, args);
            states = explainer.create_explanations(sim.run_all(state));
            waitingForUserResponse = false;
            numTries = 0;

            // the UIs call "next" to get the first state, so we start at -1
            // to indicate that the UI hasn't displayed the first state yet
            currentState = -1;
        });


        //return self.parse(algo).then(function(ast) {
        //    var sim = simulator(ast, globals);
        //    // HACK function name currently ignored
        //    sim.start_function(undefined, args);
        //    states = explainer.create_explanations(sim.run_all(state));
        //    currentState = -1;
        //});
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
                var stateToShow = currentState + 1;
                if (states[currentState + 1].annotations.interactive[0] === "click") {
                    stateToShow = currentState;
                }
                var returnState = self.copy(states[stateToShow]);
                returnState.prompt = self.getInteractivePrompt(states[currentState + 1].prompt, states[currentState + 1].annotations.interactive);
                returnState.askForResponse = states[currentState + 1].annotations["interactive"][0];
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

    // return the statemet_result object so that the UI can check the correct answer against
    // the answer and determine whether or not the user answer was correct
    self.getCorrectAnswer = function() {
        if (!waitingForUserResponse) {
            console.error("Called getCorrectAnswer, but the simulator wasn't waiting for an answer");
        }
        else {
            return states[currentState + 1].statement_result;
        }
    }

    // respond to a user answer, based on whether or not the answer was correct
    self.respondToAnswer = function(correct) {
        numTries = numTries + 1;
        var returnState
        if (!waitingForUserResponse) {
            console.error("Called respondToAnswer, but the simulator wasn't waiting for an answer");
        }
        else if (correct) {
            numTries = 0;
            currentState = currentState + 1;
            waitingForUserResponse = false;
            returnState = self.copy(states[currentState])
            returnState.prompt = "Great job! That is correct."
            return returnState;
        }
        else if (!correct && numTries < 3) {
            var stateToShow = currentState + 1;
            if (states[currentState + 1].annotations.interactive[0] === "click") {
                stateToShow = currentState;
            }
            returnState = self.copy(states[stateToShow]);
            if (numTries == 1) {
                returnState.prompt = "Sorry, that is not correct. Try again!<br>";
            }
            else {
                returnState.prompt = "Sorry, that is not correct. Try one more time!<br>";
            }
            returnState.prompt += self.getInteractivePrompt(states[currentState + 1].prompt, states[currentState + 1].annotations.interactive);
            returnState.askForResponse = states[currentState + 1].annotations["interactive"][0];
            return returnState;
        }
        else {
            numTries = 0;
            currentState = currentState + 1;
            waitingForUserResponse = false;
            returnState = self.copy(states[currentState])
            returnState.prompt = "Sorry, that is not correct."
            return returnState;
        }
    }

    self.getFinalState = function() {
        return states[states.length - 1];
    }

    self.copy = function(obj) {
        // copy state by sending it to JSON and back; it's easy, and it'll also
        // catch bugs where the state illegally contains non-json.
        return JSON.parse(JSON.stringify(obj));
    };


    self.getInteractivePrompt = function(prompt, type) {
        // for now, change "this is" to "click on" for interactive prompts. not sure yet
        // how general this is, so we may need to change this to something less hacky
        if (type == "click" &&prompt.indexOf("This is ") != -1) {
            prompt = "Click on " + prompt.substring(prompt.indexOf("This is ") + 8);
        }
        else if (type == "enter" &&prompt.indexOf("This is ") != -1) {
            prompt = "Enter " + prompt.substring(prompt.indexOf("This is ") + 8);
        }
        // for now, remove any answer after the question mark if it's interactive
        if (prompt.indexOf("?") != -1) {
            prompt = prompt.substring(0, prompt.indexOf("?") + 1);
        }
        return prompt;
    }

    return self;
}());
