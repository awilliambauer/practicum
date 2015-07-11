/*
 @authors Arnavi Chheda
 Ashley Donaldson
 Cat Johnson
 Solai Ramanathan
 Eleanor O'Rourke
 Whitaker Brand

 This JS file handles all interactivity and stepping through of expressions problems.

 Exports a variable named expressions, and also installs that variable into the
 'csed' global at csed.expressions
 */
var expressions = (function() {
    // the object that's used to communicate with the simulator
    var callback;

    // the current state object
    var state;

    // whether or not this is the first time the user is clicking the "step" button
    var firstStep = true;


    // Callback function for navigation javascript -- called before problem load.
    var reset = function() {
        firstStep = true;
        currentStateIndex = 0;
        state = {};
    };

    // Callback function for navigation javascript. Installs a problem into the page
    var initialize = function(problemConfig, callbackObject, initial_state) {
        // this code runs the hard-coded array of state objects stored in state_1.js

        /*$.getScript("state_objects/state_1.js", function() {
         currentStateIndex = 0;
         var expressionHeader = document.getElementById("expressionHeader");
         var expression = states[currentStateIndex].problemLines[0];
         expressionHeader.innerHTML = buildExpressionString(expression, []);
         });*/

        // this code runs the thoughtProcess.js file to build up the array of state objects

        callback = callbackObject;
        state = initial_state;

        var expressionHeader = document.getElementById("expressionHeader");
        var expression = state.problemLines[0];
        expressionHeader.innerHTML = buildExpressionString(expression, []);

        //if users attempt to check a submitted answer
        d3.select("#submit").on("click", correct);

        //if users attempt to step through the breakdown of the problem
        d3.select("#nextstep").on("click", step);
        //var next = document.getElementById("nextstep");
        //next.disabled = false;
        //next.onclick = step;

    };

    function step() {
        state = callback.getNextState();

        var stepHolder;
        if (firstStep) {
            document.getElementById("submit").style.visibility = "hidden";
            document.getElementById("nextstep").innerHTML = "Next";

            stepHolder = document.createElement("div");
            stepHolder.setAttribute("id", "steps");
            document.getElementById("stepshell").appendChild(stepHolder);

            firstStep = false;
        }
        else {
            stepHolder = document.getElementById("steps");
            stepHolder.innerHTML = "";
        }

        var initialPrompt = document.createElement("div");
        initialPrompt.classList.add("prompt");
        initialPrompt.innerHTML = "Start by evaluating all the Multiplicative (* / %) operators from left to right. <br /> Then evaluate " +
        "the Additive (+ -) operators from left to right.";

        stepHolder.appendChild(initialPrompt);

        addStepHTML();

    }

    function addStepHTML() {
        var highlighting = getCurrentHighlighting();

        for (var i = 0; i < state.state.problemLines.length; i++) {
            var expression = state.state.problemLines[i];

            var lineHTML = document.createElement("div");
            lineHTML.setAttribute("id", "firststep");
            lineHTML.classList.add("expressionStatement");

            // display the prompt text next to the last line
            if (i == state.state.problemLines.length - 1) {
                var promptText = removeCamelCase(state.prompt);
                var promptHTML = document.createElement("p");
                promptHTML.classList.add("step");
                promptHTML.innerHTML = promptText + "<div>&nbsp;</div>";
                lineHTML.appendChild(promptHTML);
            }

            var expressionHTML = document.createElement("div");
            expressionHTML.classList.add("exp");
            expressionHTML.innerHTML = buildExpressionString(expression, highlighting[i]);
            lineHTML.appendChild(expressionHTML);

            document.getElementById("steps").appendChild(lineHTML);
        }
    }

    // look at the current variables in scope to determine which rows and cells should be highlighted
    function getCurrentHighlighting() {
        var highlighting = [];
        for (var i = 0; i < state.state.problemLines.length; i++) {
            highlighting.push([]);
        }

        for (var variable in state.variables.in_scope) {
            var varObject = state.variables.in_scope[variable];
            if (varObject.hasOwnProperty("value")) {
                var objectToVisualize = varObject["value"];

                if (objectToVisualize.hasOwnProperty("type")) {
                    if (objectToVisualize.type == "lineCell") {
                        highlighting[objectToVisualize.line].push(objectToVisualize.cell);
                    }
                    else {
                        console.error("Unsupported variable type: " + objectToVisualize.type);
                    }
                }
            }
        }

        return highlighting;
    }

    function removeCamelCase(string) {
        // insert a space before all caps
        string = string.replace(/([A-Z])/g, ' $1');
        // uppercase the first character
        string = string.replace(/^./, function(str){ return str.toUpperCase(); });
        return string;
    }

    // create the expression HTML from the array of objects
    function buildExpressionString(expression, highlighting) {
        var expressionString = "";
        for (var i = 0; i < expression.length; i++) {
            if (highlighting.length > 0 && highlighting.indexOf(i) >= 0) {
                if (expression[i].type == "empty"){
                    expressionString += "<span class='empty'>&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;";
                }
                else {
                    expressionString += "<span class='clicked'>" + getExpressionValue(expression, i) + "</span> ";
                }

            }
            else {
                expressionString += getExpressionValue(expression, i) + " ";
            }
        }
        return expressionString;
    }

    // gets the value at a particular index
    // formats it based on int/double/String type
    function getExpressionValue(arr, index) {
        if (arr[index].type == 'double' && arr[index].value % 1 == 0) {
            return arr[index].value + ".0";
        } else if (arr[index].type == 'string') {
            console.log("Get expr val arr  = " + arr + ", idx = " + index);
            return "\"" + arr[index].value + "\"";
        } else {
            return arr[index].value;
        }
    }


    // ################################################################################################
    // OLD CODE
    // ################################################################################################

    // array of problems to choose from; can append new problems
    // to this array (but must also append corresponding answer
    // to end of answers array)
    var problems = [[{type: "int", value: 22},
        {type: "MDMoperator", value: "%"},
        {type: "int", value: 7},
        {type: "ASoperator", value: "+"},
        {type: "int", value: 4},
        {type: "MDMoperator", value: "*"},
        {type: "int", value: 3},
        {type: "ASoperator", value: "-"},
        {type: "double", value: 6.0},
        {type: "MDMoperator", value: "/"},
        {type: "double", value: 2}],

        [{type: "string", value: "hello"},
            {type: "ASoperator", value: "+"},
            {type: "int", value: 6},
            {type: "MDMoperator", value: "*"},
            {type: "int", value: 3}],

        [{type: "double", value: 4.0},
            {type: "ASoperator", value: "+"},
            {type: "string", value: "CSE142"},
            {type: "ASoperator", value: "+"},
            {type: "int", value: 143}]];

    // answers corresponding to array of problems
    var answers = ["10.0", "\"hello18\"", "\"4.0CSE142143\""];

    // starting array
    var startArray;

    // correct final answer
    // used for checking answer that is submitted without
    // showing steps
    var correctAnswer;

    // true - with interactivity, false - without interactivity
    var interaction;

    // boolean that represents whether showing steps has started
    // if not started, then use startArray
    // if started, then use arrays in stateObject
    var started = false;

    // state object
    var stateObject = new Array();


    // on load, shows expression, answer box, submit button, and show steps button
    function oldOnload() {
        var query = window.location.search.substring(1);
        // default values
        interaction = false;
        startArray = problems[0];
        correctAnswer = answers[0];
        //as per user's request, changes the expression problem and state of
        //interactivity
        if (query != "") {
            var queryResults = query.split("+");
            if (queryResults.length > 1 && queryResults[1] == "noninteractive") {
                interaction = false;
            }
            var index = parseInt(queryResults[0]);
            startArray = problems[index - 1];
            correctAnswer = answers[index - 1];
        }
        //sets up the page
        var newHeading = document.getElementById("expressionHeader");
        setupPage(newHeading);
        //if users attempt to check a submitted answer
        document.getElementById("submit").onclick = correct;
        //if users attempt to step through the breakdown of the problem
        var next = document.getElementById("nextstep");
        next.disabled = false;
        if (interaction) {
            //interactive step through
            next.onclick = stepThrough;
        } else {
            //non interactive step through
            next.onclick = walkThrough;
        }
    }

    // This starts the non-interactive solving and explaining process,
    // for right now the person can't try to submit after starting the walkThrough.
    function walkThrough() {
        // gets rid of submit button, changes next button text
        // and creates the steps div to put everything for step through.
        if (!started) {
            document.getElementById("submit").style.visibility = "hidden";
            document.getElementById("nextstep").innerHTML = "Next";
            var newChild = document.createElement("div");
            newChild.setAttribute("id", "steps");
            document.getElementById("stepshell").appendChild(newChild);

            var newChild2 = document.createElement("div");
            newChild2.classList.add("prompt");
            newChild2.innerHTML = "Start by evaluating all the Multiplicative (* / %) operators from left to right. <br /> Then evaluate " +
            "the Additive (+ -) operators from left to right.";
            newChild.appendChild(newChild2);
        }

        // finds and set the indices for the operator, left operand, and right operand
        if (!started || stateObject[stateObject.length - 1][0].length > 1) {
            find();
        }

        // this will prompt the user every time to ask what type
        // of operator the student should start with.
        var firstStep = document.createElement("div");
        firstStep.setAttribute("id", "firststep");
        firstStep.classList.add("expressionStatement");
        //sets up the dual column message-expression interface on the page
        var prompt = document.createElement("p");
        var expressionPrint = document.createElement("div");
        prompt.classList.add("step");
        expressionPrint.classList.add("exp");
        //adds the current state of the expression to the html
        clearIds(expressionPrint);
        //adds message to the page in the left column
        prompt.innerHTML = stateObject[stateObject.length - 1][2].message + "<div>&nbsp;</div>";
        firstStep.appendChild(prompt);
        firstStep.appendChild(expressionPrint);

        document.getElementById("steps").appendChild(firstStep);
        var operators = document.querySelectorAll(".operators");
        //only solves if not at end of expression
        if (stateObject[stateObject.length - 1][0].length > 1) {
            solve();
        } else {
            //if at end of expression solving, hides next button
            document.getElementById("nextstep").classList.add("hiddenSteps");
        }
        document.getElementById("dummy").scrollIntoView();
    }

    // If they submitted an answer (not show steps view),
    // displays if user's answer is correct or not.
    function correct() {
        var clientAnswer = document.getElementById("box");
        var answerPrompt = document.getElementById("correct");
        if (answerPrompt === null) {
            answerPrompt = document.createElement("div");
            answerPrompt.setAttribute("id", "correct");
        }
        if (clientAnswer.value == correctAnswer) {
            answerPrompt.innerHTML = "Correct!";
            document.getElementById("submit").style.visibility = "hidden";
            document.getElementById("nextstep").style.visibility = "hidden";
        } else {
            answerPrompt.innerHTML = "Oops, sorry wrong answer.";
        }
        document.getElementById("answerbox").appendChild(answerPrompt);
    }

    // Display the original expression on load
    function setupPage(newHeading) {
        for (var i = 0; i < startArray.length; i++) {
            newHeading.innerHTML += getValue(i) + " ";
        }
    }

    // Turns expression to a string with spans to help with operator/operand clicking;
    // returns the Stringified expression
    function arrToString() {
        var arrString = "";
        for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
            arrString += "<span id=" + i + ">" + getValue(i) + "</span> ";
        }
        return arrString;
    }

    // This starts the solving process, for right now the person can't try to submit
    // after starting the stepThrough.
    function stepThrough() {
        // gets rid of failed statment if they tried to submit an answer
        if (document.getElementById("correct") !== null) {
            var answerbox = document.getElementById("answerbox");
            answerbox.removeChild(answerbox.lastChild);
        }

        // gets rid of the reply from the last text box inserted.
        var reply = document.getElementById("reply");
        if (reply !== null) {
            document.getElementById("steps").removeChild(reply);
        }

        // gets rid of submit button, changes next button text
        // and creates the steps div to put everything for step through.
        if (!started) {
            document.getElementById("submit").style.visibility = "hidden";
            document.getElementById("nextstep").innerHTML = "Next";
            var newChild = document.createElement("div");
            newChild.setAttribute("id", "steps");
            document.getElementById("stepshell").appendChild(newChild);

            var newChild2 = document.createElement("div");
            newChild2.classList.add("prompt");
            newChild2.innerHTML = "Start by evaluating all the Multiplicative (* / %) operators from left to right. <br /> Then evaluate " +
            "the Additive (+ -) operators from left to right.";
            newChild.appendChild(newChild2);
        }
        // finds and set the indices for the operator, left operand, and right operand
        // has click operator message
        find();

        var arr = stateObject[stateObject.length - 1][0];
        // this will prompt the user every time to ask what type
        // of operator the student should start with.
        if (arr.length >= 1) {
            document.getElementById("nextstep").disabled = true;
            //next step
            var firstStep = document.createElement("div");
            firstStep.setAttribute("id", "firststep");
            firstStep.classList.add("expressionStatement");
            //messages
            var prompt = document.createElement("p");
            var buttons = document.createElement("div");
            prompt.classList.add("step");
            buttons.classList.add("exp");
            //shows two button options (multiplicative and additive) for users to
            //choose between
            var mdmOperator = document.createElement("button");
            var asOperator = document.createElement("button");
            mdmOperator.setAttribute("id", "MDMoperator");
            mdmOperator.classList.add("operators");
            asOperator.setAttribute("id", "ASoperator");
            asOperator.classList.add("operators");
            mdmOperator.innerHTML = "* / %";
            asOperator.innerHTML = "+ -";
            prompt.innerHTML = "What type of operator are we going to use?";

            buttons.appendChild(mdmOperator);
            buttons.appendChild(asOperator);

            firstStep.appendChild(prompt);
            firstStep.appendChild(buttons);

            document.getElementById("steps").appendChild(firstStep);
            //checks to see if user clicked correct "operator type" button
            var operators = document.querySelectorAll(".operators");
            for (var i = 0; i < operators.length; i++) {
                if (operators[i].id == arr[stateObject[stateObject.length - 1][1].index].type) {
                    //if correct, moves on to next step of interaction
                    operators[i].onclick = findOperator;
                } else {
                    //if incorrect, prints appropriate error message and asks user to click
                    //correct button
                    operators[i].onclick = wrongButton;
                }
            }
        }
        document.getElementById("dummy").scrollIntoView();
    }

    // If the student click on the wrong type of operator button.
    // tells them its wrong and prompts them to continue.
    function wrongButton() {

        var error = document.createElement("div");
        error.setAttribute("id", "error");
        var arr = stateObject[stateObject.length - 1][0];
        var operator = stateObject[stateObject.length - 1][1].index;

        var message = "We need to start by looking for ";
        if (arr[operator].type == "MDMoperator") {
            document.getElementById("ASoperator").disabled = true;
            message += "Multiplication, Division, or Mod operators before we do " +
            "a Addition or Subtraction operator, click the *	/	% button";
        } else {
            document.getElementById("MDMoperator").disabled = true;
            message += "Addition or Subtraction because there are no " +
            "Multiplication, Division, or Mod operators left, click the +	- button";
        }
        error.innerHTML = message;

        document.getElementById("steps").appendChild(error);
        document.getElementById("nextstep").onclick = findOperator;
    }

    // Prompts the user to find and click the operator.
    function findOperator() {
        if (document.getElementById("error") !== null) {
            document.getElementById("steps").removeChild(document.getElementById("error"));
        }
        //add message and expression to 2 separate columns in interface on page
        document.getElementById("steps").removeChild(document.getElementById("firststep"));
        var newChild = document.createElement("div");
        newChild.classList.add("expressionStatement");
        var messageParagraph = document.createElement("p");
        var expressionParagraph = document.createElement("p");
        messageParagraph.classList.add("step");
        expressionParagraph.classList.add("exp");

        messageParagraph.innerHTML = stateObject[stateObject.length - 1][2].message;
        expressionParagraph.innerHTML = arrToString();
        newChild.appendChild(messageParagraph);
        newChild.appendChild(expressionParagraph);

        document.getElementById("steps").appendChild(newChild);
        document.getElementById("steps").style.visability = "visable";
        //adds array, operator index, and message to state object
        find();
        var operator = stateObject[stateObject.length - 1][1].index;

        // makes all the other spans clickable but if they are clicked
        // and not the right answer they get to go the wrongOption.
        for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
            if (i != operator) {
                document.getElementById(i).onclick = wrongOperator;
            }
        }

        document.getElementById(operator).onclick = findLeft;
    }

    // for if you click the wrong operator, it tells you then continues
    // through the steps
    function wrongOperator() {
        var error = document.getElementById("error");
        if (error === null) {
            error = document.createElement("div");
            error.setAttribute("id", "error");
        }
        var arr = stateObject[stateObject.length - 1][0];
        var operator = stateObject[stateObject.length - 1][1].index;
        error.innerHTML = "Oops the correct operator is the left most " + arr[operator].value
        + ", but lets keep going by finding the left operand";
        document.getElementById("steps").appendChild(error);
        findLeft();
    }

    // prompts you to click the left operand.
    function findLeft() {
        document.getElementById(stateObject[stateObject.length - 1][1].index).classList.add('clicked');
        // update state object
        findLeftOperand();
        var messageParagraphs = document.querySelectorAll(".step");
        var lastMessage = messageParagraphs.length - 1;
        messageParagraphs[lastMessage].innerHTML = stateObject[stateObject.length - 1][2].message;
        messageParagraphs[lastMessage].style.color = "#45ADA8";

        var left = stateObject[stateObject.length - 1][1].index;
        // makes all the other spans clickable but if they are clicked
        // and not the right answer they get to go the wrongOption.
        for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
            if (i != left) {
                document.getElementById(i).onclick = wrongLeft;
            }
        }
        document.getElementById(left).onclick = findRight;
    }

    // prompts you to click the right operand.
    function findRight() {
        document.getElementById(stateObject[stateObject.length - 1][1].index).classList.add('clicked');
        // update state object
        findRightOperand();
        var messageParagraphs = document.querySelectorAll(".step");
        var lastMessage = messageParagraphs.length - 1;
        messageParagraphs[lastMessage].innerHTML = stateObject[stateObject.length - 1][2].message;
        messageParagraphs[lastMessage].style.color = "#547980";

        var right = stateObject[stateObject.length - 1][1].index;
        // makes all the other spans clickable but if they are clicked
        // and not the right answer they get to go the wrongOption.
        for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
            if (i != right) {
                document.getElementById(i).onclick = wrongRight;
            }
        }
        document.getElementById(right).onclick = trySubmit;
    }

    // for if you click the wrong left operand, it tells you then continues steps
    function wrongLeft() {
        var error = document.getElementById("error");
        if (error === null) {
            error = document.createElement("div");
            error.setAttribute("id", "error");
        }
        var left = stateObject[stateObject.length - 1][1].index;
        error.innerHTML = "Oops the correct left operand is " + getValue(left)
        + ", but lets keep going by finding the right operand";
        document.getElementById("steps").appendChild(error);

        findRight();
    }

    // for if you click the wrong right operand, it tells you then continues steps
    function wrongRight() {
        document.getElementById("nextstep").disabled = false;
        var error = document.getElementById("error");

        if (error === null) {
            error = document.createElement("div");
            error.setAttribute("id", "error");
        }
        var right = stateObject[stateObject.length - 1][1].index;
        error.innerHTML = "Oops the correct right operand is " + getValue(right)
        + ", but lets keep going click the next button.";
        document.getElementById("steps").appendChild(error);
        document.getElementById(right).classList.add('clicked');

        document.getElementById("nextstep").onclick = trySubmit;
    }

    // prompts the user to solve a portion of the problem
    // mini expression piece
    function trySubmit() {
        document.getElementById("dummy").scrollIntoView();

        if (document.getElementById("error") !== null) {
            var steps = document.getElementById("steps");
            steps.removeChild(steps.lastChild);
        }
        var next = document.getElementById("nextstep");
        next.innerHTML = "Check";
        next.disabled = false;

        var expressionParagraphs = document.querySelectorAll(".exp");
        clearIds(expressionParagraphs[expressionParagraphs.length - 1]);

        var newChild = document.createElement("div");
        newChild.classList.add("expressionStatement");
        var messageParagraph = document.createElement("p");
        var expressionParagraph = document.createElement("p");
        messageParagraph.classList.add("step");
        expressionParagraph.classList.add("exp");

        // update state object
        solve();

        messageParagraph.innerHTML = stateObject[stateObject.length - 1][2].message;
        expressionParagraph.innerHTML = answerToString();
        newChild.appendChild(messageParagraph);
        newChild.appendChild(expressionParagraph);

        document.getElementById("steps").appendChild(newChild);
        document.getElementById("dummy").scrollIntoView();
        next.onclick = processAnswer;
    }

    // prosses user's answer for solving mini expression,
    // tells them whether it's right or wrong and then continues.
    function processAnswer() {
        var clientAnswer = document.getElementById("answer");
        var newChild = document.createElement("div");
        newChild.setAttribute("id", "reply");

        var arr = stateObject[stateObject.length - 1][0];
        var operator = stateObject[stateObject.length - 1][1].index;

        // check if answer is correct
        var correct = false;
        if (arr[operator].type == 'double' && arr[operator].value % 1 == 0) {
            if (clientAnswer.value == (arr[operator].value + ".0")) {
                correct = true;
            }
        } else if (arr[operator].type == 'string') {
            if (clientAnswer.value == ("\"" + arr[operator].value + "\"")) {
                correct = true;
            }
        } else if (clientAnswer.value === arr[operator].value.toString()) {
            correct = true;
        }

        // give response based on correct/incorrect answer
        if (correct && arr.length > 1) {
            newChild.innerHTML = "Great Job! Click Next to continue.";
        } else if (correct && arr.length == 1) {
            newChild.innerHTML = "Great Job!";
            document.getElementById("nextstep").classList.add("hiddenSteps");
        } else if (arr.length == 1) {
            clientAnswer.style.color = "red";
            newChild.innerHTML = "Oops, sorry the answer was " + getValue(operator);
            document.getElementById("nextstep").classList.add("hiddenSteps");
        } else {
            clientAnswer.style.color = "red";
            newChild.innerHTML = "Oops, sorry the answer was " + getValue(operator)
            + " but lets keep going!";
        }

        document.getElementById("steps").appendChild(newChild);
        var next = document.getElementById("nextstep");
        next.innerHTML = "Next";

        // This corrents their answer in the answer box if they got it wrong
        // and makes them continue on to another round of solving.
        next.onclick = function () {
            clientAnswer.style.color = "black";
            clientAnswer.value = getValue(operator);
            stepThrough();
        }
        clientAnswer.id = "";
        document.getElementById("dummy").scrollIntoView();
    }

    // gets the value at a particular index
    // formats it based on int/double/String type
    function getValue(index) {
        var arr;
        if (!started) {
            arr = startArray;
        } else {
            arr = stateObject[stateObject.length - 1][0];
        }
        if (arr[index].type == 'double' && arr[index].value % 1 == 0) {
            return arr[index].value + ".0";
        } else if (arr[index].type == 'String') {
            return "\"" + arr[index].value + "\"";
        } else {
            return arr[index].value;
        }
    }

    // creates the answer box in a string.
    function answerToString() {
        var arrString = "";
        for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
            if (i == stateObject[stateObject.length - 1][1].index) {
                arrString += "<input type=text id=answer size=1/> "
            } else {
                arrString += getValue(i) + " ";
            }
        }
        return arrString;
    }

    // clears old ids so not to get them mixed up with the new ones.
    function clearIds(expressionPara) {
        var arrString = "";
        var operator;
        if (interaction) {
            operator = stateObject[stateObject.length - 1][1].index - 1;
        } else {
            operator = stateObject[stateObject.length - 1][1].index;
        }
        for (var i = 0; i < stateObject[stateObject.length - 1][0].length; i++) {
            if (i == operator - 1) {
                arrString += "<span class='clicked'>";
            }
            arrString += getValue(i) + " ";
            if (i == operator + 1) {
                arrString += "</span> ";
            }
        }
        expressionPara.innerHTML = arrString;
    }

    /* The next 4 methods build up the state object*/

    // Find the operator
    function find() {
        var arr;
        // if first time calling find, there is nothing in the state object
        // so use startArray (global variable)
        if (!started) {
            arr = startArray;
            started = true;
        } else {
            // get arr from state object
            arr = stateObject[stateObject.length - 1][0];
        }

        // create a new array for the new state
        var currState = new Array();
        var bool = false;
        // set to first operator
        var operator = 1;
        // add array to new state
        currState.push(arr);
        // loop through array and find first mult/div/mod operator
        // if it can't find, then set to the first add/subtract operator
        for (var i = 1; i < arr.length; i += 2) {
            if (arr[i].type == "MDMoperator") {
                operator = i;
                bool = true;
                break;
            }
        }
        // make and add index to new state
        var index = {index: operator};
        currState.push(index);
        // make and add message to new state
        var message;
        if (!interaction) {
            message = {message: "We evaluate the leftmost operator (" + arr[operator].value + ") with its left and right operands."};
        } else {
            message = {message: "Click the next operator."};
        }
        currState.push(message);
        // add new state to state object
        stateObject.push(currState);
    }

    // Find the left operand
    function findLeftOperand() {
        // create a new array for the new state
        var currState = new Array();
        // add array to new state
        currState.push(stateObject[stateObject.length - 1][0]);
        // make and add index to new state
        var operator = stateObject[stateObject.length - 1][1].index - 1;
        var index = {index: operator};
        currState.push(index);
        // make and add message to new state
        var message = {message: "Click the left operand."};
        currState.push(message);
        // add new state to state object
        stateObject.push(currState);
    }

    // Find the right operand
    function findRightOperand() {
        // create a new array for the new state
        var currState = new Array();
        // add array to new state
        currState.push(stateObject[stateObject.length - 1][0]);
        // make and add index to new state
        var operator = stateObject[stateObject.length - 2][1].index + 1;
        var index = {index: operator};
        currState.push(index);
        // make and add message to new state
        var message = {message: "Click the right operand."};
        currState.push(message);
        // add new state to state object
        stateObject.push(currState);
    }

    // Solves and updates state object
    function solve() {
        // get array from state object
        var arr = stateObject[stateObject.length - 1][0];
        var operator;
        // set the operator (varies based on interactive mode/noninteractive mode)
        if (interaction) {
            operator = stateObject[stateObject.length - 1][1].index - 1;
        } else {
            operator = stateObject[stateObject.length - 1][1].index;
        }
        // new array for the state object
        var updatedArray = [];
        //copy all values that aren't evaluated
        for (var i = 0; i < operator; i++) {
            updatedArray.push(arr[i]);
        }

        // evaluate next part of the expression based on the operator
        if (arr[operator].value == '*') {
            updatedArray[operator - 1].value = (arr[operator - 1].value * arr[operator + 1].value);
        } else if (arr[operator].value == '/') {
            updatedArray[operator - 1].value = (arr[operator - 1].value / arr[operator + 1].value);
            // special case for int division
            if (arr[operator - 1].type == 'int' && arr[operator + 1].type == 'int') {
                updatedArray[operator - 1].value = Math.round(updatedArray[operator - 1].value);
            }
        } else if (arr[operator].value == '%') {
            updatedArray[operator - 1].value = (arr[operator - 1].value % arr[operator + 1].value);
        } else if (arr[operator].value == '+') {
            // special case adding to String (need to convert other type to String before adding)
            if (arr[operator - 1].type == 'string') {
                updatedArray[operator - 1].value = arr[operator - 1].value + getValue(operator + 1);
            } else if (arr[operator + 1].type == 'string') {
                updatedArray[operator - 1].value = getValue(operator - 1) + arr[operator + 1].value;
            } else {
                updatedArray[operator - 1].value = (arr[operator - 1].value + arr[operator + 1].value);
            }
        } else if (arr[operator].value == '-') {
            updatedArray[operator - 1].value = (arr[operator - 1].value - arr[operator + 1].value);
        }

        // setting type of value
        if (arr[operator - 1].type == 'int' && arr[operator + 1].type == 'int') {
            updatedArray[operator - 1].type = 'int';
        } else if (arr[operator - 1].type == 'string' || arr[operator + 1].type == 'string') {
            updatedArray[operator - 1].type = 'string';
        } else {
            updatedArray[operator - 1].type = 'double';
        }

        // copy remaining elements of expression
        for (var i = operator + 2; i < arr.length; i++) {
            updatedArray.push(arr[i]);
        }

        // create a new array for the new state
        var currState = new Array();
        // add new array to new state
        currState.push(updatedArray);
        // makes and adds new index and message to state object
        // differs based on interactive/noninteractive
        if (interaction) {
            var oper = stateObject[stateObject.length - 2][1].index;
            var index = {index: oper};
            currState.push(index);
            var message = {message: "What is the answer?"};
            currState.push(message);
        } else {
            var oper = stateObject[stateObject.length - 1][1].index - 1;
            var index = {index: oper};
            currState.push(index);
            var message = {message: "After evaluating we get " + getValue(oper)};
            currState.push(message);
        }
        stateObject.push(currState);
    }

    return {
        create_initial_state: expressions_make_initial_state,
        template_url: "expressions/problemTemplate.html",
        initialize: initialize,
        reset: reset
    };

}) ();

// Register this problem type with the csed global.
(function(csed) {
    csed.expressions = expressions;
}) (csed);
