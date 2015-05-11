/**
 * Created by mkmg on 5/11/15.
 */
(function() {
    "use strict";

    var step = 0;

    window.onload = function () {
        $("#next").on("click", next);
        $("#back").on("click", back);
        buildPage(states[0]);

    };

    function buildPage(state) {

    }

})();