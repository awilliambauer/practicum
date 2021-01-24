
// from https://css-tricks.com/snippets/javascript/get-url-variables/
// doesn't handle every valid query string, but should work for our purposes
function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if(pair[0] == variable){
            return pair[1];
        }
    }
    return false;
}

/// main page management functions
var csed = (function() {
    "use strict";

    var LOGGING_PORT = 5678;
    var LOGGING_RELEASE_ID = '9c62cfb4-f9eb-11e5-9b44-b346ec364aea';

    var enabledCategories;
    var categoryToLoad;
    var problemToLoad;

    var task_logger;

    var experimental_condition;
    var server_savedata;
    var numProblemsByCategory;
    var problemIdsByCategory;

    var fading_level = 3;

    var ENABLE_TELEMETRY_LOGGING = false;

    function setupLogging(username) {
        if (ENABLE_TELEMETRY_LOGGING) {
            var LOGGING_BASE_URL = window.location.protocol + "//" + window.location.hostname + ":" + LOGGING_PORT;
            //var LOGGING_BASE_URL = "https://dev-olio.cs.washington.edu" + ":" + LOGGING_PORT;

            return Logging.initialize(LOGGING_BASE_URL, LOGGING_RELEASE_ID, username).then(function (logging_data) {
                experimental_condition = logging_data.condition;

                server_savedata = logging_data.savedata ? JSON.parse(logging_data.savedata) : null;

                // initialize the number of problems so we can give the user the correct fading level
                // initialize the problems the user has tried so we can display problem highlighting
                if (server_savedata === null) {
                    server_savedata = {
                        numProblemsByCategory: {
                            expressions: 0,
                            if_else: 0,
                            array: 0
                        },
                        problemIdsByCategory: {
                            expressions: [],
                            if_else: [],
                            array: []
                        }
                    };
                }
                numProblemsByCategory = server_savedata.numProblemsByCategory;
                problemIdsByCategory = server_savedata.problemIdsByCategory;

                // for debugging
                //experimental_condition = 1;
                //numProblems = 0;

                console.info('successfully started logging session');
            });
        } else {
            // use local storage
            numProblemsByCategory = (window.localStorage.numProblemsByCategory && JSON.parse(window.localStorage.numProblemsByCategory)) || {
                expressions: 0,
                if_else: 0,
                array: 0
            }
            problemIdsByCategory = (window.localStorage.problemIdsByCategory && JSON.parse(window.localStorage.problemIdsByCategory)) || {
                expressions: [],
                if_else: [],
                array: []
            }
            return new Promise(function(resolve) { resolve(); } );
        }
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
        categoryConfig.forEach(function (category) {
            if (category.category === requestedCategory) {
                var problems = category['problems'];
                problem.forEach(function (problem) {
                    if (problem.id === requestedProblemId) {
                        return problem;
                    }
                });
            }
        });
        return null;
    }

    function addProblemsContentToLandingPage(problemsConfig, onProblemStartCallback) {
        var enabledConfig = [];
        if (enabledCategories) {
            problemsConfig.forEach(function (config) {
                if (enabledCategories.indexOf(config.name) > -1) {
                    enabledConfig.push(config);
                }
            });
        }
        var problemArea = d3.select("#problems-content-container").selectAll("div")
                .data(enabledConfig)
                .enter()
                .append("div")
                .attr("class", "panel-group")
                .append("div")
                .attr("class", "panel panel-default")
            ;

        var problemDescriptionArea = problemArea
            .append("div")
            .attr("class", "panel-heading");

        problemDescriptionArea.append("h3")
            .attr("class", "panel-title")
            .text(function(problemConfig) { return problemConfig.title } )
        ;

        var problemListArea = problemArea
                .append("div")
                .attr("class", "list-group")
            ;

        problemListArea
            .append("p")
            .attr("class", "list-group-item")
            .text(function(problemConfig) { return problemConfig.description } )
        ;

        problemListArea
            .selectAll("a")
            .data(function(configs) { return configs.problems; })
            .enter()
            .append("a")
            .attr("class", function(problem) {
                var foundProblem = false;
                for (var category in problemIdsByCategory) {
                    if (problemIdsByCategory[category].indexOf(problem.id) !== -1) {
                        foundProblem = true;
                    }
                }
                if (foundProblem) {
                    return "uuid_" + problem.id + " list-group-item problem-visited";
                }
                else {
                    return "uuid_" + problem.id + " list-group-item";
                }
            })
            .text(function(problemConfig) { return problemConfig.title; })
            .on("click", onProblemStartCallback)
        ;
    }

    function saveProblemData(problemConfig) {
        // increment the number of problems this user has started
        numProblemsByCategory[problemConfig.category]++;
        // add the problem id to the list of problems the user has tried
        if (problemIdsByCategory[problemConfig.category].indexOf(problemConfig.id) === -1) {
            problemIdsByCategory[problemConfig.category].push(problemConfig.id);
        }

        if (server_savedata == null) {
            server_savedata = {
                numProblemsByCategory: numProblemsByCategory,
                problemIdsByCategory: problemIdsByCategory
            };
        }
        else {
            server_savedata.numProblemsByCategory = numProblemsByCategory;
            server_savedata.problemIdsByCategory = problemIdsByCategory;
        }

        Logging.save_user_data(server_savedata);
    }

    function setFadingLevel() {
        var forceFading = getQueryVariable("fading");
        if (forceFading && $.isNumeric(forceFading)) {
            return parseInt(forceFading);
        }

        var selection = $('#fading-level').find(":selected").val();

        if (selection === 'no-choice') {
            fading_level = 3;
        }
        else if (selection === 'easy') {
            fading_level = 0;
        }
        else if (selection === 'medium') {
            fading_level = 1;
        }
        else if (selection === 'hard') {
            fading_level = 2;
        }
    }

    function getFadingLevel(condition, category) {
        var forceFading = getQueryVariable("fading");
        if (forceFading && $.isNumeric(forceFading)) {
            return parseInt(forceFading);
        }
        //if (condition === 2) { // control is normal fading progression
            if (numProblemsByCategory[category] === 1) {
                return 0;
            }
            else if (numProblemsByCategory[category] <= 4) {
                return 1;
            }
            else if (numProblemsByCategory[category] <= 6) {
                return 2;
            }
            else {
                return 3;
            }
        //} else { // condition 1
        //    return 1; // treatment is fixed fading level
        //}
    }

    function CallbackObject() {

        this.getNextState = function(fadeLevel) {
            return main_simulator.next(fadeLevel);
        };

        this.getCorrectAnswer = function() {
            return main_simulator.getCorrectAnswer();
        };

        this.respondToAnswer = function(correct) {
            return main_simulator.respondToAnswer(correct);
        };

        this.getFinalState = function() {
            return main_simulator.getFinalState();
        }

    }

    function loadProblem(problemConfig, variant) {
        task_logger = Logging.start_task(problemConfig);

        // if no alt state, choose the first
        if (problemConfig.content.variants) {
            variant = variant || problemConfig.content.variants[0];
            variant.started = true;
            Logging.log_task_event(task_logger, {
                type: Logging.ID.SubtaskStart,
                detail: {id: variant.id},
            });
        }

        saveProblemData(problemConfig);
        updateProblemDisplay(problemConfig);

        // remove the old problem from the DOM
        d3.selectAll("#problem-container .problem").remove();

        // reset any global state in the category js runner
        // if (!csed.hasOwnProperty(problemConfig.category)) {
        //     throw new Error("unknown category " + problemConfig.category + "!");
        // }

        var problemUI = csed.controller;
        problemUI.reset();

        // Load in the template for the problem

        d3.html(problemUI.template_url, function(error, problemHtml){
            if (error) console.error(error);

            // Uh, not sure why I can't append raw html into the dom with D3. Using jQuery for the moment...
            $("#problem-container").append(problemHtml);

            d3.select("#main-page").classed("hidden", true);
            d3.select("#problem-container").classed("hidden", false);

            var category = problemConfig.category;
            d3.select("#PageHeader").html(problemConfig.title);

            var initial_state = problemUI.create_initial_state(problemConfig, variant);
            main_simulator.initialize(category, {state:initial_state});

            // calculate what fading level the user should see for this problem, based on their
            // experimental condition and the number of problems they have completed
            setFadingLevel();

            if (fading_level === 3) {
                fading_level = getFadingLevel(experimental_condition, category);
            }
            // This problemUI initialize call probably needs to happen after the main_sim init call,
            // which is handled by promises/then() with fetch.
            problemUI.initialize(problemConfig, new CallbackObject(), initial_state, task_logger, fading_level);
        });
    }

    // add the "problem-visited" class to the newly visited problem
    function updateProblemDisplay(problemsConfig) {
        d3.selectAll(".uuid_" + problemsConfig.id)
            .classed("problem-visited", true);
    }

    function addProblemsToNav(problemsConfig, onProblemStartCallback) {
        var enabledConfig = [];
        if (enabledCategories) {
            problemsConfig.forEach(function (config) {
                if (enabledCategories.indexOf(config.name) > -1) {
                    enabledConfig.push(config);
                }
            });
        }
        // add problems to nav
        d3.select("#problems-nav-container").selectAll("li")
            .data(enabledConfig)
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
            .data(enabledConfig)
            .append("ul")
            .attr("class", "dropdown-menu")
            .selectAll("li")
            .data(function(problemConfig) { return problemConfig.problems; })
            .enter()
            .append("li")
            .append("a")
            .text(function(problem) { return problem.title; })
            .attr("class", function(problem) {
                var foundProblem = false;
                for (var category in problemIdsByCategory) {
                    if (problemIdsByCategory[category].indexOf(problem.id) !== -1) {
                        foundProblem = true;
                    }
                }
                if (foundProblem) {
                    return "uuid_" + problem.id + " problem-visited";
                }
                else {
                    return "uuid_" + problem.id;
                }
            })
            .on("click", onProblemStartCallback)
        ;
    }

    function getUsername() {
        return $("#__username").text();
    }

    // function hasRespondedToConsentForm() {
    //     return server_savedata && server_savedata.hasOwnProperty("consentResponse");
    // }
    //
    // function getConsentFormResponse() {
    //     return JSON.parse(server_savedata.consentResponse).response.toUpperCase();
    // }
    //
    // function showConsentFormModal() {
    //     // go modal
    //     var m = $("#consent-form-modal");
    //     m.modal({
    //           keyboard: false,
    //           backdrop: 'static'
    //     });
    //     m.modal("show");
    // }

    // Fill out the flash-style message and show it, if they've responded:
    // function updateConsentMessage() {
    //     if (csed.hasRespondedToConsentForm()) {
    //         d3.select("#consent-status").text(csed.getConsentFormResponse());
    //         d3.select("#consent-existed-message").classed("hidden", false);
    //     }
    // }

    // function installConsentFormModal() {
    //     updateConsentMessage();
    //
    //     d3.select("#age-input").on("input", function () {
    //         var age = d3.select("#age-input").property("value");
    //         // if ($.isNumeric(age) && Math.floor(age) > 17) {
    //         // GUH. remove the attribute by passing null. Passing false leaves the attribute there,
    //         //      which leaves the element disabled.
    //             d3.select("#consent-form-agree").attr("disabled", null);
    //         // } else {
    //         //    d3.select("#consent-form-agree").attr("disabled", true);
    //         // }
    //     });
    //     $("#age-input").keypress(function(e){
    //         if(e.keyCode===13 && !d3.select("#consent-form-agree").attr("disabled")) {
    //             $('#consent-form-agree').click();
    //         }
    //     });
    // }

    // function sendConsentFormAgree() {
    //     sendConsentFormResponse($("#__consent-form-agree-data").text());
    // }
    //
    // function sendConsentFormDisagree() {
    //     sendConsentFormResponse($("#__consent-form-disagree-data").text());
    // }
    //
    // function sendConsentFormResponse(data) {
    //     console.log("Sending consent data: " + data);
    //
    //     Logging.log_event_with_promise({
    //         type: Logging.ID.Consent,
    //         detail: data
    //     }, true).then(function() {
    //         console.info("successfully logged consent response.");
    //         consentFormResponseSuccess(data);
    //     });
    // }

    // function consentFormResponseSuccess(data) {
    //     server_savedata.consentResponse = data;
    //     Logging.save_user_data(server_savedata);
    //     updateConsentMessage();
    //     //checkForLabRedirect(); // not part of current experiment
    // }

    function checkForLabRedirect() {
        if (getQueryVariable("lab") === "true" && experimental_condition === 2) {
            var labNo = getQueryVariable("labNo");
            switch (labNo) {
                case "2":
                    window.location.href = window.location.origin + window.location.pathname + "lab_files/lab2-expressions-exercises.shtml";
                    break;
                case "4":
                    window.location.href = window.location.origin + window.location.pathname + "lab_files/lab4-ifelse-exercises.shtml";
                    break;
                case "7":
                    window.location.href = window.location.origin + window.location.pathname + "lab_files/lab7-array-exercises.shtml";
                    break;
                default:
                    throw new Error("lab number " + labNo + " not supported");
            }
        }
    }

    function determineEnabledCategories() {
        if (getQueryVariable("lab") === "true") {
            var labNo = getQueryVariable("labNo");
            switch (labNo) { // all labs using Practicum in current experiment
                case "2":
                    //if (experimental_condition === 1) {
                        enabledCategories = ["lab2-expressions"];
                    //}
                    break;
                case "4":
                    //if (experimental_condition === 1) {
                        enabledCategories = ["lab4-if_else"];
                    //}
                    break;
                case "7":
                    //if (experimental_condition === 1) {
                        enabledCategories = ["lab7-array"];
                    //}
                    break;
                default:
                    throw new Error("lab number " + labNo + " not supported");
            }
        } else {
            enabledCategories = ["default-expressions", "default-if_else", "default-array"];
        }
    }

    return {
        "addProblemsToNav": addProblemsToNav,
        "addProblemsContentToLandingPage": addProblemsContentToLandingPage,
        "getUsername": getUsername,
        // "hasRespondedToConsentForm": hasRespondedToConsentForm,
        // "getConsentFormResponse": getConsentFormResponse,
        "hasProblemToLoad": hasProblemToLoad,
        // "installConsentFormModal": installConsentFormModal,
        "getProblemToLoad": getProblemToLoad,
        "loadProblem": loadProblem,
        // "sendConsentFormAgree": sendConsentFormAgree,
        // "sendConsentFormDisagree": sendConsentFormDisagree,
        "setProblemToLoad": setProblemToLoad,
        "setupLogging": setupLogging,
        // "showConsentFormModal": showConsentFormModal,
        "showHome": showHome,
        "checkForLabRedirect": checkForLabRedirect,
        "determineEnabledCategories": determineEnabledCategories
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
    var forceUser = getQueryVariable("username");
    if (forceUser) {
        username = forceUser;
    }

    // start logging system
    csed.setupLogging(username).then(function() {
        // csed.installConsentFormModal();
        // if (!csed.hasRespondedToConsentForm()) {
        //     csed.showConsentFormModal(); // will check for lab redirect after consent response
        // } else {
        //     //csed.checkForLabRedirect(); // not part of current experiment
        // }

        // set up home link
        d3.select("#home-link")
            .on("click", csed.showHome);

        csed.determineEnabledCategories();

        // pull in problems
        $.getJSON("include/categoryConfig.json", function (categoryConfig) {
            if (!categoryConfig) {
                console.error("Unable to load problem configuration: need .../public/categoryConfig.json");
            } else {
                // add next problem pointers
                categoryConfig.forEach(function (category) {
                    for(var i = 0; i < category.problems.length; i++) {
                        category.problems[i].nextProblem = category.problems[i + 1];
                        category.problems[i].category = category.category;
                    }
                });

                csed.addProblemsToNav(categoryConfig, onProblemStart);
                csed.addProblemsContentToLandingPage(categoryConfig, onProblemStart);

                if (csed.hasProblemToLoad(categoryConfig)) {
                    var problem = csed.getProblemToLoad(categoryConfig);
                    csed.loadProblem(problem);
                } else {
                    csed.showHome();
                }
            }
        })
        .fail(function () {
            console.error("Unable to load problem configuration: need .../public/categoryConfig.json");
        });
    }, function(error) {
        console.error(error);
        // if logging fails, just terminate initialization and print an error message
        $('#main-page').html('<p>Uh oh! There appears to be a problem with the server!</p><p>Our apologies, please report this with <a href="https://catalyst.uw.edu/umail/form/aaronb22/4553">our feedback form</a> and we\'ll get it fixed ASAP.</p>');
        d3.select("#main-page").classed("hidden", false);
    });
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
