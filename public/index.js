/**
 * Created by Alicheae on 4/20/2015.
 */

// Make a little global that categories can decorate.
var csed = (function() {
    return {};
}) ();

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

    var username = getUsername();
    var hasResponded = hasRespondedToConsentForm();

    installConsentFormModal();
    if (!hasResponded) {
        showConsentFormModal();
    }

    // set up home link
    d3.select("#home-link").on("click", showHome);


    // pull in problems
    var categoryConfig;
    d3.json("categoryConfig.json", function(error, json) {
        if (error) return console.warn(error);
        categoryConfig = json;
        addProblemsToNav(categoryConfig);
        addProblemsContentToLandingPage(categoryConfig);

        var queryParams = getUrlVars();
        if (queryParams.hasOwnProperty('category') && queryParams.hasOwnProperty('problem')) {
            var requestedCategory = queryParams['category'];
            var requestedProblemId = queryParams['problem'];

            var locatedProblem = findProblem(categoryConfig, requestedCategory, requestedProblemId);

             if (locatedProblem == null) {
                 // TODO make a real bootstrap alert.
                 alert("Can't find problem " + requestedProblemId + " in category " + requestedCategory);
             } else {
                 loadProblem(locatedProblem);
             }
        }
        d3.select("#main-page").classed("hidden", false);

    });

});

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

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
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
        .attr("href", function(problem) { "#?category=" + problem.category + "&problem=" + problem.id } )
        .text(function(problemConfig) { return problemConfig.title; })
        .on("click", loadProblem)
    ;
}

function loadProblem(problemConfig) {

    // gah, change the url? even with a link to it? silly.
    window.location.hash = "?category=" + problemConfig.category + "&problem=" + problemConfig.id;

    // remove the old problem from the DOM
    d3.select("#problem-area").remove();

    // reset any global state in the category js runner
    if (csed.hasOwnProperty(problemConfig.category)) {
        csed[problemConfig.category].reset();
    }

    // Load in the template for the problem
    d3.html(problemConfig.url, function(error, problemHtml) {
        if (error) return console.warn(error);

        // Uh, not sure why I can't append raw html into the dom with D3. Using jQuery for the moment...
        //d3.select("#problem").append(problemHtml);
        $("#problem").append(problemHtml);

        console.log("problem html = " + problemHtml);

        d3.select("#main-page").classed("hidden", true);
        d3.select("#problem").classed("hidden", false);

        var category = problemConfig.category;

        // bleh, I need a variable with all the category runners in it.
        // Here, I'm just using the expressions global because I know what that name is...
        //expressions.initialize();
        if (csed.hasOwnProperty(category)) {
            csed[category].initialize(problemConfig);
        }
        //expressions.initialize(problemConfig);
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
        .attr("href", function(problem) { "#?category=" + problem.category + "&problem=" + problem.id } )
        .text(function(problem) { return problem.title; })
        .on("click", loadProblem )
    ;
}

function name(elm) {
    return elm.name;
}

function getUsername() {
    return $("#__username").text();
}

var cookieKeyPrefix = "csed-consent-form-";

/**
 * Checks cookies to see whether they've responded?
 *
 * @returns {boolean}
 */
function hasRespondedToConsentForm() {
    // Looks like poor boolean zen, necessary because string "false"
    // evaluates to true.
    var cookieKey = cookieKeyPrefix + getUsername();
    return $.cookie(cookieKey) === true;
}

function showConsentFormModal() {
    // go modal
    $("#consent-form-modal").modal("show");
}

function installConsentFormModal() {
    d3.select("#age-input").on("input", checkAge);
}

function checkAge() {
    var age = d3.select("#age-input").property("value");
    if ($.isNumeric(age) && age >= 18) {
        // GUH. remove the attribute by passing null. Passing false leaves the attribute there,
        //      which leaves the element disabled.
        d3.select("#consent-form-agree").attr("disabled", null);
    } else {
        d3.select("#consent-form-agree").attr("disabled", true);
    }

}

function sendConsentFormAgree() {
    sendSurveyResponse($("#__consent-form-agree-data").text());
}

function sendConsentFormDisagree() {
    sendSurveyResponse($("#__consent-form-disagree-data").text());
}

function sendSurveyResponse(data) {
    console.log("Want to send data: " + data + ", assuming success");

    surveySuccess();
}

function surveySuccess() {
    var cookieKey = cookieKeyPrefix + getUsername();
    $.cookie(cookieKey, true)
}



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
