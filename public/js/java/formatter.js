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
        /*
         * Brief implementation notes:
         * All AST nodes are put into their own spans, with subelements are children.
         * Any code that should be its own line is put in a span with the 'java-line' class,
         * and CSS takes care of adding a line number and making sure it ends with a newline.
         * So no manual newlines are required!
         *
         * Because it uses spans for new lines, all elements must be an integer number of lines,
         * e.g., you cannot have one element take 1.5 lines and a follwing element take 1.5 lines,
         * where they share the middle line. Elements, can, of course, take 0 lines, such as expressions.
         */

        // HACK special_flag is a boolean used to indicate things like "don't put a semi/newline on this statement"
        // or "don't put a newline before this if". It's very hacky.

        // console.log(node);

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
                // newline(elem).append(indent(0));
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
                // elem.append(keyword(node.type) + " ");
                elem.append(to_dom(node.expression, options, indent_level));
                // if (!special_flag) {
                //     elem.append(";");
                // }
                break;

            case 'expression':
                // add some space if top-level (could replace this with something fancier)
                if (!special_flag) {
                    elem = newline(elem);
                    elem.append(indent(indent_level));
                }
                var expression = to_dom(node.expression, options, indent_level);
                var children = expression.children();
                elem.append(to_dom(node.expression, options, indent_level));
                if (!special_flag) {
                    elem.append(";");
                }
                break;

            case 'for':
                line = newline(elem);
                line.append(indent(indent_level) + keyword('for') + ' ');
                // statements inside of for loop header should not be indented/have newlines
                var init = $('<span>');
                init.attr('id', 'init');
                init.append(to_dom(node.variable, options, indent_level, true));
                line.append(init);
                line.append(' ' + keyword('in') + ' ');
                // var cond = $('<span>');
                // cond.attr('id', 'test');
                // cond.append(to_dom(node.condition, options, indent_level, true));
                // line.append(cond);
                // line.append('; ');
                var update = $('<span>');
                update.attr('id', 'update');
                console.log(node);
                update.append(to_dom(node.iterable, options, indent_level, true));
                line.append(update);
                line.append(':');
                node.body.forEach(function(s) {
                    elem.append(to_dom(s, options, indent_level + 1));
                });
                // newline(elem).append(indent(indent_level));
                break;

            case 'if':
                elem.addClass("if");
                if (special_flag) {
                    // HACK pass in the previous line (with the }) as the flag so it's one line
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
                if (node.else_branch) {
                    line = newline(elem);
                    line.append(indent(indent_level) + keyword("else") + ' ');
                    if (node.else_branch.tag === 'if') {
                        // HACK pass in the previous line (with the }) as the flag so it's one line
                        elem.append(to_dom(node.else_branch, options, indent_level, line));
                    } else {
                        line.append(':');
                        node.else_branch.forEach(function(s) {
                            elem.append(to_dom(s, options, indent_level + 1));
                        });
                    }
                }
                if (!special_flag) {
                    // line = newline(elem);
                    // line.append(indent(indent_level) );
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
                // node.args.forEach(function(arg){
                //     elem.append(to_dom(arg, options, indent_level));
                //     elem.append(', ');
                // });
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
                elem.addClass("java-literal");
                elem.text(typeof node.value === 'number' ? node.value : '"' + node.value + '"');
                break;

            case 'paren_expr':
                elem.append('(');
                elem.append(to_dom(node.value, options, indent_level));
                elem.append(')');
                break;

            case 'return':
                elem.append(keyword("return") + ' ');
                elem.append(to_dom(node.value, options, indent_level));
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
        console.log(ast);
        var dom = to_dom(ast, options, 0);
        return dom[0];
    }

    return self;
}();
