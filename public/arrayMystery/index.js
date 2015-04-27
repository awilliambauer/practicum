(function() {
    "use strict";

    var step = 0;

    window.onload = function () {
        $("#next").on("click", next);
        $("#back").on("click", back);
    };

    // Called when the user presses the next button
    function next() {
        clearHighlights();
        $("#next").html("Next"); //reset next button
        switch (step) {
            case 0:
                init();
                iValue(1);
                shrinkProblemDes();
                break;
            case 1:
                loopTest("Yes");
                break;
            case 2:
                exprEvalPrompt();
                break;
            case 3:
                exprIValue(1);
                break;
            case 4:
                exprArrIMin1(1, 11);
                break;
            case 5:
                exprArrIPlus1(1, 11, 2);
                break;
            case 6:
                exprResult(1, 11, 2, 13);
                break;
            case 7:
                selectIndex(1);
                break;
            case 8:
                updateArray(1, 13);
                break;
            case 9:
                iValue(2);
                break;
            case 10:
                loopTest("Yes");
                break;
            case 11:
                exprEvalPrompt();
                break;
            case 12:
                exprIValue(2);
                break;
            case 13:
                exprArrIMin1(2, 13);
                break;
            case 14:
                exprArrIPlus1(2, 13, 4);
                break;
            case 15:
                exprResult(2, 13, 4, 30);
                break;
            case 16:
                selectIndex(2);
                break;
            case 17:
                updateArray(2, 30);
                break;
            case 18:
                iValue(3)
                break;
            case 19:
                loopTest("Yes");
                break;
            case 20:
                exprEvalPrompt();
                break;
            case 21:
                exprIValue(3)
                break;
            case 22:
                exprArrIMin1(3, 30);
                break;
            case 23:
                exprArrIPlus1(3, 30, 7);
                break;
            case 24:
                exprResult(3, 30, 7, 67);
                break;
            case 25:
                selectIndex(3);
                break;
            case 26:
                updateArray(3, 67);
                break;
            case 27:
                iValue(4);
                break;
            case 28:
                loopTest("No");
                break;
            case 29:
                done();
                break;
        }
        step++;

    }

    /** Decreases size of problem description with concurrent fadeout, and
    * increases size of problem text
    * */
    function shrinkProblemDes() {
        $("#problemdescription").fadeTo(500,0.3);
        $("#problemdescription").animate({
            "fontSize": "10px"
        });
        $("#problemtext").animate({
            "fontSize": "17px"
        });
    }

    /** Prompts for the current value of i and updates it
     *
     * @param i the current value of i
     */
    function iValue(i) {
        $("#promptwords").html("The current value of i is " + i);
        $("#i").html(i);
        $("#i").css("border-color", "cyan");
        if (i === 1) {
            $("#init").css("color", "deeppink");
        } else {
            $("#incr").css("color", "deeppink");
        }
    }

    /**
     * Prompts for if the for loop test passes
     *
     * @param doesPass "Yes" if the test passes, "No" otherwise
     */
    function loopTest(doesPass) {
        $("#promptwords").html("Is <span style=\"color:deeppink\">i < arr.length - 1</span>? " + doesPass);
        $("#test").css("color", "deeppink");
    }

    /**
     * Prompts to evaluate the expression
     */
    function exprEvalPrompt() {
        $("#promptwords").html("Let's evaluate the expression now!");
        $("#expr").css("color", "deeppink");
    }

    /**
     * Prompts for the current value of i in the expression
     *
     * @param i the current value of i
     */
    function exprIValue(i) {
        $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? " + i);
        $("#expr").css("color", "deeppink");
        $("#i").css("border-color", "cyan");
    }

    /**
     * Prompts for the value at the index i - 1
     *
     * @param i the current value of i
     * @param iMin1 the current value of the index i - 1
     */
    function exprArrIMin1(i, iMin1) {
        $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? " + i +
        "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? " + iMin1);
        $("#expr").css("color", "deeppink");
        $("#i").css("border-color", "cyan");
        $("#ele" + (i - 1)).css("border-color", "darkorange");
    }

    /**
     * Prompts for the value at the index i + 1
     *
     * @param i the current value of i
     * @param iMin1 the current value of the index i - 1
     * @param iPlus1 the current value of the index i + 1
     */
    function exprArrIPlus1(i, iMin1, iPlus1) {
        $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? " + i +
        "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? " + iMin1 +
        "<br>What is the value of <span style=\"color:mediumorchid;\">arr[i + 1]</span>? " + iPlus1);
        $("#expr").css("color", "deeppink");
        $("#i").css("border-color", "cyan");
        $("#ele" + (i - 1)).css("border-color", "darkorange");
        $("#ele" + (i + 1)).css("border-color", "mediumorchid");
    }

    /**
     * Prompts for the result of the expression
     *
     * @param i the current value of i
     * @param iMin1 the current value of the index i - 1
     * @param iPlus1 the current value of the index i + 1
     * @param result the value of the expression
     */
    function exprResult(i, iMin1, iPlus1, result) {
        $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? " + i +
        "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? " + iMin1 +
        "<br>What is the value of <span style=\"color:mediumorchid;\">arr[i + 1]</span>? " + iPlus1 +
        "<br>What is the result of the expression? " + result);
        $("#expr").css("color", "deeppink");
        $("#i").css("border-color", "cyan");
        $("#ele" + (i - 1)).css("border-color", "darkorange");
        $("#ele" + (i + 1)).css("border-color", "mediumorchid");
    }

    /**
     * Prompts for the index in the array that will change
     *
     * @param index the index that will change
     */
    function selectIndex(index) {
        $("#promptwords").html("Which index of the array is going to change? " + index);
        $("#index").css("color", "deeppink");
        $("#ele" + index).css("border-color", "cyan");
    }

    /**
     * Prompts the array is updated and updates the array at index index to value val
     *
     * @param index the index that will be changed
     * @param val the value that arr[index] will be changed to
     */
    function updateArray(index, val) {
        $("#promptwords").html("Update that index of the array.");
        $("#ele" + index).css("border-color", "cyan");
        $("#ele" + index).html(val);
    }

    /**
     *  Prompts the user that the problem is over
     */
    function done() {
        $("#promptwords").html("We are done!");
        $("#next").html("Start over");
        step = -1;
    }

    // Called when the back button is pressed
    // Takes user back to previous step
    function back() {
        if (step > 1) {
            step -= 2;
            next();
        } else if (step == 1) {
            step = 29;
            next();
        } else if (step == 0) {
            step = 28;
            next();
        }
    }

    /**
     * Resets the array to its original values
     */
    function init() {
        $("#ele1").html("14");
        $("#ele2").html("2");
        $("#ele3").html("4");
    }

    // Removes all styling highlighting boxes and coloring text
    function clearHighlights() {
        // Reset text in problem
        $("#init").css("color", "black");
        $("#test").css("color", "black");
        $("#incr").css("color", "black");
        $("#index").css("color", "black");
        $("#expr").css("color", "black");

        // Reset element boxes
        $("#ele0").css("border-color", "darkgray");
        $("#ele1").css("border-color", "darkgray");
        $("#ele2").css("border-color", "darkgray");
        $("#ele3").css("border-color", "darkgray");
        $("#ele4").css("border-color", "darkgray");
        $("#i").css("border-color", "darkgray");

        // Reset indices
        $("#0").css("color", "black");
        $("#1").css("color", "black");
        $("#2").css("color", "black");
        $("#3").css("color", "black");
        $("#4").css("color", "black");
    }
    //1)   What is the current value of i?
    //    2)   Does the for loop test pass?
    //    3)   Let�s evaluate the expression now!
    //    4)   What is the value of i?
    //    5)   What is the value of a[i � 1]?
    //    6)   What is the value of a[i + 1]?
    //    7)   What is the result of the expression?
    //    8)   Which index of the array is going to change?
    //    9)   Update that index of the array
    //10) What is the current value of i?
    //    11) Does the for loop test pass?
    //    12) Let�s evaluate the expression now!
    //    13) What is the value of i?
    //    14) What is the value of a[i � 1]?
    //    15) What is the value of a[i + 1]?
    //    16) What is the result of the expression?
    //    17) Which index of the array is going to change?
    //    18) Update that index of the array
    //19) What is the current value of i?
    //    20) Does the for loop test pass?
    //    21) Let�s evaluate the expression now!
    //    22) What is the value of i?
    //    23) What is the value of a[i � 1]?
    //    24) What is the value of a[i + 1]?
    //    25) What is the result of the expression?
    //    26) Which index of the array is going to change?
    //    27) Update that index of the array
    //28) What is the current value of i?
    //    29) Does the for loop test pass?


})();