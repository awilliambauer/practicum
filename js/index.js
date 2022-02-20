// Parameter names for specific problem category and id
const CATEGORY_PARAMETER = "category";
const PROBLEM_ID_PARAMETER = "problem";

// from https://css-tricks.com/snippets/javascript/get-url-variables/
// doesn't handle every valid query string, but should work for our purposes
function getQueryVariable(variable)
{
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (let v of vars) {
        var pair = v.split("=");
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

    var fading_level = 1;

    var ENABLE_TELEMETRY_LOGGING = false;

    let problem_types = {
      problem_types: ["whileLoop", "if_else", "forLoop", "nested"],
      enabled_categories: [
        "default-whileLoop",
        "default-if_else",
        "default-forLoop",
        "default-nested",
      ],
    };
    
    function setupLogging(username) {
        var enabled_problem_types = problem_types.problem_types;
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
                            array: 0,
                            nested: 0,
                        },
                        problemIdsByCategory: {
                            expressions: [],
                            if_else: [],
                            array: [],
                            nested: []
                        }
                    };
                }
                numProblemsByCategory = server_savedata.numProblemsByCategory;
                problemIdsByCategory = server_savedata.problemIdsByCategory;
                for (let problem_type of enabled_problem_types) {
                    if (!numProblemsByCategory[problem_type]) numProblemsByCategory[problem_type] = 0;
                }
                for (let problem_type of enabled_problem_types) {
                    if (!problemIdsByCategory[problem_type]) problemIdsByCategory[problem_type] = [];
                }

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
                array: 0,
                nested: 0
            }
            for (let i = 0; i < enabled_problem_types.length; i++) {
                if (!numProblemsByCategory[enabled_problem_types[i]]) numProblemsByCategory[enabled_problem_types[i]] = 0;
            }
            problemIdsByCategory = (window.localStorage.problemIdsByCategory && JSON.parse(window.localStorage.problemIdsByCategory)) || {
                expressions: [],
                if_else: [],
                array: [],
                nested: []
            }
            for (let i = 0; i < enabled_problem_types.length; i++) {
                if (!problemIdsByCategory[enabled_problem_types[i]]) problemIdsByCategory[enabled_problem_types[i]] = [];
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
        for (let i in categoryConfig) {
            let category = categoryConfig[i];
            if (category.category == requestedCategory) {
                let problems = category['problems'];
                for (let j in problems) {
                    let problem = problems[j];
                    if (problem.id === requestedProblemId) {
                        return problem;
                    }
                }
            }
        }
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
        // Only initialize the results of the problems if they haven't been 
        // already initialized. Otherwise you will overwrite it.
        if (localStorage.getItem("init") == null) {
            localStorage.setItem("init", "true");
            let all_problems = enabledConfig.map(d => {
            return d.problems;
            })
            all_problems = all_problems.flat();
            let problem_results = all_problems.map(problem => {
                return {
                    "problem": problem,
                    "guided": false,
                    "independent": false
                }
            })
            localStorage.setItem("problem_results", JSON.stringify(problem_results));
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
                let results = JSON.parse(localStorage.getItem("problem_results"));
                let c = "";
                var foundProblem = false;
                for (var category in problemIdsByCategory) {
                    if (problemIdsByCategory[category].indexOf(problem.id) !== -1) {
                        foundProblem = true;
                    }
                }
                if (foundProblem) {
                    c += "uuid_" + problem.id + " list-group-item problem-visited problem-item";
                }
                else {
                    c += "uuid_" + problem.id + " list-group-item problem-item";
                }
                results.forEach(result => {
                    if (result.problem.id === problem.id) {
                        if (result.guided) {
                            c += " problem-guided-complete";
                        }
                        if (result.independent) {
                            c += " problem-interactive-complete";
                        }
                    }
                })
                return c;
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

    function setFadingLevel(selection) {
        if (selection === "Guided") {
          fading_level = 0;
        } else if (selection === "Independent") {
            
          fading_level = 1;
          
        }
        
    }

    function modalFadingLevel(problemConfig, callback_obj, initial_state, problemUI) {
        // Get Modal
        var modal = document.getElementById("fading-level-modal");
        modal.style.display = "block";

        // Prevents keypresses while modal is open
        $(document).off("keydown");

        // Get the button that closes the modal
        var doneBtn = document.getElementById("doneBtn");

        // When user clicks button, set the fading level and close the modal
        doneBtn.onclick = function () {
            let selection = d3.select('input[name="difficulty-level"]:checked').node().value;
            
            setFadingLevel(selection);
            modal.style.display = "none";
            d3.select("#difficultyLevel").append("span").html(`Difficulty level: ${selection}`);
            problemUI.initialize(problemConfig, callback_obj, initial_state, task_logger, fading_level);
        };
        
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
    
    // Pushes the identifier of the problem into the browser's url
    function setUrlArgs(problem) {
        const url = new URL(window.location);
        url.searchParams.set(CATEGORY_PARAMETER, problem.category);
        url.searchParams.set(PROBLEM_ID_PARAMETER, problem.id);
        window.history.replaceState({}, '', url);
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
        
        setUrlArgs(problemConfig);
        saveProblemData(problemConfig);
        updateProblemDisplay(problemConfig);

        // remove the old problem from the DOM
        d3.selectAll("#problem-container .problem").remove();

        var problemUI = csed.controller;

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

            // The modal will determine the fading level and then call problemUI.initialize() 
            // once the Done button is pressed. That's why it takes in all of 
            // problemUI.initialize()'s arguments.
            modalFadingLevel(problemConfig, new CallbackObject(), initial_state, problemUI);
            
            // This problemUI initialize call probably needs to happen after the main_sim init call,
            // which is handled by promises/then() with fetch.

            console.log(problemConfig);
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
                    return "uuid_" + problem.id + " problem-visited problem-item";
                }
                else {
                    return "uuid_" + problem.id + " problem-item";
                }
            })
            .on("click", onProblemStartCallback)
        ;
    }

    function getUsername() {
        return $("#__username").text();
    }

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
            enabledCategories = problem_types.enabled_categories;
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

// Checks for arguments in the URL asking for a specific problem
function checkForSpecificProblemUrlParameters() {
    const category_value = getQueryVariable(CATEGORY_PARAMETER);
    const problem_id_value = getQueryVariable(PROBLEM_ID_PARAMETER);
    if (category_value && problem_id_value) {
        csed.setProblemToLoad(category_value, problem_id_value);
    }
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
    
    //TODO:
    // Detect change in active history entry. Only triggered by browser actions or by calling history.back()
    // https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
    // $(window).on('popstate', function() {
    //     location.reload(true); // Reload the page to load the problem that was navigated back to.
    // });      

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
    
    // Check for parameters in url
    checkForSpecificProblemUrlParameters();
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

            let multiTg = function() {
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

            let resizeFix = function() {
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
