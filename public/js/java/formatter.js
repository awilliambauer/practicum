var java_formatter = function() {
    "use strict";
    var self = {};

    function format_list(format_fn, text, list) {
        var isFirstIter = true;
        list.forEach(function(x) {
            if (!isFirstIter) {
                text.append(", ");
            }
            isFirstIter = false;
            text.append(format_fn(x));
        });
        return text;
    }

    // returns a string representing indentation to given level.
    function indent(level) {
        return Array(4*level+1).join(" ");
    }

    function span(clazz, s) {
        return '<span class="' + clazz + '">' + s + '</span>';
    }

    function keyword(s) { return span('java-keyword', s); }
    function symbol(s) { return span('java-symbol', s); }
    function ident(s) { return span('java-ident', s); }
    function literal(s) { return span('java-literal', s); }
    function method(s) { return span('java-method', s); }
    function reference(s) { return span('java-reference', s); }

    /**
     *
     * @param node
     * @param indent_level
     * @param special_flag
     * @returns {*|jQuery|HTMLElement}
     */
    function to_dom(node, options, indent_level, special_flag) {
        // HACK special_flag is a boolean used to indicate things like "don't put a semi/newline on this statement"
        // or "don't put a newline before this if". It's very hacky.

        var elem = $('<span>');
        var firstIter;

        var prefix = options.id_prefix || 'java-ast-';
        elem.attr('id', prefix + node.id);

        switch (node.tag) {
            case 'method':
                elem.html(sprintf('{0}{1} {2} {3} {4}(', indent(indent_level), keyword('public'), keyword('static'), keyword('void'), method(node.name)));
                firstIter = true;
                node.params.forEach(function(p) {
                    if (!firstIter) {
                        elem.append(", ");
                    }
                    firstIter = false;
                    elem.append(to_dom(p, options, 0));
                });
                elem.append(') ' + symbol('{') + '\n');
                node.body.forEach(function(s) {
                    elem.append(to_dom(s, options, 1));
                });
                elem.append(indent(0) + symbol("}")+"\n");
                break;

            case 'parameter':
                elem.append(keyword(node.type) + " " + ident(node.name));
                break;

            case 'declaration':
                if (!special_flag) {
                    elem.append(indent(indent_level));
                }
                elem.append(keyword(node.type) + " ");
                elem.append(to_dom(node.expression, options, indent_level));
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
                var expression = to_dom(node.expression, options, indent_level);
                var children = expression.children();
                elem.append(to_dom(node.expression, options, indent_level));
                if (!special_flag) {
                    elem.append(";\n");
                }
                break;

            case 'for':
                elem.addClass("for");
                elem.append(indent(indent_level) + keyword('for') + ' (');
                // statements inside of for loop header should not be indented/have newlines
                var init = $('<span>');
                init.attr('id', 'init');
                init.append(to_dom(node.initializer, options, indent_level, true));
                elem.append(init);
                elem.append('; ');
                var cond = $('<span>');
                cond.attr('id', 'test');
                cond.append(to_dom(node.condition, options, indent_level, true));
                elem.append(cond);
                elem.append('; ');
                var update = $('<span>');
                update.attr('id', 'update');
                update.append(to_dom(node.increment, options, indent_level, true));
                elem.append(update);
                elem.append(') {');
                node.body.forEach(function(s) {
                    elem.append(to_dom(s, options, indent_level + 1));
                });
                elem.append(indent(indent_level) + '}\n');
                break;

            case 'if':
                elem.addClass("if");
                if (!special_flag) {
                    // leave a blank line between ifs (could replace with something fancier like boxes)
                    elem.append("\n" + indent(indent_level));
                }
                elem.append("if (");
                elem.append(to_dom(node.condition, options, indent_level));
                elem.append(") {\n");
                node.then_branch.forEach(function(s) {
                    elem.append(to_dom(s, options, indent_level + 1));
                });
                if (node.else_branch) {
                    elem.append(indent(indent_level) + '} else ');
                    // check if the else branch is another if/else, if so, skip brackets/newlines
                    if (node.else_branch.tag === 'if') {
                        elem.append(to_dom(node.else_branch, options, indent_level, true));
                    } else {
                        elem.append('{\n');
                        node.else_branch.forEach(function(s) {
                            elem.append(to_dom(s, options, indent_level + 1));
                        });
                    }
                }
                if (!special_flag) {
                    elem.append(indent(indent_level) + "}\n");
                }
                break;

            case 'binop':
                elem.append(to_dom(node.args[0], options, indent_level));
                elem.append(" " + node.operator + " ");
                elem.append(to_dom(node.args[1], options, indent_level));
                break;

            case 'postfix':
                elem.append(to_dom(node.args[0], options, indent_level));
                elem.append(node.operator);
                break;

            case 'call':
                elem.append(to_dom(node.object, options, indent_level));
                elem.append('(');
                // HACK this totally assumes function calls have only one argument,
                // which happens to be true for array and if/else mysteries.
                elem.append(to_dom(node.args[0], options, indent_level));
                elem.append(')');
                break;

            case 'index':
                elem.append(to_dom(node.object, options, indent_level));
                elem.append('[');
                elem.append(to_dom(node.index, options, indent_level));
                elem.append(']');
                break;

            case 'reference':
                elem.append(to_dom(node.object, options, indent_level));
                elem.append('.' + reference(node.name));
                break;

            case 'identifier':
                elem.addClass("java-ident");
                elem.text(node.value);
                break;

            case 'literal':
                elem.addClass("java-literal");
                elem.text(typeof node.value === 'number' ? node.value : '"' + node.value + '"');
                break;

            default:
                throw new Error("unknown ast tag " + node.tag);
                break;
        }
        return elem;
    }

    self.format = function(ast, options) {
        options = options || {};
        console.log(ast);
        var dom = to_dom(ast, options, 0);
        return dom[0];
    }

    return self;
}();
