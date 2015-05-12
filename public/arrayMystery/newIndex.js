/**
 * Created by mkmg on 5/11/15.
 */
(function() {
    "use strict";

    var step = -1;

    window.onload = function () {
        $("#next").on("click", next);
        $("#back").on("click", back);
        on_convert();
    };

    function next() {
        step++;
        displayState();
        // TO DO Add wraps
    }

    function back() {
        step--;
        displayState(states[step]);
        // TO DO Add wraps
    }

    function displayState() {
        /*{ //state 1 (initial)
         variables: {
         array: [11, 14, 2, 4, 7],
         arrayLength: 5,
         i: null
         },
         promptText: "Let's solve the problem!",
         ast: mainAst,
         index: null, // null means that they haven't answered yet
         styleClasses: {
         mainColorText: [],
         mainColorBorder: [],
         accent1Highlight: [],
         accent1Border: [],
         accent2Highlight: [],
         accent2Border: []
         }
         },*/
        var state = states[step];
        // Set array element values
        var elements = state.array;
        for (var i = 0; i < elements.length; i++) {
            $("#ele" + i).html(elements[i]);

        }
        // Update prompt text
        $("#promptwords").html(state.promptText);
        // Update Variables


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
                elem.html(sprintf('public static void <span style="color:blue">{0}</span>(', indent(0), node.name));
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
                elem.append(to_dom(node.initializer, indent_level, true));
                elem.append('; ');
                elem.append(to_dom(node.condition, indent_level, true));
                elem.append('; ');
                elem.append(to_dom(node.increment, indent_level, true));
                elem.append(') {');
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
                elem.css('color', 'blue');
                break;

            case 'literal':
                elem.text(typeof node.value === 'number' ? node.value : '"' + node.value + '"');
                elem.css('color', 'green');
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

})();