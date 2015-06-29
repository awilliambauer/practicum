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
            case -1:
                resetScreen();
                break;
            case 0:
                loopBounds();
                break;
            case 1:
                init();
                iValue(1);
                shrinkProblemDes();
                break;
            case 2:
                loopTest("Yes");
                break;
            case 3:
                exprEvalPrompt();
                break;
            case 4:
                exprIValue(1);
                break;
            case 5:
                exprArrIMin1(1, 11);
                break;
            case 6:
                exprArrIPlus1(1, 11, 2);
                break;
            case 7:
                exprResult(1, 11, 2, 13);
                break;
            case 8:
                selectIndex(1);
                break;
            case 9:
                updateArray(1, 13);
                break;
            case 10:
                iValue(2);
                break;
            case 11:
                loopTest("Yes");
                break;
            case 12:
                exprEvalPrompt();
                break;
            case 13:
                exprIValue(2);
                break;
            case 14:
                exprArrIMin1(2, 13);
                break;
            case 15:
                exprArrIPlus1(2, 13, 4);
                break;
            case 16:
                exprResult(2, 13, 4, 30);
                break;
            case 17:
                selectIndex(2);
                break;
            case 18:
                updateArray(2, 30);
                break;
            case 19:
                iValue(3)
                break;
            case 20:
                loopTest("Yes");
                break;
            case 21:
                exprEvalPrompt();
                break;
            case 22:
                exprIValue(3)
                break;
            case 23:
                exprArrIMin1(3, 30);
                break;
            case 24:
                exprArrIPlus1(3, 30, 7);
                break;
            case 25:
                exprResult(3, 30, 7, 67);
                break;
            case 26:
                selectIndex(3);
                break;
            case 27:
                updateArray(3, 67);
                break;
            case 28:
                iValue(4);
                break;
            case 29:
                loopTest("No");
                break;
            case 30:
                done();
                break;
        }
        step++;

    }

    /** Crude version of figuring out loop bounds.
     * If they enter 0 as the first index, it turns green and
     * autofills the rest of the indices. Turns red if they
     * get it wrong.
     */
    function loopBounds() {
        $("#promptwords").html("Let us determine the bounds of the loop <br> Enter the value for the first index");
        $("#firstindex").on('keyup change', function() {
            if ($("#firstindex").val() == 0) {
                $("#firstindex").css("background-color", "#00FF00");
                var index = 0;
                $("input").each(function () {
                    $(this).val(index);
                    index++;
                });
            } else {
                $("#firstindex").css("background-color", "#FF0000");
            }
        });
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

    /** Increases size of problem description with concurrent fadein, and
     * decreases size of problem text
     * */
    function growProblemDes() {
        $("#problemdescription").fadeTo(500,1);
        $("#problemdescription").animate({
            "fontSize": "15px"
        });
        $("#problemtext").animate({
            "fontSize": "12px"
        });
    }

    /** Prompts for the current value of i and updates it
     *
     * @param i the current value of i
     */
    function iValue(i) {
        $("#promptwords").html("The current value of i is " + i);
        $("#i").html(i);
        $("#i").css("border-color", "#45ADA8");
        if (i === 1) {
            applyEmphasis("#init");
        } else {
            applyEmphasis("#init");
        }
    }

    /**
     * Prompts for if the for loop test passes
     *
     * @param doesPass "Yes" if the test passes, "No" otherwise
     */
    function loopTest(doesPass) {
        $("#promptwords").html("Is <span style=\"color:#45ADA8\">i < arr.length - 1</span>? " + doesPass);
        applyEmphasis("#test");
    }

    /**
     * Prompts to evaluate the expression
     */
    function exprEvalPrompt() {
        $("#promptwords").html("Let's evaluate the expression now!");
        applyEmphasis("#expr");
    }

    /**
     * Prompts for the current value of i in the expression
     *
     * @param i the current value of i
     */
    function exprIValue(i) {
        $("#promptwords").html("What is the value of <span style=\"color: #45ada8;\">i</span>? " + i);
        applyEmphasis("#expr");
        $("#i").css("border-color", "#45ADA8");
    }

    /**
     * Prompts for the value at the index i - 1
     *
     * @param i the current value of i
     * @param iMin1 the current value of the index i - 1
     */
    function exprArrIMin1(i, iMin1) {
        $("#promptwords").html("What is the value of <span style=\"color:#45ADA8;\">i</span>? " + i +
        "<br>What is the value of <span style=\"background-color: #E5FCC2;\">arr[i - 1]</span>? " + iMin1);
        applyEmphasis("#expr");

        /*highlight portion of problem text containing "arr[i - 1]"*/
        $("#exprP1").css("background-color", "#E5FCC2");

        $("#i").css("border-color", "#45ADA8");
        $("#ele" + (i - 1)).css("border-color", "#E5FCC2");
    }

    /**
     * Prompts for the value at the index i + 1
     *
     * @param i the current value of i
     * @param iMin1 the current value of the index i - 1
     * @param iPlus1 the current value of the index i + 1
     */
    function exprArrIPlus1(i, iMin1, iPlus1) {
        $("#promptwords").html("What is the value of <span style=\"color: #45ada8;\">i</span>? " + i +
        "<br>What is the value of <span style=\"background-color: #E5FCC2;\">arr[i - 1]</span>? " + iMin1 +
        "<br>What is the value of <span style=\"background-color: #9DE0AD;\">arr[i + 1]</span>? " + iPlus1);

        applyEmphasis("#expr");
        $("#exprP1").css("background-color", "#E5FCC2");
        $("#exprP2").css("background-color", "#9DE0AD");
        $("#i").css("border-color", "#45ADA8");
        $("#ele" + (i - 1)).css("border-color", "#E5FCC2");
        $("#ele" + (i + 1)).css("border-color", "#9DE0AD");
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
        "<br>What is the value of <span style=\"background-color: #e5fcc2;\">arr[i - 1]</span>? " + iMin1 +
        "<br>What is the value of <span style=\"background-color: #9DE0AD;\">arr[i + 1]</span>? " + iPlus1 +
        "<br>What is the result of the expression? " + result);

        applyEmphasis("#expr");
        $("#exprP1").css("background-color", "#E5FCC2");
        $("#exprP2").css("background-color", "#9DE0AD");
        $("#i").css("border-color", "#45ADA8");
        $("#ele" + (i - 1)).css("border-color", "#E5FCC2");
        $("#ele" + (i + 1)).css("border-color", "#9DE0AD");
    }

    /**
     * Prompts for the index in the array that will change
     *
     * @param index the index that will change
     */
    function selectIndex(index) {
        $("#promptwords").html("Which index of the array is going to change? " + index);
        applyEmphasis("#index");
        $("#ele" + index).css("border-color", "#45ADA8");
    }

    /**
     * Prompts the array is updated and updates the array at index index to value val
     *
     * @param index the index that will be changed
     * @param val the value that arr[index] will be changed to
     */
    function updateArray(index, val) {
        $("#promptwords").html("Update that index of the array.");
        $("#ele" + index).css("border-color", "#45ADA8");
        $("#ele" + index).html(val);
    }

    /**
     *  Prompts the user that the problem is over
     */
    function done() {
        $("#promptwords").html("We are done!");
        $("#next").html("Start over");
        step = -2;
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

    function applyEmphasis(element) {
        $(element).css("color", "#45ADA8");
        $(element).css("font-weight", "bold");
    }


    /** Returns screen to onload state, with initial prompt message and original (approx) sizing
     * of problem description and problem text.
     * */
    function resetScreen() {
        $("#promptwords").html("Let's start the problem!");
        growProblemDes();
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

        //Reset bolded terms to normal weight
        $("#init").css("font-weight", "normal");
        $("#test").css("font-weight", "normal");
        $("#incr").css("font-weight", "normal");
        $("#index").css("font-weight", "normal");
        $("#expr").css("font-weight", "normal");

        //Reset highlighted terms:
        $("#exprP1").css("background-color", "white");
        $("#exprP2").css("background-color", "white");
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