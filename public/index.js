/**
 * Created by Alicheae on 4/20/2015.
 */

$(document).ready(function() {

    "use strict";

    $(".questionType").click(function() {
        $(this)
            .closest("[class^='col-md']")
                    .toggleClass("col-md-6 col-md-12")
            .siblings()
                .removeClass("col-md-12")
                .addClass("col-md-6");

    });


});
