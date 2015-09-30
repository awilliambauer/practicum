/*
Lecture Slides Javascript functions
Author: Marty Stepp
*/



var COLLAPSE_MULTIPLE_SPACES = false;  // treat many spaces as a single space for diffing expressions?
var NBSP_CHAR_CODE = 160; // character code for non-breaking space (grr Safari)
var LINE_SEPARATOR = "\n";
var LINE_SEPARATOR_OUTPUT = "\n";
var DEFAULT_SPACES_PER_TAB = 3;
var DEFAULT_TAB_STRING = "   ";
var TAB_STRING = DEFAULT_TAB_STRING;

if (typeof($) === "undefined") {
    $ = function(id) {
        return document.getElementById(id);
    };
}

if (!window.observe) {
    window.observe = function(name, fn) {
        // addOnLoad(fn);
        
        // run right away, for inserted js code
        fn();
    };
    document.observe = function(name, fn) {
        fn();
    }
}

// attaches a window onload handler
function addOnLoad(fn) {
    if (window.addEventListener) {
        window.addEventListener("load", fn, false);
    } else if (window.attachEvent) {
        window.attachEvent("onload", fn);
    }
}


addOnLoad(slidesWindowLoad);

// fills in all expressions with the right answers
function solveAll() {
    $$(".expressionanswer").each(function(element) {
        element.value = getCorrectAnswer(element);
        checkCorrect(element, null, true);
    });
}

// sets up some links to open in a new window.
function slidesWindowLoad() {
    var links = document.getElementsByTagName("a");
    for (var i = 0; i < links.length; i++) {
        if (links[i].className && 
            (links[i].className.indexOf("newwindow") >= 0 ||
             links[i].className.indexOf("popup") >= 0)) {
            // links[i].value = links[i].href;
            // links[i].href = "#";
            // links[i].onclick = loadLinkNewWindow;
            links[i].target = "_blank";
        }
    }
}


addOnLoad(function() {
    $$(".expressionanswer").each(function(element) {
        element.observe("change", expressionChange);
        element.observe("keydown", expressionChangeLater);
    });

    // multiple choice problems
    $$(".mcquestion input").each(function(element) {
        element.observe("change", multipleChoiceChange);
    });
    
    $$(".mcquestion").each(function(element) {
        if (element.hasClassName("shuffle")) {
            // shuffle choices
            var lis = element.select("li");
            for (var i = 0; i < lis.length; i++) {
                lis[i].remove();
            }
            shuffle(lis);
            for (var i = 0; i < lis.length; i++) {
                element.appendChild(lis[i]);
            }
        }
    });
    
    var exerciseCount = 0;
    $$(".exercisenumber").each(function(element) {
        if (!element.hasClassName("noincrement")) {
            exerciseCount++;
        }
        element.update(exerciseCount);
    });
});

function expressionChange(event) {
    checkCorrect(this, event);
    return true;
}

var checkTimer = null;

function expressionChangeLater(event) {
    this.stale = true;
    var that = this;
    var func = function() {
        checkTimer = null;
        if (that.stale) {
            checkCorrect(that, event);
        }
    };
    
    if (checkTimer) {
        clearTimeout(checkTimer);
    }
    checkTimer = setTimeout(func, 200);
    return true;
}

function getCorrectAnswer(element) {
    var parent = element.up(".expressionarea");
    if (!parent) {
        // BUGFIX: first fallback: go up to table cell if in an assertion problem
        parent = element.up(".assertiontable td");
    }
    if (!parent) {
        // second fallback: go up to containing table row
        parent = element.up("tr");
    }
    var correctAnswer = htmlDecode(trim(getTextContent(parent.select(".expressionsolution")[0])));
    return correctAnswer;
}

