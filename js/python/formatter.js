var python_formatter = function() {
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
        /*
         * Brief implementation notes:
         * All AST nodes are put into their own spans, with subelements are children.
         * Any code that should be its own line is put in a span with the 'java-line' class,
         * and CSS takes care of adding a line number and making sure it ends with a newline.
         * So no manual newlines are required!
         *
         * Because it uses spans for new lines, all elements must be an integer number of lines,
         * e.g., you cannot have one element take 1.5 lines and a following element take 1.5 lines,
         * where they share the middle line. Elements, can, of course, take 0 lines, such as expressions.
         */

        var prefix = options.id_prefix || 'java-ast-';

        function newline(parent) {
            var l = $('<span>');
            l.attr('id', prefix + 'line-' + options.line);
            l.addClass('java-line');
            options.line += 1;
            parent.append(l);
            return l;
        }

        var elem = $('<span>');
        var line;
        var firstIter;

        elem.attr('id', prefix + node.id);

        switch (node.tag) {
            case 'method':
                line = newline(elem);
                line.html(sprintf('{0}{1} {2}(', indent(indent_level), keyword('def'), method(node.name)));
                firstIter = true;
                node.params.forEach(function(p) {
                    if (!firstIter) {
                        line.append(", ");
                    }
                    firstIter = false;
                    line.append(to_dom(p, options, 0));
                });
                line.append('): ');
                node.body.forEach(function(s) {
                    elem.append(to_dom(s, options, 1));
                });
                if (special_flag) {
                    line = newline(newline(elem));
                    line.html('print(' + method(node.name) + '(');
                    firstIter = true;
                    node.params.forEach(function(p) {
                        if (!firstIter) line.append(', ');
                        firstIter = false;
                        let arg = options.args[p.name];
                        if (Array.isArray(arg)) {
                            line.append('[');
                            if (arg.length > 0) firstIter = true;
                            for (let item of arg) {
                                if (!firstIter) line.append(', ')
                                firstIter = false;
                                line.append(item);
                            }
                            line.append(']');
                        }
                        else if (typeof arg === "string") {
                            line.append("\'");
                            line.append(arg);
                            line.append("\'");
                        }else line.append(arg);
                    });
                    line.append('))');
                }
                break;

            case 'parameter':
                elem.append(ident(node.name));
                break;

            case 'declaration':
                if (!special_flag) {
                    elem.append(indent(indent_level));
                }
                elem = newline(elem);
                elem.append(indent(indent_level));
                elem.append(to_dom(node.expression, options, indent_level));
                break;

            case 'expression':
                if (!special_flag) {
                    elem = newline(elem);
                    elem.append(indent(indent_level));
                }
                var expression = to_dom(node.expression, options, indent_level);
                var children = expression.children();
                elem.append(to_dom(node.expression, options, indent_level));
                break;

            case 'for':
                line = newline(elem);
                line.append(indent(indent_level) + keyword('for') + ' ');
                var init = $('<span>');
                init.attr('id', 'init');
                init.append(to_dom(node.variable, options, indent_level, true));
                line.append(init);
                line.append(' ' + keyword('in') + ' ');
                var update = $('<span>');
                update.attr('id', 'update');
                update.append(to_dom(node.iterable, options, indent_level, true));
                line.append(update);
                line.append(':');
                node.body.forEach(function(s) {
                    elem.append(to_dom(s, options, indent_level + 1));
                });
                break;

            case 'while':
                elem.addClass("while");
                if (special_flag) {
                    line = special_flag;
                } else {
                    line = newline(elem);
                    line.append(indent(indent_level));
                }
                line.append(keyword("while") + ' ');
                line.append(to_dom(node.condition, options, indent_level));
                line.append(":");
                node.body.forEach(function(s) {
                    elem.append(to_dom(s, options, indent_level + 1));
                });
                break;

            case 'if':
                elem.addClass("if");
                if (special_flag) {
                    line = special_flag;
                } else {
                    line = newline(elem);
                    line.append(indent(indent_level));
                }
                line.append(keyword("if") + ' ');
                line.append(to_dom(node.condition, options, indent_level));
                line.append(":");
                node.then_branch.forEach(function(s) {
                    elem.append(to_dom(s, options, indent_level + 1));
                });
                while (node.else_is_elif) {
                    node = node.else_branch;
                    elem.addClass("if");
                    if (special_flag) {
                        line = special_flag;
                    } else {
                        line = newline(elem);
                        line.append(indent(indent_level));
                    }
                    line.append(keyword("elif") + ' ');
                    line.append(to_dom(node.condition, options, indent_level));
                    line.append(":");
                    node.then_branch.forEach(function(s) {
                        elem.append(to_dom(s, options, indent_level + 1));
                    });
                }
                if (node.else_branch) {
                    line = newline(elem);
                    line.append(indent(indent_level) + keyword("else"));
                    line.append(':');
                    node.else_branch.forEach(function(s) {
                        elem.append(to_dom(s, options, indent_level + 1));
                    });
                }
                break;

            case 'binop':
                elem.append(to_dom(node.args[0], options, indent_level));
                let operator = node.operator;
                if (operator === "&&") operator = keyword("and");
                if (operator === "||") operator = keyword("or");
                elem.append(" " + operator + " ");
                elem.append(to_dom(node.args[1], options, indent_level));
                break;

            case 'postfix':
                elem.append(to_dom(node.args[0], options, indent_level));
                elem.append(node.operator);
                break;

            case 'call':
                elem.append(to_dom(node.object, options, indent_level));
                elem.append('(');
                firstIter = true;
                node.args.forEach(function(arg) {
                    if (!firstIter) {
                        elem.append(", ");
                    }
                    firstIter = false;
                    elem.append(to_dom(arg, options, indent_level));
                });
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
                elem.addClass("java-literal")
                if (node.type === 'array') {
                    elem.append('[')
                    if (node.value.length > 0) firstIter = true;
                    for (let item of node.value) {
                        if (!firstIter) elem.append(', ');
                        firstIter = false;
                        elem.append(to_dom(item, options, indent_level));
                    }
                    elem.append(']');
                    break;
                }
                elem.text(typeof node.value === 'number' ? node.value : "'" + node.value + "'");
                break;

            case 'paren_expr':
                elem.append('(');
                elem.append(to_dom(node.value, options, indent_level));
                elem.append(')');
                break;

            case 'return':
                elem.append(keyword("return") + ' ');
                if (node.args.value.length > 1) {
                    let firstIter = true;
                    elem.append("(");
                    node.args.value.forEach(function(arg) {
                        if (!firstIter) {
                            elem.append(", ");
                        }
                        firstIter = false;
                        elem.append(to_dom(arg, options, indent_level));
                    });
                    elem.append(")");
                } else elem.append(to_dom(node.args.value[0], options, indent_level));
                break;

            case 'break':
                line = newline(elem);
                line.append(indent(indent_level) + "break");
                break;

            case 'continue':
                line = newline(elem);
                line.append(indent(indent_level) + "continue");
                break;

            default:
                throw new Error("unknown ast tag " + node.tag);
                break;
        }
        return elem;
    }

    self.format = function(ast, options) {
        options = options || {};
        options.line = 0;
        var dom = to_dom(ast, options, 0, true);
        return dom[0];
    }

    return self;
}();
