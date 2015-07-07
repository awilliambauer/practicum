/**
 * Created by Alicheae on 4/20/2015.
 */


// Make a little global that categories can decorate.
var csed = (function() {
    var COOKIE_KEY_PREFIX = "csed-consent-form-";
    var URL_PREFIX = "";
    var LOGGING_BASE_URL = 'http://localhost:5555';
    var LOGGING_RELEASE_ID = '10d48c3a-460e-4675-be78-b708b35c990b';

    var categoryToLoad;
    var problemToLoad;

    var userid_promise;
    var telmetry_client;

    function setupLogging(username) {
        telemetry_client = papika.TelemetryClient(LOGGING_BASE_URL, LOGGING_RELEASE_ID, '');

        uid_promise = self.telemetry_client.query_user_id({username:username})
            .then(function(userid) {
                self.telemetry_client.log_session({
                    user: userid,
                    detail: null
                });
                return userid;
            });

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
        d3.select("#problem").classed("hidden", true);
        d3.select("#problem").innerHTML = "";
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

    function addProblemsContentToLandingPage(problemsConfig) {
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
            .attr("href", function(problem) { return URL_PREFIX + "/" + problem.category + "/" + problem.id + ".php"; } )
            .text(function(problemConfig) { return problemConfig.title; })
        ;
    }

    function loadProblem(problemConfig) {

        // remove the old problem from the DOM
        d3.select("#problem-area").remove();

        // reset any global state in the category js runner
        if (csed.hasOwnProperty(problemConfig.category)) {
            csed[problemConfig.category].reset();
        }

        // Load in the template for the problem
        d3.html(URL_PREFIX + "/" + problemConfig.url, function(error, problemHtml) {
            if (error) return console.warn(error);

            // Uh, not sure why I can't append raw html into the dom with D3. Using jQuery for the moment...
            //d3.select("#problem").append(problemHtml);
            $("#problem").append(problemHtml);

            d3.select("#main-page").classed("hidden", true);
            d3.select("#problem").classed("hidden", false);

            var category = problemConfig.category;

            // bleh, I need a variable with all the category runners in it.
            // Here, I'm just using the expressions global because I know what that name is...
            //expressions.initialize();
            if (csed.hasOwnProperty(category)) {
                csed[category].initialize(URL_PREFIX, problemConfig);
            }
        });
    }

    function addProblemsToNav(problemsConfig) {
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
        d3.select("#problems-nav-container li")
            .data(problemsConfig)
            .append("ul")
            .attr("class", "dropdown-menu")
            .selectAll("li")
            .data(function(problemConfig) { return problemConfig.problems; })
            .enter()
            .append("li")
            .append("a")
            .attr("href", function(problem) { return URL_PREFIX + "/" + problem.category + "/" + problem.id  + ".php"; } )
            .text(function(problem) { return problem.title; })
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
        $("#consent-form-modal").modal("show");
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

        telemetry_client.log_event({
            type: 101,
            detail: data
        }, true).then(function() {
            consentFormResponseSuccess();
        });
    }

    function consentFormResponseSuccess() {
        var cookieKey = COOKIE_KEY_PREFIX + getUsername();
        if ($.cookie(cookieKey) !== "true") {
            $.cookie(cookieKey, true, {
                path : URL_PREFIX
            });
        }
    }

    return {
        "URL_PREFIX": URL_PREFIX,
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
    d3.select("#home-link").attr("href", csed.URL_PREFIX);


    // pull in problems
    var categoryJSON = $("#category-config").html();
    if (!categoryJSON) {
        console.error("Unable to load problem configuration: need .../public/categoryConfig.json");
    } else {
        var categoryConfig = JSON.parse(categoryJSON);

        if (!categoryConfig) {
            console.error("Unable to load problem configuration: need .../public/categoryConfig.json");
        } else {
            csed.addProblemsToNav(categoryConfig);
            csed.addProblemsContentToLandingPage(categoryConfig);

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