//check whether the given element's answer is correct;
//apply a "correct" or "incorrect" style appropriately
function checkCorrect(element, event, skipSound) {
    var parent = element.up(".expressionarea");
    if (!parent) {
        // BUGFIX: first fallback: go up to table cell if in an assertion problem
        parent = element.up(".assertiontable td");
    }
    if (!parent) {
        // second fallback: go up to containing table row
        parent = element.up("tr");
    }
    var correctAnswer = htmlDecode(trim(getTextContent(parent.select(".expressionsolution")[0])));
    var studentAnswer = trim(element.value);

    var ignorePattern = "";

    var ignoreElement = parent.select(".ignore");
    if (ignoreElement && ignoreElement.length > 0) {
        ignorePattern = htmlDecode(getTextContent(ignoreElement[0]));
    }

    // collapse groups of multiple spaces into a single space
    // (useful for inheritance mystery problems)
    if (COLLAPSE_MULTIPLE_SPACES) {
        correctAnswer = correctAnswer.replace(/[ ]+/gi, " ");
        studentAnswer = studentAnswer.replace(/[ ]+/gi, " ");
    }

    // strip trailing spaces on lines
    correctAnswer = correctAnswer.replace(/[ ]+\r?\n/gi, LINE_SEPARATOR_OUTPUT);
    studentAnswer = studentAnswer.replace(/[ ]+\r?\n/gi, LINE_SEPARATOR_OUTPUT);

    // replace "ignore" pattern with empty
    if (ignorePattern) {
        var ignoreRegExp = new RegExp(ignorePattern, "gi");
        correctAnswer = correctAnswer.replace(ignoreRegExp, "");
        studentAnswer = studentAnswer.replace(ignoreRegExp, "");
    }

    // some problems' XML specifies that they should ignore capitalization
    if (element.hasClassName("ignorecase")) {
        correctAnswer = correctAnswer.toLowerCase();
        studentAnswer = studentAnswer.toLowerCase();
    }

    // some questions ignore all whitespace (e.g. section 2 #4)
    var correctAnswerNoWhitespace = correctAnswer.replace(/\s+/gi, "");
    var studentAnswerNoWhitespace = studentAnswer.replace(/\s+/gi, "");

    var correctAnswerNoType = correctAnswerNoWhitespace.toLowerCase().replace(/\"/g, "").replace(/\.0|\.$/g, "");
    var studentAnswerNoType = studentAnswerNoWhitespace.toLowerCase().replace(/\"/g, "").replace(/\.0|\.$/g, "");

    /*
    if (!event.shiftKey) {
        alert("correctAnswer = " + getDumpText(correctAnswer, true));
        alert("studentAnswer = " + getDumpText(studentAnswer, true));
        alert("correctAnswer == studentAnswer? " + (correctAnswer == studentAnswer));
    }

    if (event && (event.type == "keydown" || event.type == "keypress")) {
        // these events occur before the keypress
        if (event.charCode) {
            studentAnswer += String.fromCharCode(event.charCode);
        }
    }
    */
    
    var correct = true;
    var almost  = studentAnswerNoType == correctAnswerNoType;
    var changed = false;
    
    var td = element.up(".expressionarea");
    if (!td) {
        td = element.up("td");
    }
    if (!td) {
        td = parent;
    }
    
    if (!studentAnswer) {
        // blank
        element.removeClassName("correct");
        element.removeClassName("incorrect");
        element.removeClassName("almost");
        td.removeClassName("correct");
        td.removeClassName("incorrect");
        td.removeClassName("almost");
        correct = false;
    } else if (studentAnswer == correctAnswer || (COLLAPSE_MULTIPLE_SPACES && correctAnswerNoWhitespace && 
            studentAnswerNoWhitespace == correctAnswerNoWhitespace)) {
        // right answer
        if (!td.hasClassName("correct")) {
            changed = true;
        }
        element.addClassName("correct");
        element.removeClassName("incorrect");
        element.removeClassName("almost");
        td.addClassName("correct");
        td.removeClassName("incorrect");
        td.removeClassName("almost");
    } else if (almost) {
        // nearly correct answer (wrong type, etc.)
        if (!td.hasClassName("almost")) {
            changed = true;
        }
        element.addClassName("almost");
        element.removeClassName("correct");
        element.removeClassName("incorrect");
        td.addClassName("almost");
        td.removeClassName("correct");
        td.removeClassName("incorrect");
		correct = false;
    } else {
        // wrong answer
        if (!td.hasClassName("incorrect")) {
            changed = true;
        }
        element.addClassName("incorrect");
        element.removeClassName("correct");
        element.removeClassName("almost");
        td.addClassName("incorrect");
        td.removeClassName("correct");
        td.removeClassName("almost");
        correct = false;
    }
    
    element.stale = false;
    return correct;
}

function getTextContent(element) {
    if (element.textContent !== undefined) {
        return element.textContent;
    } else if (element.innerText !== undefined) {
        return element.innerText;
    } else {
        return null;
    }
}

function multipleChoiceChange(event) {
    this.up(".mcquestion").select("input").each(function(input) {
        if (input.checked) {
            mcCheck(input);
        } else {
            mcUncheck(input);
        }
    });
}

function mcCheck(input) {
    // var img = input.next(".mcresultimage");
    // img.style.visibility = "visible";
    // img.style.display = "inline";
    // img.show();
    
    var mcq = input.up(".mcquestion");
    if (typeof(mcq.guesses) === "undefined") {
        mcq.guesses = 1;
    } else {
        mcq.guesses++;
    }
    mcq.title = "You have made " + mcq.guesses + " guess" + (mcq.guesses > 1 ? "es" : "") + " so far.";
    
    var label = input.up("label");
    label.className = "";
    if (input.hasClassName("mccorrect")) {
        label.className = "correct";
    } else {
        label.className = "incorrect";
    }
}

function mcUncheck(input) {
    // var img = input.next(".mcresultimage");
    // if (img.visible()) {
        // img.style.visibility = "hidden";
    //     img.style.display = "none";
    //     img.hide();
    // }

    var label = input.up("label");
    if (label) {
        label.className = "";
    }
}



// prints out all properties of the given object
function dump(obj, verbose) {
    var dumpTarget = $("dumptarget");
    if (dumpTarget) {
        setTextContent(dumpTarget, getDumpText(obj, verbose));
        dumpTarget.style.display = "block";
        scrollTo(dumpTarget);
    } else {
        alert(getDumpText(obj, verbose));
    }
}

function setTextContent(element, value) {
    element.textContent = value;
    element.innerText = value;
}

// returns text of all properties of the given object
function getDumpText(obj, verbose) {
    var text = "";
    if (obj === undefined) {
        text = "undefined";
    } else if (obj === null) {
        text = "null";
    } else if (typeof(obj) == "string") {
        var result = "string(length=" + obj.length + "): \n\"" + obj + "\"";
        if (verbose) {
            // display details about each index and character
            for (var i = 0; i < Math.min(10000, obj.length); i++) {
                if (i % 5 == 0) {
                     result += "\n";
                }
                result += "  " + padL("" + i, 3) + ": " + padL(toPrintableChar(obj.charAt(i)), 2) + "    ";
            }
        }
        return result;
    } else if (typeof(obj) != "object") {
        return typeof(obj) + ": " + obj;
    } else {
        text = "object {";
        var props = [];
        for (var prop in obj) {
            props.push(prop);
        }
        props.sort();
        
        for (var i = 0; i < props.length; i++) {
            var prop = props[i];
            try {
                if (prop == prop.toUpperCase()) { continue; }  // skips constants; dom objs have lots of them
                text += "\n  " + prop + "=";
                if (prop.match(/innerHTML/)) {
                    text += "[inner HTML, omitted]";
                } else if (obj[prop] && ("" + obj[prop]).match(/function/)) {
                    text += "[function]";
                } else {
                    text += obj[prop];
                }
            } catch (e) {
                text += "error accessing property '" + prop + "': " + e + "\n";
            }
        }
        
        if (text[text.length - 1] != "{") {
            text += "\n";
        }
        text += "}";
    }
    return text;
}


function loadLinkNewWindow() {
    window.open(this.value);
}

function htmlEncode(text) {
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt;");
    // text = text.replace(/ /g, "&nbsp;");
    return text;
}

function evaluateHTML(inId, outId) {
    var html = document.getElementById(inId).value;
    document.getElementById(outId).innerHTML = html;
}

function showAnswer(inId, outId) {
    var html = document.getElementById(inId).innerHTML;
    document.getElementById(outId).innerHTML = "<textarea style='width:100%; word-wrap: break-word;' wrap='logical' rows='8' cols='40'>" + htmlEncode(html) + "</textarea>";
}

function showAnswerAndHide(inId, outId) {
    var inElement = document.getElementById(inId);
    var html = inElement.innerHTML;
    inElement.style.visibility = 'hidden';
    inElement.style.height = '0px';
    
    var outElement = document.getElementById(outId);
    outElement.innerHTML = "<textarea style='width:100%; word-wrap: break-word;' wrap='logical' rows='16' cols='40'>" + htmlEncode(html) + "</textarea>";
    outElement.style.visibility = 'inherit';
}

function showExpected(inId, outId) {
    var outElement = document.getElementById(outId);
    outElement.style.visibility = 'hidden';
    outElement.style.height = '0px';

    var inElement = document.getElementById(inId);
    var html = inElement.innerHTML;
    inElement.style.visibility = 'inherit';
    inElement.style.height = 'auto';
}

function evaluateHTMLandShow(inId, answerId, outId) {
    var html = document.getElementById(inId).value;
    
    var answerElement = document.getElementById(answerId);
    answerElement.style.visibility = 'hidden';
    answerElement.style.height = '0px';

    var outElement = document.getElementById(outId);
    outElement.innerHTML = html;
    outElement.style.visibility = 'inherit';
}

// Rearranges the contents of the given array into random order.
function shuffle(array) {
    for (var i = 0; i < array.length - 1; i++) {
        var j = Math.floor(Math.random() * (array.length - i)) + i;
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}



// ------------------------------------------------
// taken from web programming step by step JS files

// eval() wrapper that makes sure that 'this' is the global window object
// (important for injecting dynamically generated student code)
function evalCode(solutionText) {
    solutionText = solutionText.replace(
        /function[ \t\n]+([a-zA-Z0-9_$]+)[ \t\n]*/g,
        'window.$1 = function');
    solutionText = solutionText.replace(
        /var[ \t\n]+([a-zA-Z0-9_$]+)[ \t\n]*/g,
        'window.$1 ');
    eval(solutionText);
}


// unit of indentation used in code examples in the chapters
// (tabs in code are replaced by this)
// var INDENT = "  ";
var INDENT = "  ";

addOnLoad(chapterOnLoad);

function chapterOnLoad() {
    // var chapterOutlineArea = $("chapteroutline");
    // if (chapterOutlineArea) {
    //     chapterOutlineArea.appendChild(buildChapterOutline());
    // }
    // 
    // insertExampleNumbers(); 
    // insertFigureNumbers();
    // insertTableNumbers();
    // insertKeyTerms();

    // insertExampleOutput();

    // color alternating rows of tables
    var tables = document.getElementsByTagName("table");
    for (var i = 0; i < tables.length; i++) {
        if (!tables[i].className.match(/coloralternatingrows/) &&
                !tables[i].className.match(/standard/)) {
            continue;
        }
        
        var rows = tables[i].getElementsByTagName("tr");
        for (var j = 0; j < rows.length; j += 2) {
            // color every other row
            rows[j].className += " evenrow";
        }
    }
}

// Parses the given string of CSS style text and applies its styles to the given HTML DOM element.
function applyStylesFromText(text, element) {
    text = text.replace(/\n/gi, " ");
    var styles = text.split(/}/);
    
    for (var i = 0; i < styles.length; i++) {
        // grab selector and remove { }
        var lbrace = styles[i].indexOf("{");
        if (lbrace < 0) {
            continue;
        }
        
        var selectorsText = trim(styles[i].substring(0, lbrace));
        var rules = trim(styles[i].substring(lbrace));
        styles[i] = trim(styles[i] + "}");
        rules = trim(rules.replace(/{/gi, ""));

        // apply the style rule to all elements within the given element
        var elements = element.getElementsByTagName("*");
        var selectors = selectorsText.split(/[ ]*,[ ]*/gi);   // break apart the selector into pieces (tricky)

        // special case: styles that apply to the body of the page
        for (var j = 0; j < selectors.length; j++) {
            if (selectorIsBodyStyle(selectors[j])) {
                applyStyle(rules, element);
            }
        }
        
        for (var j = 0; j < selectors.length; j++) {
            var currentSelector = selectors[j];

            // look for context selectors (ugh)
            // direct context (e.g. ul > li;  a list item that is a DIRECT child of a ul)
            var directContext = currentSelector.split(/[ ]*>[ ]*/gi);
            if (directContext.length > 1) {
                // alert("direct context: " + styles[i]);
                applyStyleWithContext(rules, directContext, 0, elements, true);
                continue;
            } 
            
            // non-direct context (e.g. ul li;  a list item ANYWHERE inside a ul's descendents tree)
            var context = currentSelector.split(/[ ]+/gi);
            if (context.length > 1) {
                // alert("context: " + styles[i]);
                applyStyleWithContext(rules, context, 0, elements, false);
                continue;
            }
            
            // normal style; just apply to all elements
            for (var k = 0; k < elements.length; k++) {
                var currentElement = elements[k];

                // see which styles apply to this element
                if (selectorMatches(currentSelector, currentElement)) {
                    applyStyle(rules, currentElement);
                }
            }
        }
    }
}

// Applies a context style; Looks for elements that match the outer style(s), 
// then children that match the inner style.
function applyStyleWithContext(rules, selectorParts, startIndex, elements, direct) {
    for (var k = 0; k < elements.length; k++) {
        var currentElement = elements[k];

        // see which styles apply to this element
        if (selectorMatches(selectorParts[startIndex], currentElement)) {
            if (startIndex >= selectorParts.length - 1) {
                // all selectors match!  apply rule
                applyStyle(rules, currentElement);
            } else {
                // see whether rest apply
                var children = (direct) ? currentElement.childNodes : currentElement.getElementsByTagName("*");
                applyStyleWithContext(rules, selectorParts, startIndex + 1, children, direct);
            }
        }
    }
}

function applyStyle(rules, element) {
    // look for all properties in the style and apply them
    var props = rules.split(/;/);
    for (var i = 0; i < props.length; i++) {
        var nameValue = props[i].split(/:/);
        if (!nameValue || nameValue.length < 2) {
            continue;
        }

        var name = trim(nameValue[0]);
        var value = trim(nameValue[1]);

        // some property names like font-family have to be changed to proper JS names like fontFamily
        name = name.replace(/\-([a-z])/gi, function($1) { return $1.toUpperCase(); });
        name = name.replace(/-/gi, "");

        // some JS DOM property names are different than their CSS counterparts
        if (name == "float") {
            name = "cssFloat";
        }
        
        // disallow fixed position (make it absolute)
        if (name == "position" && value == "fixed") {
            value = "absolute";
        }

        // alert("set " + name + " to " + value);
        element.style[name] = value;
    }
}

// Returns true if the given CSS selector string matches the given element.
function selectorMatches(selector, element) {
    if (!element.tagName) {
        // some text or attribute node
        return false;
    }
    
    var selectorTag = "";
    var selectorId = "";
    var selectorClass = "";

    // look for a tag (anything else before . or #)
    selectorTag = selectorGetTag(selector);
    if (selectorTag && element.tagName && selectorTag != element.tagName.toLowerCase()) {
        // rule doesn't apply to this element
        // alert("style:\n" + style + "\n\ndoesn't apply to element:\n" + element + " " + element.tagName + "\n(wrong tag " + selectorTag + ")");
        return false;
    }

    // look for a class (.)
    if (!selectorClass) {
        selectorClass = selectorGetClass(selector);
    }
    if (selectorClass && !hasClass(element, selectorClass)) {
        // rule doesn't apply to this element
        // alert("style:\n" + style + "\n\ndoesn't apply to element:\n" + element + "\n(missing class " + selectorClass + ")");
        return false;
    }

    // look for an id (#)
    selectorId = selectorGetId(selector);
    if (selectorId && selectorId != element.id) {
        // rule doesn't apply to this element
        // alert("style:\n" + style + "\n\ndoesn't apply to element:\n" + element + "\n(missing id " + selectorId + ")");
        return false;
    }

    // look for context (> or + or space)

    // if we get here, the rule must apply, so apply it!
    // alert("style:\n" + style + "\n\napplies to element:\n" + element + " " + element.tagName);
    return true;
}

function selectorGetClass(selector) {
    if (selector.indexOf(".") >= 0) {
        var classTokens = selector.split(/\./);
        return classTokens[classTokens.length - 1];
    } else {
        return null;
    }
}

function selectorIsBodyStyle(selector) {
    var selectorTag = selectorGetTag(selector);
    return selectorTag == "body" || selectorTag == "html";
}

function selectorGetId(selector) {
    if (selector.indexOf("#") >= 0) {
        var idTokens = selector.split(/#/);
        return idTokens[idTokens.length - 1];
    } else {
        return null;
    }
}

function selectorGetTag(selector) {
    var selectorId = selectorGetId(selector);
    if (selectorId) {
        var idTokens = selector.split(/#/);
        if (idTokens.length > 1) {
            return idTokens[0];
        } else {
            return null;
        }
    }
    
    var selectorClass = selectorGetClass(selector);
    if (selectorClass) {
        var classTokens = selector.split(/\./);
        if (classTokens.length > 1) {
            return classTokens[0];
        } else {
            return null;
        }
    }
    
    return selector;
}

// looks for all examples and inserts their "output" into the appropriate div
function insertExampleOutput() {
    var pre = document.getElementsByTagName("pre");
    for (var i = 0; i < pre.length; i++) {
        fixIndentation(pre[i]);
    }

    var exampleCodes = getElementsByClassName("pre", "examplecode");
    for (var i = 0; i < exampleCodes.length; i++) {
        var exampleCode = exampleCodes[i].innerHTML;
        // fixIndentation(exampleCodes[i]);

        // replace tabs with spaces and re-insert back into examplecode element
        var indentedExampleCode = exampleCode.replace(/\t/gi, INDENT);
        if (browserIsIE()) {
            exampleCodes[i].innerText = fixPreLineBreaks(indentedExampleCode);
            // exampleCodes[i].outerHTML = fixPreLineBreaks(indentedExampleCode);
        } else {
            exampleCodes[i].innerHTML = indentedExampleCode;
        }
        
        // now let's possibly inject this example code into an output div below it...

        // remove emphasized code and errors from the output
        exampleCode = exampleCode.replace(/<span class=\"[^\"]*\">([^<]*)<\/span>/gi, "$1");
        exampleCode = exampleCode.replace(/<em([^>]*)>([^<]*)<\/em>/gi, "$2");
        exampleCode = exampleCode.replace(/<var([^>]*)>([^<]*)<\/var>/gi, "$2");

        // HTML decode
        exampleCode = htmlDecode(exampleCode);
        
        var exampleOutput = getSiblingByClassName("insertoutput", exampleCodes[i], "*");
        if (exampleOutput) {
            // if this is HTML example code, insert its output into an 'insertoutput' div if necessary
            if (hasClass(exampleCodes[i], "html") || hasClass(exampleCodes[i], "xhtml")) {
                exampleOutput.innerHTML = exampleCode + exampleOutput.innerHTML;
            } else if (hasClass(exampleCodes[i], "css")) {
                applyStylesFromText(exampleCode, exampleOutput);
            } else if (hasClass(exampleCodes[i], "js")) {
                evalCode(exampleCode);
            }
        }
    }
}

function fixIndentation(element) {
    if (!element) return;
    var html = element.innerHTML || element.textContent || element.innerText;

    // replace tabs with spaces and re-insert back into examplecode element
    if (html) {
        html = html.replace(/\t/gi, "    ");
    }
    var indented = html;
    
    if (browserIsIE()) {
        element.innerHTML = fixPreLineBreaks(indented);
        // element.outerHTML = fixPreLineBreaks(indented);
    } else {
        element.innerHTML = indented;
    }
}

// Returns true if the current web browser is MS IE 6 (aka, fucking piece of shit).
function browserIsIE6() {
    return browserIsIE() && navigator.appVersion.match(/MSIE 6.0/);
}

// Returns true if the current web browser is MS IE (aka, fucking piece of shit).
function browserIsIE() {
    return !!navigator.appName.match(/Microsoft Internet Explorer/);
}

// TODO: *** fix awful argument order to match getChildrenByClassName
function getElementByClassName(tagName, className, root) {
    return getElementsByClassName(tagName, className, root)[0];
}

function getElementsByClassName(tagName, className, root) {
    var elements;
    if (root) {
        elements = root.getElementsByTagName(tagName);
    } else {
        elements = document.getElementsByTagName(tagName);
    }
    var result = [];
    for (var i = 0; i < elements.length; i++) {
        if (hasClass(elements[i], className)) {
            result.push(elements[i]);
        }
    }
    return result;
}

function getSiblingByClassName(className, element, tagName) {
    var kids = element.parentNode.childNodes;
    for (var i = 0; i < kids.length; i++) {
        if (hasClass(kids[i], className) && isTagName(kids[i], tagName)) {
            return kids[i];
        }
    }
    return null;
}

// not very good
function htmlDecode(text) {
    text = text.replace(/&lt;/g, "<");
    text = text.replace(/&gt;/g, ">");
    text = text.replace(/&nbsp;/g, " ");
    text = text.replace(/&quot;/g, " ");
    text = text.replace(/&amp;/g, "&");
    return text;
}

function isTagName(element, tagName) {
    var nodeName = element.nodeName.toLowerCase();
    if (tagName) { tagName = tagName.toLowerCase(); }
    return !tagName || tagName == "*" || nodeName == tagName;
}

// deletes whitespace from front and end of string
function trim(str) {
    return ltrim(rtrim(str));
}

// deletes whitespace from front of string
function ltrim(str) {
    if (!str) { return str; }
    for (var k = 0; k < str.length && str.charAt(k) <= " "; k++) {}
    return str.substring(k, str.length);
}

// deletes whitespace from end of string
function rtrim(str) {
    if (!str) { return str; }
    for (var j = str.length - 1; j >= 0 && str.charAt(j) <= " "; j--) {}
    return str.substring(0, j + 1);
}

function padL(text, length) {
    if (text && text.length !== undefined) {
        while (text.length < length) {
            text = " " + text;
        }
    }
    return text;
}

var foofoo = false;


// fixes pre block line break problems when injecting innerHTML on IE6
// (Internet Explorer fucking sucks!)
// *** TODO: check whether this is needed on IE7  (yes, it is)
function fixPreLineBreaks(text) {
    if (browserIsIE()) {
        if (!foofoo) {
            alert("Using IE!");
            foofoo = true;
        }
        text = text.replace(/\n/g, "<br/>\n");
        text = text.replace(/\t/g, "    ");
        text = text.replace(/ /g, "&nbsp;");
        text = text.replace(/\r/g, "");
        text = "<pre>" + text + "</pre>";
    }
    return text;
}


/*
// builds a chapter outline by scraping the page for <h*> tags
function buildChapterOutline() {
    var elements = document.getElementsByTagName("*");
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        if (!el.tagName) {
            continue;
        }
        
        var tagName = el.tagName.toLowerCase();
        if (tagName != "h2" && tagName != "h3" && tagName != "h4") {
            continue;
        }
        
        // skip items inside a example
        var codeExample = getEnclosingElementByClassName("example", el, "div");
        if (codeExample) {
            continue;
        }
        
        // ID it so we can link to it
        if (!el.id) {
            el.id = "heading" + i;
        }
        
        // look for all <h2> -- <h4> elements and put them into overall lists
        var a = document.createElement("a");
        a.href = "#" + el.id;
        a.appendChild(document.createTextNode(getTextContent(el)));
        if (tagName == "h2") {
            if (!ul2) {
                var ul2 = document.createElement("ul");
            }
            var li2 = document.createElement("li");
            li2.appendChild(a);
            ul2.appendChild(li2);
            ul3 = undefined;
            // li2 = undefined;
        } else if (tagName == "h3") {
            if (!ul3) {
                var ul3 = document.createElement("ul");
                if (!li2) {
                    alert("Heading nesting error: h3 without h2\n" + getTextContent(el));
                }
                li2.appendChild(ul3);
            }
            var li3 = document.createElement("li");
            li3.appendChild(a);
            ul3.appendChild(li3);
            ul4 = undefined;
            // li3 = undefined;
        } else if (tagName == "h4") {
            if (!ul4) {
                var ul4 = document.createElement("ul");
                if (!li3) {
                    alert("Heading nesting error: h4 without h3\n" + getTextContent(el));
                }
                li3.appendChild(ul4);
            }
            var li4 = document.createElement("li");
            li4.appendChild(a);
            ul4.appendChild(li4);
            // li4 = undefined;
        }
    }

    return ul2;
}

function insertExampleNumbers() {
    var chapterNumber = document.title.replace(/[^\d]+/gi, "");
    
    insertNumbers("examplenumber", chapterNumber + ".", 1);
}

function insertFigureNumbers() {
    var chapterNumber = document.title.replace(/[^\d]+/gi, "");
    
    insertNumbers("figurenumber", chapterNumber + ".", 1);
}

function insertTableNumbers() {
    var chapterNumber = document.title.replace(/[^\d]+/gi, "");
    
    insertNumbers("tablenumber", chapterNumber + ".", 1);
}

function insertNumbers(className, prefix, initialNumber) {
    if (initialNumber === undefined) {
        initialNumber = 1;
    }

    var number = initialNumber;

    var elements = getElementsByClassName("*", className);
    for (var i = 0; i < elements.length; i++) {
        elements[i].innerHTML = prefix + number;
        number++;
    }
}


function insertKeyTerms() {
    var terms = getElementsByClassName("*", "term");

    // sort them
    var termsSorted = [];
    for (var i = 0; i < terms.length; i++) {
        termsSorted.push(getTextContent(terms[i]));
    }
    termsSorted.sort(caseInsensitiveCompareTo);
    
    var ul = $("keyterms");
    if (ul) {
        for (var i = 0; i < terms.length; i++) {
            var li = document.createElement("li");
            li.innerHTML = termsSorted[i];
            ul.appendChild(li);
        }
    }
}

function caseInsensitiveCompareTo(str1, str2) { 
    var a = String(str1).toUpperCase(); 
    var b = String(str2).toUpperCase(); 
    if (a > b) {
        return 1;
    } else if (a < b) {
        return -1;
    } else {
        return 0; 
    }
}








// *** I STOLE ALL CODE BELOW FROM GRADE-IT; MOST ALL OF IT IS NOT NEEDED *** //


// Shared JS functions for GradeIt.
var UPLOAD_TEXTFIELD_SIZE = 80;

// shortcut for document.getElementById, as used in Prototype and other JS frameworks.
function $(id) {
    return document.getElementById(id);
}

// shortcut for getElementsByClassName.  root parameter is optional.
function $$(className, root) {
    return getElementByClassName("*", className, root);
}

// stops an event from bubbling out (e.g. a form submission).
function abortBubble(event) {
    if (event && event.preventDefault) {
        event.preventDefault();
    }
    return false;
}

// stops an Enter keypress on a text field from submitting a form
function abortFormSubmit(event) {
    event = standardizeEvent(event);
    key = event.keyCode || event.which;
    if (key == 13) {  // user pressed Enter
        // don't let form submit
        return abortBubble(event);
    }
}

// Applies the given CSS class to the given element.
function addClass(element, className) {
    if (!hasClass(element, className)) {
        element.className += " " + className;
    }
}

// Removes the given CSS class from the given element.
function removeClass(element, className) {
    if (hasClass(element, className)) {
        var classes = getClasses(element);
        classes = arrayRemoveElement(classes, className);
        setClasses(element, classes);
    }
}

function ajaxFill(div, url) {
    ajaxHelper(url, function(ajax) {
        div.innerHTML = ajax.responseText;
    });
}

// Temporary; needs to be refactored to merge with ajaxHelper.
function ajaxPost(url, data, fn, errorFn) {
    // make it IE compatible (students don't have to do this)
    var ajax;
    if (window.XMLHttpRequest) {
        ajax = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        ajax = new ActiveXObject("Microsoft.XMLHTTP");
    }

    // the code that should be run when the request completes
    ajax.onreadystatechange = function() {
        if (ajax.readyState != 4) { return; }

        if ((ajax.status == 200 || (ajax.status == 0 && ajax.responseText)) && !pageHasError(ajax.responseText)) {
            if (fn) {
                fn(ajax);
            }
        } else {
            // something went wrong
            if (errorFn) {
                errorFn(ajax);
            } else {
                standardAjaxErrorFunction(ajax);
            }
        }
    };

    ajax.open("POST", url, true);   // asynchronous
    ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    // example:
    // ajax.send("id=1&user="+txtUser.value+"&password="+txtPassword.value);

    ajax.send(data);   // key=value pairs?
    return ajax;
}

// Fetches data using Ajax and calls the given function when it arrives.
// Optional third parameter specifies an object on which to call the function.
function ajaxHelper(url, fn, obj, errorFn, sync) {
    // make it IE compatible (students don't have to do this)
    var ajax;
    if (window.XMLHttpRequest) {
        ajax = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        ajax = new ActiveXObject("Microsoft.XMLHTTP");
    }

    sync = (sync) ? true : false;

    if (!sync) {
        // the code that should be run when the request completes
        ajax.onreadystatechange = function() {
            if (ajax.readyState != 4) { return; }

            if ((ajax.status == 200 || (ajax.status == 0 && ajax.responseText)) && !pageHasError(ajax.responseText)) {
                // request received successfully
                if (fn) {
                    if (obj) {
                        fn.apply(obj, [ajax]);
                    } else {
                        fn(ajax);
                    }
                }
            } else {
                // something went wrong
                if (errorFn) {
                    errorFn(ajax);
                } else {
                    standardAjaxErrorFunction(ajax, url);
                }
            }
        };
    }

    ajax.open("GET", url, !sync);   // default asynchronous
    ajax.send(null);
    return ajax;
}

function ajaxHelperSync(url, fn) {
    return ajaxHelper(url, fn, undefined, undefined, true);
}

function arrayCopy(array) {
    var newArray = [];
    for (var key in array) {
        newArray[key] = array[key];
    }
    return newArray;
}

function arrayIndexOf(array, element) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] == element) {
            return i;
        }
    }
    return -1;
}

function arrayRemove(array, index) {
    if (typeof(index) != "number") {
        return arrayRemoveElement(array, index);
    }
    var result = array.slice(0, index).concat(array.slice(index + 1));
    return result;
}

function arrayRemoveElement(array, element) {
    return arrayRemove(array, arrayIndexOf(array, element));
}

// converts a hash of [key -> value] query parameters into a url of form key1=value1&key2=value2&...
function buildQueryString(queryParams) {
    if (!queryParams) {
        queryParams = getQueryString();
    }
    var url = "";
    var first = true;
    for (var key in queryParams) {
        url += (first ? "" : "&") + key + "=" + queryParams[key];
        first = false;
    }
    return url;
}

// adds a hash of [key -> value] query parameters to the given URL and returns it
function buildUrl(baseUrl, queryParams) {
    if (!queryParams) {
        queryParams = getQueryString();
    }
    return baseUrl + "?" + buildQueryString(queryParams);
}

// taken from http://www.quirksmode.org/js/cookies.html
function cookieSet(name, value, days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
    }
    else {
        var expires = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function cookieExists(name) {
    return cookieGet(name) !== null;
}

function cookieGet(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1, c.length);
        }
        if (c.indexOf(nameEQ) == 0) {
            return c.substring(nameEQ.length,c.length);
        }
    }
    return null;
}

function cookieRemove(name) {
    setCookie(name, "", -1);
}

function countWithAttribute(name, value) {
    var count = 0;
    var all = document.getElementsByTagName("*");
    for (var i in all) {
        var element = all[i];
        if (element[name] == value) {
            count++;
        }
    }
    return count;
}

// creates a DOM node
function domNodeFromHtml(text) {
    var node = document.createElement("div");
    node.innerHTML = text;
    return node;
}

function dumpError(message) {
    var dumpTarget = $("dumptarget");
    if (dumpTarget) {
        setTextContent(dumpTarget, message);
        dumpTarget.style.display = "block";
        scrollTo(dumpTarget);
    }
}

function getAbsoluteY(element) {
    var y = 0;
    while (element && !isNaN(element.offsetTop)) {
        y += element.offsetTop;
        element = element.offsetParent;
    }
    return y;
}

function getChildByClassName(className, root, tagName) {
    return getChildrenByClassName(className, root, tagName)[0];
}

function getChildrenByClassName(className, root, tagName) {
    var kids = root.childNodes;
    var result = [];
    for (var i = 0; i < kids.length; i++) {
        if (hasClass(kids[i], className) && isTagName(kids[i], tagName)) {
            result.push(kids[i]);
        }
    }
    return result;
}

// Returns all CSS classes of the given DOM element as an array.
function getClasses(element) {
    return element.className.split(/\s+/);
}

function getElementValue(element) {
    var value;
    if (element.value) {
        value = element.value;
    } else if (element.innerHTML) {
        value = element.innerHTML;
    }
    return value;
}

// Returns the element that contains the given 'root' and whose
// CSS class contains the given class name (and optionally, whose
// HTML element type is the given tag name).  null if not found.
function getEnclosingElementByTagName(tagName, root) {
    if (root) {
        do {
            root = root.parentNode;
        } while (root && !isTagName(root, tagName));
    }
    return root;
}

// Returns the element that contains the given 'root' and whose
// CSS class contains the given class name (and optionally, whose
// HTML element type is the given tag name).  null if not found.
function getEnclosingElementByClassName(className, root, tagName) {
    if (root) {
        do {
            root = root.parentNode;
        } while (root && ((!tagName || !isTagName(root, tagName)) && !hasClass(root, className)));
    }
    return root;
}

// returns the current page's HTML query string parameters as a [key -> value] hash
function getQueryString(replacements) {
    var url = window.location.search.substring(1);
    var chunks = url.split(/&/);
    var hash = {};
    for (var i = 0; i < chunks.length; i++) {
        var keyValue = chunks[i].split(/=/);
        if (keyValue[0] && keyValue[1]) {
            hash[keyValue[0]] = keyValue[1];
        }
    }
    if (replacements) {
        for (var key in replacements) {
            hash[key] = replacements[key];
        }
    }
    return hash;
}

// returns the current page's HTML query value for the given parameter
function getQueryParameter(name) {
    var url = window.location.search.substring(1);
    var chunks = url.split(/&/);
    for (var i = 0; i < chunks.length; i++) {
        var keyValue = chunks[i].split(/=/);
        if (keyValue[0] == name) {
            return keyValue[1];
        }
    }
    return null;
}

// A cross-browser way to get the text that is currently selected.
function getSel() {
    var w=window,d=document,gS='getSelection';
    return (''+(w[gS]?w[gS]():d[gS]?d[gS]():d.selection.createRange().text));
    // return (''+(w[gS]?w[gS]():d[gS]?d[gS]():d.selection.createRange().text)).replace(/(^\s+|\s+$)/g,'');
}

// equivalent of clicking the Back button
function goBack() {
    history.back();
}

function goBackOrClose() {
    if (history.length > 1) {
        // go back
        goBack();
    } else {
        // close window
        window.close();
    }
}

function goToStudentPage() {
    window.location = "student_view.php" + window.location.search;
    return false;
}

function goToSectionPage() {
    window.location = "section_view.php" + window.location.search;
    return false;
}

function goToAssignmentPage() {
    window.location = "assignment_view.php" + window.location.search;
    return false;
}

function goToQuarterPage() {
    window.location = "quarter_view.php" + window.location.search;
    return false;
}

// attaches proper listeners to all "delete", "rename" links on files on this page
// TODO: *** Ajax it up!
function handleFileLinks(root) {
    var deleteLinks = getElementsByClassName("a", "deletelink", root);
    for (var i = 0; i < deleteLinks.length; i++) {
        deleteLinks[i].onclick = function(event) {
            if (confirm("Delete: Are you sure you want to move this file/folder to the Recycle Bin?")) {
                // alert("hi");
                loadingShow("Deleting...");
                ajaxHelper(this.href, reloadPageAjax);
            }
            return abortBubble(event);
        };
    }

    var renameLinks = getElementsByClassName("a", "renamelink", root);
    for (var i = 0; i < renameLinks.length; i++) {
        renameLinks[i].onclick = function(event) {
            var oldFileName = this.href.replace(/.*from=/, "");
            var newFileName = prompt("Rename: What should be the file/folder's new name?", oldFileName);
            if (newFileName) {
                var url = this.href + "&to=" + newFileName;
                loadingShow("Renaming...");
                ajaxHelper(url, reloadPageAjax);
            }
            return abortBubble(event);
        };
    }
    
    var uploadLinks = getElementsByClassName("a", "uploadanotherfile", root);
    for (var i = 0; i < uploadLinks.length; i++) {
        uploadLinks[i].onclick = uploadAnotherFileClick;
    }

    // *** TODO: I have disabled this for now; submitting file upload forms
    // with Ajax is hard.  I need to do some kind of hidden iframe thing...
}

// Returns true if the given DOM element's CSS class name contains the given class name.
function hasClass(element, className) {
    if (!className) {
        return true;
    } else if (!element || !element.className) {
        return false;
    }
    
    var classes = getClasses(element);
    for (var i = 0; i < classes.length; i++) {
        if (classes[i] == className) {
            return true;
        }
    }
    return false;
}

// not very good
function htmlEncode(text) {
    text = text.replace(/</g, "&lt;");
    text = text.replace(/>/g, "&gt;");
    text = text.replace(/ /g, "&nbsp;");
    text = text.replace(/\"/g, "&quot;");
    return text;
}

function inDebugMode() {
    var query = getQueryString();
    return query["debug"];
}

// Populates a select box with all tags of a given ID from the given XML response.
// e.g. if the XML has a list of <student> tags, puts each student's name into an <option>
// HTML tag inside the select box.
function list(ajax, id, select, sortFunction) {
    if (!select) {
        // select = document.getElementById(type + "select");
        select = document.getElementById(id);
    }
    
    // removeAllChildren(select);
    // delete all kids except first
    var children = select.getElementsByTagName("option");
    for (var i = children.length - 1; i > 0; i--) {
        select.removeChild(children[i]);
    }

    var root = ajax.responseXML.getElementsByTagName(id + "s")[0];
    var types = root.getElementsByTagName(id);
    
    
    var optionArray = [];
    for (var i = 0; i < types.length; i++) {
        optionArray.push(types[i].getAttribute("name"));
    }
    
    if (sortFunction) {
        optionArray.sort(sortFunction);
    } else {
        optionArray.sort();
    }

    for (var i = 0; i < optionArray.length; i++) {
        var option = document.createElement("option");
        option.value = option.innerHTML = optionArray[i];
        select.appendChild(option);
    }

    loadingHide();
}

function fade(element) {
    if (element.style.opacity === undefined) {
        element.style.opacity = 0.975;
        return true;
    } else if (element.style.opacity > 0.0) {
        element.style.opacity -= 0.025;
        return true;
    } else {
        // done fading
        element.style.visibility = "hidden";
        element.style.opacity = 1.0;
        return false;
    }
}

function loadingHide(message, shouldFade) {
    if (!message || (message instanceof XMLHttpRequest)) {
        message = "Successful.";
    }
    var loading = $("loading");
    if (loading) {
        loading.innerHTML = message;
        
        if (shouldFade === undefined || shouldFade) {
            loading.style.opacity = 1.0;

            // show success message for 5 sec then disappear
            var timer = 0;
            var fadeFunc = function() {
                // loading.style.visibility = "hidden";
                if (!fade(loading)) {
                    clearInterval(timer);
                }
            };

            timer = setInterval(fadeFunc, 100);
        } else {
            // user wants to skip fadeout
            loading.style.visibility = "hidden";
        }
    }
}

function loadingShow(message) {
    var loading = $("loading");
    if (loading) {
        if (message) {
            loading.innerHTML = message;
        }
        loading.style.opacity = 1.0;
        loading.style.visibility = "visible";
    }
}

function pageHasError(pageText) {
    return pageText && (pageText.match(/<b>Notice<\/b>:/i) || pageText.match(/<b>Fatal error<\/b>:/i));
}

// compareTo-style comparison function between two strings
// representing quarters such as "07sp" or "06wi".
function quarterCompare(quarter1, quarter2) {
    var year1 = quarter1.substring(0, 2);
    var year2 = quarter2.substring(0, 2);
    var qtr1 = quarter1.substring(2);
    var qtr2 = quarter2.substring(2);
    var quarters = ["wi", "sp", "su", "au"];
    
    if (year1 == year2) {
        return arrayIndexOf(quarters, qtr1) - arrayIndexOf(quarters, qtr2);
    } else {
        return year1 - year2;
    }
}

// returns a random number from 0 (inclusive) to max (exclusive)
function rand(max) {
    return Math.floor(Math.random() * max);
}

// reloads the page when an Ajax request is complete
function reloadPageAjax(ajax) {
    window.location.reload();
}

// kills all of the given DOM element's children
function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// removes 'this' node from the page
function removeMyself() {
    this.parentNode.removeChild(this);
}

// Sets the CSS className of the given DOM element to be the contents 
// of the array, joined by spaces.
function setClasses(element, classes) {
    element.className = classes.join(" ");
}

// repairs various browser event incompatibilities
function standardizeEvent(event) {
    var e = event || window.event;
    // e.which = e.button || e.which;
    // if (!e.keyCode) { e.keyCode = e.which; }
    if (!e.srcElement) { e.srcElement = e.target; }
    return e;
}

function scrollTo(element) {
    if (typeof(element) == "string") {
        element = $(element);
    }
    
    var elementTop = getAbsoluteY(element);
    var elementBottom = elementTop + element.scrollHeight;
    var windowTop = window.scrollY;
    var windowBottom = windowTop + window.innerHeight;
    
    var bottomY = elementBottom - window.innerHeight;
    if (elementBottom < windowTop) {
        // window is down below the item; scroll up to it
        window.scroll(window.scrollX, elementTop);
    } else if (elementTop > windowBottom && window.scrollY < bottomY) {
        // window is up above the item; scroll down to it
        window.scroll(window.scrollX, bottomY);
    }
}

function standardAjaxErrorFunction(ajax, url) {
    var message = "Error making Ajax request";
    if (url) {
        message += " to " + url;
    }
    message += ":\n\n" +
            "Server status:\n" + 
            ajax.status + " " + ajax.statusText + "\n\n" +
            "Server response text:\n" + 
            ajax.responseText;
    dumpError(message);
    alert(message);
    loadingHide("Failed.");
}

function submitFormAjax(form, message, fn, errorFn) {
    // form can be the actual form DOM object, or the string of its id
    if (typeof(form) == "string") {
        form = $(form);
    }
    if (!message) {
        message = "Submitting...";
    }

    var queryParams = [];
    var currentQueryString = getQueryString();
    if (currentQueryString["debug"]) {
        queryParams["debug"] = "1";
    }
    
    var kids = form.getElementsByTagName("*");
    for (var i = 0; i < kids.length; i++) {
        var kid = kids[i];
        if (!isTagName(kid, "input") && !isTagName(kid, "textarea") && 
                !isTagName(kid, "select")) { continue; }
        if (kid.name) {
            queryParams[encodeURIComponent(kid.name)] = encodeURIComponent(kid.value);
        }
    }

    loadingShow(message);

    var action = form.getAttribute("action");
    var successFunction = function(ajax) {
        if (pageHasError(ajax.responseText)) {
            // page came back but had errors
            loadingHide("Failed.");
            if (errorFn) {
                errorFn(ajax);
            }
        } else if (fn) {
            loadingHide();
            fn(ajax);
        }
    };
    
    var errorFunction = function(ajax) {
        loadingHide();
        if (errorFn) {
            errorFn(ajax);
        }
    };
    
    ajaxPost(action, buildQueryString(queryParams), successFunction, errorFunction);
}

function toPrintableChar(ch) {
    if (ch == "\n") {
        return "\\n";
    } else if (ch == "\r") {
        return "\\r";
    } else if (ch == "\t") {
        return "\\t";
    } else {
        return ch;
    }
}

// I stole this shitty code from here:
// http://bosky101.blogspot.com/2007/05/introducing-toxmlstring-javascript-xml.html
function toXmlString(xy, s) {
    var str = (s) ? s : '';
    if (xy.nodeValue) {
        var result = xy.nodeValue;
        if (trim(result).length > 0) {
            result = escape(escape(result));
        }
        return result;
    } else {
        var multiStr = [];
        var temp = '';
        for (var i = 0; i < xy.childNodes.length; i++) {
            // each repeated node
            var kid = xy.childNodes[i];
            if (kid.nodeType == xy.TEXT_NODE) {
                // text node
                str = toXmlString(kid, str);
                multiStr.push(str);
            }
            if (kid.nodeType == xy.COMMENT_NODE) {
                // comment node
                str = "<!--" + toXmlString(kid, str) + "-->";
                multiStr.push(str);
            }
            else if (kid.nodeName.toString().indexOf('#') < 0) {
                // a normal element node
                var nodeNameStart = '<' + kid.nodeName;
                // var nodeNameEnd = '';
                var nodeNameEnd;
                var appendGt = true;
                if (!kid.nodeValue && kid.childNodes.length == 0) {
                    nodeNameEnd = ' />';
                    appendGt = false;
                } else {
                    nodeNameEnd = '</' + kid.nodeName + '>';
                }
                var attsStr = ' ';
                var atts = kid.attributes;
                if (atts) {
                    for (var j = 0; j < atts.length; j++) {
                        var value = atts[j].firstChild.nodeValue;
                        // value = value.replace(/\"/g, "&quot;");
                        // value = value.replace(/\"/g, "\\\"");
                        value = escape(escape(value));
                        // value = encodeURIComponent(value);
                        // value = escape(value);
                        attsStr += atts[j].nodeName + '="' + value + '"';
                    }
                }
                temp = nodeNameStart + ((attsStr == ' ') ? '' : attsStr) + (appendGt ? '>' : '') + toXmlString(kid, str) + nodeNameEnd;
                multiStr.push(temp);
                str = temp;
            }
        }
        //end of for loop,time to untangle our results in order of appearance
        str = multiStr.join('');
        // str += '</' +  // "FOO";
        return str;
    }
}

// called when user clicks "add another file" on a file upload form
function uploadAnotherFileClick(event) {
    // <input id="upload_file2" type="file" name="assignment_file2" />
    var input = document.createElement("input");
    
    // figure out how many files currently exist
    var form = getEnclosingElementByTagName("form", this);
    var filesArea = getElementByClassName("div", "uploadfilesarea", form);
    var fileDivs = filesArea.getElementsByTagName("div");
    var files = fileDivs.length + 1;
    
    input.type = "file";
    input.size = UPLOAD_TEXTFIELD_SIZE;
    input.id = "upload_file" + files;
    input.name = "upload_file" + files;

    var remove = document.createElement("a");
    remove.href = "";
    remove.innerHTML = "remove";
    remove.onclick = uploadRemoveClick;

    var div = document.createElement("div");
    div.appendChild(input);
    div.appendChild(document.createTextNode(" "));
    div.appendChild(remove);

    filesArea.appendChild(div);

    return abortBubble(event);
}

function uploadRemoveClick(event) {
    var div = this.parentNode;
    div.parentNode.removeChild(div);
    return abortBubble(event);
}

function makeCheckboxStateful(element, cookieName) {
    if (cookieExists(cookieName) && !element.disabled) {
        element.checked = (cookieGet(cookieName) == "true");
    }
    element.onclick = function(event) {
        statefulCheckboxClick(element, cookieName);
    };
}

function statefulCheckboxClick(element, cookieName) {
    cookieSet(cookieName, element.checked ? "true" : "false", 999);
}
*/
