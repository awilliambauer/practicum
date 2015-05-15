/**
 * Created by mkmg on 5/11/15.
 */
(function() {
    "use strict";

    var step = 0;

    window.onload = function () {
        displayState();
        $("#next").on("click", next);
        $("#back").on("click", back);

        /*
        meredith - for debugging

        $("#promptwords").html(java_ast.find_by_id(1,mainAst).name);
        */
    };

    function next() {
        step++;
        displayState();
        // TO DO Add wraps
    }

    function back() {
        step--;
        displayState();
        // TO DO Add wraps
    }

    function displayState() {
        /*{ //state 1 (initial)
         array: [11, 14, 2, 4, 7]
         variables: {
         arrayLength: 5,
         i: null
         },
         promptText: "Let's solve the problem!",
         ast: mainAst,
         index: null, // null means that they haven't answered yet
         styleClasses: [
            [], // color0Text
            [], // color0Border
            [], // color1Highlight
            [], // color1Border
            [], // color2Highlight
            []  // color2Border
         ]
         },*/
        var state = states[step];

        // Clears all of the html whose style can change with different states
        $(".clear").empty();

        // Reinsert the html of the problem text
        on_convert();

        // Set array element values
        var elements = state.array;
        var array = $("#arraydata");
        for (var i = 0; i < elements.length; i++) {
            var child = $("<td id=\"ele" + i + "\"></td>");
            child.html(elements[i]);
            array.append(child);
        }

        // Display Indices
        var indices = $("#indices");
        if (state.index === null) {
            for (i = 0; i < state.array.length; i++) {
                var indexBox = $("<th><input type=\"text\" name=\"0\" maxlength=\"2\" id=\"index" + i + "\"></th>");
                indices.append(indexBox);
            }
        } else {
            for (i = 0; i < state.array.length; i++) {
                indexBox = $("<th id=\"index" + i + "\">" + i + "</th>");
                indices.append(indexBox);
            }
        }


        // Update prompt text
        $("#promptwords").html(state.promptText);

        // Update Variables
        var variablelist = state.variables;
        var nameChild = $("<h1>", {class: "varlabel"});
        nameChild.html("arr:");
        $(".varlabelcolumn").append(nameChild);
        for (var key in variablelist) {
            insertVariable(key, variablelist[key]);
        }

        // Add styling classes
        var classes = state.styleClasses;
        for (i = 0; i < classes.length; i++) {
            var currClass = "color" + (i - (i % 2));
            if (i == 0) {
                currClass += "Text";
            } else if ((i % 2) == 1) {
                currClass += "Border";
            } else {
                currClass += "Highlight";
            }
            for (var j = 0; j < classes[i].length; j++) {
                $(classes[i][j]).addClass(currClass);
            }
        }
    }

    function insertVariable(name, value) {
        // This function should insert the given variable into the dom
        var nameChild = $("<h1>", {class: "varlabel", id: name});
        nameChild.html(name + ":");
        $(".varlabelcolumn").append(nameChild);
        var varDiv = $("<div>", {class: "variable clear"});
        var varP = $("<p>", {class: "vardata digit", id: name + "div"});
        varP.html(value);
        varDiv.append(varP);
        $("#varvalues").append(varDiv);
    }

    /// string format function
    function sprintf(fmt) {
        var args = arguments;
        return fmt.replace(/{(\d+)}/g, function(match, index) {
            index = parseInt(index);
            return typeof args[index+1] !== 'undefined' ? args[index+1] : match;
        });
    }

    // returns a string representing indentation to given level.
    function indent(level) {
        return Array(4*level+1).join(" ");
    }

    function to_dom(node, indent_level, special_flag) {
        // HACK special_flag is a boolean used to indicate things like "don't put a semi/newline on this statement"
        // or "don't put a newline before this if". It's very hacky.

        var elem = $('<span>');
        var firstIter;

        elem.attr('id', 'java-ast-' + node.id);

        switch (node.tag) {
            case 'method':
                elem.html(sprintf('public static void arrMys(', indent(0), node.name));
                firstIter = true;
                node.params.forEach(function(p) {
                    if (!firstIter) {
                        elem.append(", ");
                    }
                    firstIter = false;
                    elem.append(to_dom(p, 0));
                });
                elem.append(') {\n');
                node.body.forEach(function(s) {
                    elem.append(to_dom(s, 1));
                });
                elem.append(indent(0) + "}\n");
                break;

            case 'parameter':
                elem.append(node.type + " " + node.name);
                break;

            case 'declaration':
                if (!special_flag) {
                    elem.append(indent(indent_level));
                }
                elem.append(node.type + " ");
                elem.append(to_dom(node.expression, indent_level));
                if (!special_flag) {
                    elem.append(";\n");
                }
                break;

            case 'expression':
                // add some space if top-level (could replace this with something fancier)
                if (!special_flag) {
                    if (indent_level <= 2) { elem.append("\n"); }
                    elem.append(indent(indent_level));
                }
                elem.append(to_dom(node.expression, indent_level));
                if (!special_flag) {
                    elem.append(";\n");
                }
                break;

            case 'for':
                elem.append(indent(indent_level) + 'for (');
                // statements inside of for loop header should not be indented/have newlines
                var init = $('<span>');
                init.attr('id', 'init');
                init.append(to_dom(node.initializer, indent_level, true));
                elem.append(init);
                elem.append('; ');
                var cond = $('<span>');
                cond.attr('id', 'test');
                cond.append(to_dom(node.condition, indent_level, true));
                elem.append(cond);
                elem.append('; ');
                var update = $('<span>');
                update.attr('id', 'update');
                update.append(to_dom(node.increment, indent_level, true));
                elem.append(update);
                elem.append(') {');
                var count = 1;
                var colors = ['pink', 'purple', 'orange'];
                node.body.forEach(function(s) {
                    elem.append(to_dom(s, indent_level+ 1));
                });
                elem.append(indent(indent_level) + '}\n');
                break;

            case 'if':
                if (!special_flag) {
                    // leave a blank line between ifs (could replace with something fancier like boxes)
                    elem.append("\n" + indent(indent_level));
                }
                elem.append("if (");
                elem.append(to_dom(node.condition, indent_level));
                elem.append(") {\n");
                node.then_branch.forEach(function(s) {
                    elem.append(to_dom(s, indent_level + 1));
                });
                if (node.else_branch) {
                    elem.append(indent(indent_level) + '} else ');
                    // check if the else branch is another if/else, if so, skip brackets/newlines
                    if (node.else_branch.tag === 'if') {
                        elem.append(to_dom(node.else_branch, indent_level, true));
                    } else {
                        elem.append('{\n');
                        node.else_branch.forEach(function(s) {
                            elem.append(to_dom(s, indent_level + 1));
                        });
                    }
                }
                if (!special_flag) {
                    elem.append(indent(indent_level) + "}\n");
                }
                break;

            case 'binop':
                elem.append(to_dom(node.args[0], indent_level));
                elem.append(" " + node.operator + " ");
                elem.append(to_dom(node.args[1], indent_level));
                break;

            case 'postfix':
                elem.append(to_dom(node.args[0], indent_level));
                elem.append(node.operator);
                break;

            case 'call':
                elem.append(to_dom(node.object, indent_level));
                elem.append('(');
                // HACK this totally assumes function calls have only one argument,
                // which happens to be true for array and if/else mysteries.
                elem.append(to_dom(node.args[0], indent_level));
                elem.append(')');
                break;

            case 'index':
                elem.append(to_dom(node.object, indent_level));
                elem.append('[');
                elem.append(to_dom(node.index, indent_level));
                elem.append(']');
                break;

            case 'reference':
                elem.append(to_dom(node.object, indent_level));
                elem.append('.' + node.name);
                break;

            case 'identifier':
                elem.text(node.value);
                break;

            case 'literal':
                elem.text(typeof node.value === 'number' ? node.value : '"' + node.value + '"');
                break;

            default:
                throw new Error("unknown ast tag " + node.tag);
                break;
        }
        return elem;
    }

    function set_class_of_ast_dom_element(id, clazz) {
        $('#java-ast-' + id).addClass(clazz);
    }

    function on_convert() {
        var dom = to_dom(mainAst, 0);
        $('#problemtext').html('').append(dom[0]);
    }

    function on_show() {
        var ast = java_parsing.browser_parse($('#code').val());
        var node = java_ast.find_by_id(parseInt($('#toshow').val()), ast);
        $('#node').html(node.tag);
    }

    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };

})();