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

    $(".topnavContainer").append("<div id='cssmenu' class='container-fluid'>");
    $(".container-fluid").append("<ul id='navlinks' class='topnav'>");

    $("#navlinks").append("<li id='home_icon' class='active'>");
    $("#navlinks").append("<li id='expressions' class='active'>");
    $("#navlinks").append("<li id='ifelse' class='active'>");
    $("#navlinks").append("<li id='arraymystery' class='active'>");

    $("#home_icon").append("<a href='index.html' class='topnav_home' title='Home'>&nbsp;</a>");
    $("#expressions").append("<a href='#' class='topnav_expressions' title='Expressions'>Expressions</a>");
    $("#ifelse").append("<a href='#' class='topnav_ifelse' title='If/Else'>If/Else</a>");
    $("#arraymystery").append("<a href='#' class='topnav_array' title='Array Mystery'>Array Mystery</a>");

    $("#expressions").append("<ul id='expressionproblems'>");
    $("#expressionproblems").append("<li><a href='expressions/index.html' class='topnav_expressions' title='Problem 1'>Problem 1</a></li>");

    $("#ifelse").append("<ul id='ifelseproblems'>");
    $("#ifelseproblems").append("<li><a href='if_else/index.html' class='topnav_ifelse' title='Problem 1'>Problem 1</a></li>");

    $("#arraymystery").append("<ul id='arrayproblems'>");
    $("#arrayproblems").append("<li><a href='arrayMystery/index.html' class='topnav_array' title='Problem 1'>Problem 1</a></li>");
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
