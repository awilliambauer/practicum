
/// main page management functions
var csed = (function() {
    "use strict";

    var COOKIE_KEY_PREFIX = "csed-consent-form-";
    var LOGGING_PORT = 5678;
    var LOGGING_RELEASE_ID = '10d48c3a-460e-4675-be78-b708b35c990b';

    var categoryToLoad;
    var problemToLoad;

    var userid_promise;
    var task_logger;

    function setupLogging(username) {
        var LOGGING_BASE_URL = "https://" + window.location.hostname + ":" + LOGGING_PORT;
        Logging.initialize(LOGGING_BASE_URL, LOGGING_RELEASE_ID, username);
    }

    function setProblemToLoad(category, problemId) {
        categoryToLoad = category;
        problemToLoad = problemId;
    }

    function getProblemToLoad(categoryConfig) {
        if (categoryToLoad && problemToLoad) {
            return findProblem(categoryConfig, categoryToLoad, problemToLoad);
        }
        return null;
    }

    function hasProblemToLoad(categoryConfig) {
        return getProblemToLoad(categoryConfig) !== null;
    }

    function showHome() {
        d3.select("#main-page").classed("hidden", false);
        d3.select("#problem-container").classed("hidden", true);
        d3.select("#problem-container .problem").remove();
    }

    function findProblem(categoryConfig, requestedCategory, requestedProblemId)  {
        for (var index in categoryConfig) {
            var category = categoryConfig[index];
            if (category.name == requestedCategory) {
                var problems = category['problems'];
                for (var index in problems) {
                    var problem = problems[index];
                    if (problem.id == requestedProblemId) {
                        return problem;
                    }
                }
            }
        }
        return null;
    }

    function addProblemsContentToLandingPage(problemsConfig, onProblemStartCallback) {
        var problemArea = d3.select("#problems-content-container").selectAll("div")
                .data(problemsConfig)
                .enter()
                .append("div")
                .attr("class", "panel panel-default")
            ;

        var problemDescriptionArea = problemArea
            .append("div")
            .attr("class", "panel-heading");

        problemDescriptionArea.append("h3")
            .attr("class", "panel-title")
            .text(function(problemConfig) { return problemConfig.title } );


        var problemListArea = problemArea
                .append("div")
                .attr("class", "panel-body")
            ;

        problemListArea.append("p")
            .text(function(problemConfig) { return problemConfig.description } );


        problemListArea
            .append("ul")
            .selectAll("li")
            .data(function(problemsConfig) { return problemsConfig.problems; })
            .enter()
            .append("li")
            .append("a")
            .text(function(problemConfig) { return problemConfig.title; })
            .on("click", onProblemStartCallback)
        ;
    }

    function CallbackObject() {

        this.getNextState = function(fadeLevel) {
            return main_simulator.next(fadeLevel);
        }

        this.getCorrectAnswer = function() {
            return main_simulator.getCorrectAnswer();
        }

        this.respondToAnswer = function(correct) {
            return main_simulator.respondToAnswer(correct);
        }

        this.getFinalState = function() {
            return main_simulator.getFinalState();
        }

    }

    function loadProblem(problemConfig) {
        task_logger = Logging.start_task(problemConfig);

        // remove the old problem from the DOM
        d3.selectAll("#problem-container .problem").remove();

        // reset any global state in the category js runner
        if (!csed.hasOwnProperty(problemConfig.category)) {
            throw new Error("unknown category " + problemConfig.category + "!");
        }

        var problemUI = csed[problemConfig.category];
        problemUI.reset();

        // Load in the template for the problem
//        fetch(problemUI.template_url).then(function(response) {
//            return response.text();
//        }).then(function(problemHtml) {

        d3.html(problemUI.template_url, function(error, problemHtml){
            if (error) console.error(error);

            // Uh, not sure why I can't append raw html into the dom with D3. Using jQuery for the moment...
            //d3.select("#problem").append(problemHtml);
            $("#problem-container").append(problemHtml);

            d3.select("#main-page").classed("hidden", true);
            d3.select("#problem-container").classed("hidden", false);

            var category = problemConfig.category;

            var initial_state = problemUI.create_initial_state(problemConfig);
            main_simulator.initialize(category, {state:initial_state});

            // This problemUI initialize call probably needs to happen after the main_sim init call,
            // which is handled by promises/then() with fetch.
            problemUI.initialize(problemConfig, new CallbackObject(), initial_state, task_logger);

//            main_simulator.initialize(category, {state:initial_state}).then(function() {
//                console.log("finished initializing simulator");
//                problemUI.initialize(problemConfig, new CallbackObject(), initial_state, task_logger);
//            }, function(error) {
//                console.error("something went wrong: ");
//                console.log(error);
//            });
//        }, function(error) {
//            console.error(error);
        });
    }

    function addProblemsToNav(problemsConfig, onProblemStartCallback) {
        // add problems to nav
        d3.select("#problems-nav-container").selectAll("li")
            .data(problemsConfig)
            .enter()
            .append("li")
            .attr("class", "dropdown")
            .append("a")
            .attr("href", "#")
            .attr("class", "dropdown-toggle")
            .attr("data-toggle", "dropdown")
            .attr("role", "button")
            .attr("aria-haspopup", "true")
            .attr("aria-expanded", "false")

            .attr("title", function(problemConfig) { return problemConfig.title; } )
            .text(function(problemConfig) { return problemConfig.title; })

            .append("span")
            .attr("class", "caret")
        ;

        // fill in dropdowns in nav
        d3.selectAll("#problems-nav-container li")
            .data(problemsConfig)
            .append("ul")
            .attr("class", "dropdown-menu")
            .selectAll("li")
            .data(function(problemConfig) { return problemConfig.problems; })
            .enter()
            .append("li")
            .append("a")
            .text(function(problem) { return problem.title; })
            .on("click", onProblemStartCallback)
        ;
    }

    function getUsername() {
        return $("#__username").text();
    }

    /**
     * Checks cookies to see whether they've responded?
     *
     * @returns {boolean}
     */
    function hasRespondedToConsentForm() {
        // Looks like poor boolean zen, necessary because string "false"
        // evaluates to true.
        var cookieKey = COOKIE_KEY_PREFIX + getUsername();
        console.log("Checking cookie key: " + cookieKey);
        return $.cookie(cookieKey) === "true";
    }

    function showConsentFormModal() {
        // go modal
        var m = $("#consent-form-modal");
        m.modal({
              keyboard: false,
              backdrop: 'static'
        });
        m.modal("show");
    }

    function installConsentFormModal() {
        d3.select("#age-input").on("input", function () {
            var age = d3.select("#age-input").property("value");
            if ($.isNumeric(age)) {
                // GUH. remove the attribute by passing null. Passing false leaves the attribute there,
                //      which leaves the element disabled.
                d3.select("#consent-form-agree").attr("disabled", null);
            } else {
                d3.select("#consent-form-agree").attr("disabled", true);
            }
        });
        $("#age-input").keypress(function(e){
            if(e.keyCode==13 && !d3.select("#consent-form-agree").attr("disabled")) {
                $('#consent-form-agree').click();
            }
        });
    }

    function sendConsentFormAgree() {
        sendConsentFormResponse($("#__consent-form-agree-data").text());
    }

    function sendConsentFormDisagree() {
        sendConsentFormResponse($("#__consent-form-disagree-data").text());
    }

    function sendConsentFormResponse(data) {
        console.log("Sending consent data: " + data);

        Logging.log_event_with_promise({
            type: Logging.ID.Consent,
            detail: data
        }, true).then(function() {
            console.info("successfully logged consent response.");
            consentFormResponseSuccess();
        });
    }

    function consentFormResponseSuccess() {
        var cookieKey = COOKIE_KEY_PREFIX + getUsername();
        if ($.cookie(cookieKey) !== "true") {
            $.cookie(cookieKey, true, {
                domain: window.location.hostname
            });
        }
    }

    return {
        "COOKIE_KEY_PREFIX": COOKIE_KEY_PREFIX,

        "addProblemsToNav": addProblemsToNav,
        "addProblemsContentToLandingPage": addProblemsContentToLandingPage,
        "getUsername": getUsername,
        "hasRespondedToConsentForm": hasRespondedToConsentForm,
        "hasProblemToLoad": hasProblemToLoad,
        "installConsentFormModal": installConsentFormModal,
        "getProblemToLoad": getProblemToLoad,
        "loadProblem": loadProblem,
        "sendConsentFormAgree": sendConsentFormAgree,
        "sendConsentFormDisagree": sendConsentFormDisagree,
        "setProblemToLoad": setProblemToLoad,
        "setupLogging": setupLogging,
        "showConsentFormModal": showConsentFormModal,
        "showHome": showHome
    };

}) ();

