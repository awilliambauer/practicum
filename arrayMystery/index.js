(function() {
    "use strict";

    var step = 0;

    window.onload = function() {
        $("#next").on("click", next);

    };

    function next() {
        switch(step) {
            case 0:
                $("#promptwords").html("The current value of i is 1");
                $("#i").html("1");
                $("#i").css("border-color", "#00ffff");
                break;
            case 1:
                $("#i").css("border-color", "darkgray");
                $("#promptwords").html("Is i < arr.length - 1? Yes.");
                break;
            case 2:
                $("#promptwords").html("Let's evaluate the expression now!");
                break;
            case 3:
                $("#promptwords").html("What is the value of i? 1.");
                break;
            case 4:
                $("#promptwords").html("What is the value of arr[i - 1]? 11.");
                break;
            case 5:
                $("#promptwords").html("What is the value of arr[i + 1]? 2.");
                break;
            case 6:
                $("#promptwords").html("What is the result of the expression? 13.");
                break;
            case 7:
                $("#promptwords").html("Which index of the array is going to change? 1");
                break;
            case 8:
                $("#promptwords").html("Update that index of the array.");
                $("#ele1").css("border-color", "#00ffff");
                $("#ele1").html("13");
                break;
            case 9:
                $("#ele1").css("border-color", "darkgray");
                $("#promptwords").html("The current value of i is 2");
                $("#i").html("2");
                $("#i").css("border-color", "#00ffff");
                break;
            case 10:
                $("#i").css("border-color", "darkgray");
                $("#promptwords").html("Is i < arr.length - 1? Yes.");
                break;
            case 11:
                $("#promptwords").html("Let's evaluate the expression now!");
                break;
            case 12:
                $("#promptwords").html("What is the value of i? 2.");
                break;
            case 13:
                $("#promptwords").html("What is the value of arr[i - 1]? 13.");
                break;
            case 14:
                $("#promptwords").html("What is the value of arr[i + 1]? 4.");
                break;
            case 15:
                $("#promptwords").html("What is the result of the expression? 21.");
                break;
            case 16:
                $("#promptwords").html("Which index of the array is going to change? 2");
                break;
            case 17:
                $("#promptwords").html("Update that index of the array.");
                $("#ele2").css("border-color", "#00ffff");
                $("#ele2").html("21");
                break;
            case 18:
                $("#ele2").css("border-color", "darkgray");
                $("#promptwords").html("The current value of i is 3");
                $("#i").html("3");
                break;
            case 19:
                $("#promptwords").html("Is i < arr.length - 1? Yes.");
                break;
            case 20:
                $("#promptwords").html("Let's evaluate the expression now!");
                break;
            case 21:
                $("#promptwords").html("What is the value of i? 3.");
                $("#i").css("border-color", "#00ffff");
                break;
            case 22:
                $("#i").css("border-color", "darkgray");
                $("#promptwords").html("What is the value of arr[i - 1]? 21.");
                break;
            case 23:
                $("#promptwords").html("What is the value of arr[i + 1]? 7.");
                break;
            case 24:
                $("#promptwords").html("What is the result of the expression? 42.");
                break;
            case 25:
                $("#promptwords").html("Which index of the array is going to change? 3");
                break;
            case 26:
                $("#promptwords").html("Update that index of the array.");
                $("#ele3").css("border-color", "#00ffff");
                $("#ele3").html("42");
                break;
            case 27:
                $("#ele1").css("border-color", "darkgray");
                $("#promptwords").html("The current value of i is 4");
                $("#i").html("4");
                $("#i").css("border-color", "#00ffff");
                break;
            case 28:
                $("#i").css("border-color", "darkgray");
                $("#promptwords").html("Is i < arr.length - 1? No.");
                break;
            case 29:
                $("#promptwords").html("We are done!");
                break;
        }
        step++;

    }

    //1)   What is the current value of i?
    //    2)   Does the for loop test pass?
    //    3)   Let’s evaluate the expression now!
    //    4)   What is the value of i?
    //    5)   What is the value of a[i – 1]?
    //    6)   What is the value of a[i + 1]?
    //    7)   What is the result of the expression?
    //    8)   Which index of the array is going to change?
    //    9)   Update that index of the array
    //10) What is the current value of i?
    //    11) Does the for loop test pass?
    //    12) Let’s evaluate the expression now!
    //    13) What is the value of i?
    //    14) What is the value of a[i – 1]?
    //    15) What is the value of a[i + 1]?
    //    16) What is the result of the expression?
    //    17) Which index of the array is going to change?
    //    18) Update that index of the array
    //19) What is the current value of i?
    //    20) Does the for loop test pass?
    //    21) Let’s evaluate the expression now!
    //    22) What is the value of i?
    //    23) What is the value of a[i – 1]?
    //    24) What is the value of a[i + 1]?
    //    25) What is the result of the expression?
    //    26) Which index of the array is going to change?
    //    27) Update that index of the array
    //28) What is the current value of i?
    //    29) Does the for loop test pass?


})();