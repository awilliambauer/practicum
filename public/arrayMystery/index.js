(function() {
    "use strict";

    var step = 0;

    window.onload = function() {
        $("#next").on("click", next);
        $("#back").on("click", back);

    };

    // Called when the user presses the next button
    function next() {
        clearHighlights();
        $("#next").html("Next"); //reset next button
        switch(step) {
            case 0:
                init();
                $("#promptwords").html("The current value of i is 1");
                $("#i").html("1");
                $("#i").css("border-color", "cyan");
                $("#init").css("color", "deeppink");
                break;
            case 1:
                $("#promptwords").html("Is <span style=\"color:deeppink\">i < arr.length - 1</span>? Yes.");
                $("#test").css("color", "deeppink");
                break;
            case 2:
                $("#promptwords").html("Let's evaluate the expression now!");
                $("#expr").css("color", "deeppink");
                break;
            case 3:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 1.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                break;
            case 4:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 1." +
                    "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? 11.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                $("#ele0").css("border-color", "darkorange");
                break;
            case 5:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 1." +
                    "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? 11." +
                    "<br>What is the value of <span style=\"color:mediumorchid;\">arr[i + 1]</span>? 2.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                $("#ele0").css("border-color", "darkorange");
                $("#ele2").css("border-color", "mediumorchid");
                break;
            case 6:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 1." +
                    "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? 11." +
                    "<br>What is the value of <span style=\"color:mediumorchid;\">arr[i + 1]</span>? 2." +
                    "<br>What is the result of the expression? 13.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                $("#ele0").css("border-color", "darkorange");
                $("#ele2").css("border-color", "mediumorchid");
                break;
            case 7:
                $("#promptwords").html("Which index of the array is going to change? 1");
                $("#index").css("color", "deeppink");
                $("#ele1").css("border-color", "cyan");
                break;
            case 8:
                $("#promptwords").html("Update that index of the array.");
                $("#ele1").css("border-color", "cyan");
                $("#ele1").html("13");
                break;
            case 9:
                $("#promptwords").html("The current value of i is 2");
                $("#i").html("2");
                $("#incr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                break;
            case 10:
                $("#promptwords").html("Is <span style=\"color:deeppink\">i < arr.length - 1</span>? Yes.");
                $("#test").css("color", "deeppink");
                break;
            case 11:
                $("#promptwords").html("Let's evaluate the expression now!");
                $("#expr").css("color", "deeppink");
                break;
            case 12:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 2.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                break;
            case 13:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 2." +
                    "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? 13.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                $("#ele1").css("border-color", "darkorange");
                break;
            case 14:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 2." +
                "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? 13." +
                    "<br>What is the value of <span style=\"color:mediumorchid;\">arr[i + 1]</span>? 4.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                $("#ele1").css("border-color", "darkorange");
                $("#ele3").css("border-color", "mediumorchid");
                break;
            case 15:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 2." +
                "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? 13." +
                "<br>What is the value of <span style=\"color:mediumorchid;\">arr[i + 1]</span>? 4." +
                    "<br>What is the result of the expression? 21.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                $("#ele1").css("border-color", "darkorange");
                $("#ele3").css("border-color", "mediumorchid");
                break;
            case 16:
                $("#promptwords").html("Which index of the array is going to change? 2");
                $("#index").css("color", "deeppink");
                $("#ele2").css("border-color", "cyan");
                break;
            case 17:
                $("#promptwords").html("Update that index of the array.");
                $("#index").css("color", "deeppink");
                $("#ele2").css("border-color", "cyan");
                $("#ele2").html("21");
                break;
            case 18:
                $("#promptwords").html("The current value of i is 3");
                $("#i").html("3");
                $("#i").css("border-color", "cyan");
                $("#incr").css("color", "deeppink");
                break;
            case 19:
                $("#promptwords").html("Is <span style=\"color:deeppink\">i < arr.length - 1</span>? Yes.");
                $("#test").css("color", "deeppink");
                break;
            case 20:
                $("#promptwords").html("Let's evaluate the expression now!");
                $("#expr").css("color", "deeppink");
                break;
            case 21:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 3.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                break;
            case 22:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 3." +
                    "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? 21.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                $("#ele2").css("border-color", "darkorange");
                break;
            case 23:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 3." +
                "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? 21." +
                    "<br>What is the value of <span style=\"color:mediumorchid;\">arr[i + 1]</span>? 7.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                $("#ele2").css("border-color", "darkorange");
                $("#ele4").css("border-color", "mediumorchid");
                break;
            case 24:
                $("#promptwords").html("What is the value of <span style=\"color:cyan;\">i</span>? 3." +
                "<br>What is the value of <span style=\"color:darkorange;\">arr[i - 1]</span>? 21." +
                "<br>What is the value of <span style=\"color:mediumorchid;\">arr[i + 1]</span>? 7." +
                    "<br>What is the result of the expression? 42.");
                $("#expr").css("color", "deeppink");
                $("#i").css("border-color", "cyan");
                $("#ele2").css("border-color", "darkorange");
                $("#ele4").css("border-color", "mediumorchid");
                break;
            case 25:
                $("#promptwords").html("Which index of the array is going to change? 3");
                $("#index").css("color", "deeppink");
                $("#ele3").css("border-color", "cyan");
                break;
            case 26:
                $("#promptwords").html("Update that index of the array.");
                $("#index").css("color", "deeppink");
                $("#ele3").css("border-color", "cyan");
                $("#ele3").html("42");
                break;
            case 27:
                $("#promptwords").html("The current value of i is 4");
                $("#i").html("4");
                $("#i").css("border-color", "cyan");
                $("#incr").css("color", "deeppink");
                break;
            case 28:
                $("#promptwords").html("Is <span style=\"color:deeppink\">i < arr.length - 1</span>? No.");
                $("#test").css("color", "deeppink");
                break;
            case 29:
                $("#promptwords").html("We are done!");
                $("#next").html("Start over");
                step = -1;
                break;
        }
        step++;

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