function onProblemStart(problem) {
    csed.loadProblem(problem);
}

$(document).ready(function() {
    "use strict";

    $(".questionType").click(function() {
        $(this)
            .closest("[class^='col-sm']")
            .toggleClass("col-sm-6 col-sm-12")
            .siblings()
            .removeClass("col-sm-12")
            .addClass("col-sm-6");
    });

    var username = csed.getUsername();
    var hasResponded = csed.hasRespondedToConsentForm();

    // start logging system
    csed.setupLogging(username);

    csed.installConsentFormModal();
    if (!hasResponded) {
        csed.showConsentFormModal();
    }

    // set up home link
    d3.select("#home-link").attr("href", "");


    // pull in problems
    var categoryJSON = $("#category-config").html();
    if (!categoryJSON) {
        console.error("Unable to load problem configuration: need .../public/categoryConfig.json");
    } else {
        var categoryConfig = JSON.parse(categoryJSON);

        if (!categoryConfig) {
            console.error("Unable to load problem configuration: need .../public/categoryConfig.json");
        } else {
            csed.addProblemsToNav(categoryConfig, onProblemStart);
            csed.addProblemsContentToLandingPage(categoryConfig, onProblemStart);

            if (csed.hasProblemToLoad(categoryConfig)) {
                var problem = csed.getProblemToLoad(categoryConfig);
                csed.loadProblem(problem);
            } else {
                csed.showHome();
            }
        }
    }
});

