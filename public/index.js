/**
 * Created by Alicheae on 4/20/2015.
 */

$(document).ready(function() {

    "use strict";

    $(".questionType").click(function() {
        console.log("clicked.");
        $(this)
            .closest("[class^='col-sm']")
                    .toggleClass("col-sm-6 col-sm-12")
            .siblings()
                .removeClass("col-sm-12")
                .addClass("col-sm-6");
    });


});
