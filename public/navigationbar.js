/**
 * Created by Varun on 4/28/2015.
 */
$(document).ready(function() {

    "use strict";
    $(".topnavContainer").append("<div class='container-fluid'>");
    $(".container-fluid").append("<ul class='navlinks topnav'>");
    $(".navlinks").append("<li class='home_icon'>");
    $(".navlinks").append("<li class='expressions'>");
    $(".navlinks").append("<li class='ifelse'>");
    $(".navlinks").append("<li class='arraymystery'>");
    $(".home_icon").append("<a href='../index.html' class='topnav_home' title='Home'>&nbsp;</a>");
    $(".expressions").append("<a href='../expressions/index.html' class='topnav_expressions' title='Expressions'>Expressions</a>");
    $(".ifelse").append("<a href='../if_else/index.html' class='topnav_ifelse' title='If/Else'>If/Else</a>");
    $(".arraymystery").append("<a href='../arrayMystery/index.html' class='topnav_array' title='Array Mystery'>Array Mystery</a>");


});