(function($) {

    $.fn.menumaker = function(options) {

        var cssmenu = $(this), settings = $.extend({
            title: "Menu",
            format: "dropdown",
            sticky: false
        }, options);

        return this.each(function() {
            cssmenu.prepend('<div id="menu-button">' + settings.title + '</div>');
            $(this).find("#menu-button").on('click', function(){
                $(this).toggleClass('menu-opened');
                var mainmenu = $(this).next('ul');
                if (mainmenu.hasClass('open')) {
                    mainmenu.hide().removeClass('open');
                }
                else {
                    mainmenu.show().addClass('open');
                    if (settings.format === "dropdown") {
                        mainmenu.find('ul').show();
                    }
                }
            });

            cssmenu.find('li ul').parent().addClass('has-sub');

            multiTg = function() {
                cssmenu.find(".has-sub").prepend('<span class="submenu-button"></span>');
                cssmenu.find('.submenu-button').on('click', function() {
                    $(this).toggleClass('submenu-opened');
                    if ($(this).siblings('ul').hasClass('open')) {
                        $(this).siblings('ul').removeClass('open').hide();
                    }
                    else {
                        $(this).siblings('ul').addClass('open').show();
                    }
                });
            };

            if (settings.format === 'multitoggle') multiTg();
            else cssmenu.addClass('dropdown');

            if (settings.sticky === true) cssmenu.css('position', 'fixed');

            resizeFix = function() {
                if ($( window ).width() > 768) {
                    cssmenu.find('ul').show();
                }

                if ($(window).width() <= 768) {
                    cssmenu.find('ul').hide().removeClass('open');
                }
            };
            resizeFix();
            return $(window).on('resize', resizeFix);

        });
    };
})(jQuery);

(function($){
    $(document).ready(function(){

        $("#cssmenu").menumaker({
            title: "Menu",
            format: "multitoggle"
        });

    });
})(jQuery);
