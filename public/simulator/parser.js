
/// string format function, should put somewhere useful
function sprintf(fmt) {
    var args = arguments;
    return fmt.replace(/{(\d+)}/g, function(match, index) {
        index = parseInt(index);
        return typeof args[index+1] !== 'undefined' ? args[index+1] : match;
    });
}

var simulator_parsing = function() {
    "use strict";

    /// Throws an exception, aborting the parsing process.
    /// pos can either be a token or a character stream position object
    /// msg is a string containing a human-readable description of the type of error.
    function throw_error(pos, msg) {
        var str = sprintf("ERROR @ {0}:{1}: {2}", pos.line + 1, pos.col + 1, msg);
        throw new Error(str);
    }

    /// Exposes a string as a stream of characters, makes implementing the lexer simpler.
    /// Also generates location (line, column) information for error messages.
    var CharStream = function(str) {
        var self = {};

        var bufidx = 0;
        var line = 0;
        var col = 0;

        /// Did we hit the end of the stream?
        self.iseof = function() {
            return str.length <= bufidx;
        };

        /// Look at the next character without advancing the stream.
        self.peek = function() {
            return str.charAt(bufidx);
        };

        /// Advance the stream, returning the next character.
        self.next = function() {
            var c = str.charAt(bufidx);
            if (c == "\n") {
                line++;
                col = 0;
            } else {
                col++;
            }
            bufidx++;
            return c;
        };

        /// The position of the _next_ character in the stream.
        self.position = function() {
            return {line:line, col:col};
        };

        return self;
    };

    /// Token type enumeration
    var TokenType = {
        KEYWORD: "KEYWORD",
        SYMBOL: "SYMBOL",
        IDENTIFIER: "IDENTIFIER",
        INT_LITERAL: "INT_LITERAL",
        STR_LITERAL: "STR_LITERAL",
    };

    /// Token creation functions (doesn't put position info in, that's added manually)
    var Token = {
        keyword: function(v) { return {type:TokenType.KEYWORD, value:v}; },
        symbol: function(v) { return {type:TokenType.SYMBOL, value:v}; },
        identifier: function(v) { return {type:TokenType.IDENTIFIER, value:v}; },
        integer: function(v) { return {type:TokenType.INT_LITERAL, value:v}; },
        string: function(v) { return {type:TokenType.STR_LITERAL, value:v}; },
    };

    function token_to_string(t) {
        return t.type + ":" + t.value;
    }

    /// Tokenizes a CharacterStream into a stream of token objects.
    var Lexer = function(cs) {

        var self = {};

        var is_peeked = false;
        var current_token;

        // these are all dicts because javascript doesn't have sets, boo
        var keywords = {
            "if":1, "else":1, "do":1, "while":1, "for":1,
            "function":1, "var":1, "let":1, "of":1, "break":1,
        };

        var symbols = {
            "[":1, "]":1, "{":1, "}":1, "(":1, ")":1,
            "=":1, ";":1, ".":1, ",":1,
            "<":1, ">":1, "<=":1, ">=":1, "==":1, "!=":1,
            "+":1, "-":1, "*":1, "/":1, "!":1, "%":1,
            "++":1, "--":1,
            "&":1, "|":1, "&&":1, "||":1,
        };

        var text_start_chars = {
            ":":1, "*":1, "$":1
        };

        function iseof() {
            return cs.iseof();
        }
        self.iseof = iseof;

        function isspace(c) {
            return c == ' ' || c == '\t' || c == '\r' || c == '\n';
        }

        function isalpha(c) {
            return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_';
        }

        function isdigit(c) {
            return c >= '0' && c <= '9';
        }

        function isident(c) {
            return isalpha(c) || isdigit(c);
        }

        function iscommentstart(c) {
            return c === '#';
        }

        function read_until_newline() {
            var text = "";
            while (!cs.iseof() && cs.peek() !== "\n") {
                text += cs.next();
            }
            // read the ending newline
            if (!cs.iseof()) cs.next();
            return text.strip();
        }

        function skip_whitespace() {
            while (!cs.iseof() && (isspace(cs.peek()) || iscommentstart(cs.peek()))) {
                if (iscommentstart(cs.next())) {
                    read_until_newline();
                }
            }
        }

        function get_next() {
            // skip whitespace (will do nothing if eof)
            skip_whitespace();

            if (iseof()) {
                throw_error(cs.position(), "Unexpected EOF.");
            }

            var pos = cs.position();
            var c = cs.next();
            var token;

            // check for tokens
            if (c in symbols) {
                // super hack: also check if next token is in symbols.
                // this assumes any two-character symbol has a prefix that is also a symbol
                if ((c + cs.peek()) in symbols) {
                    token = Token.symbol(c + cs.next());
                } else {
                    token = Token.symbol(c);
                }
            } else if (isalpha(c)) {
                var ident = c;
                while (!cs.iseof() && isident(cs.peek())) {
                    c = cs.next();
                    ident += c;
                }
                token = ident in keywords ? Token.keyword(ident) : Token.identifier(ident);
            } else if (isdigit(c)) {
                var num = c;
                while (!cs.iseof() && isident(cs.peek())) {
                    c = cs.next();
                    num += c;
                }
                token = Token.integer(parseInt(num));
            } else if (c === '"') {
                var str = "";
                while (cs.peek() !== '"') {
                    str += cs.next();
                }
                cs.next();
                token = Token.string(str);
            } else {
                throw_error(pos, sprintf("Unexpected character '{0}'", c));
            }

            skip_whitespace();

            token.position = pos;
            return token;
        }

        function peek() {
            if (!is_peeked) {
                current_token = get_next();
                is_peeked = true;
            }
            return current_token;
        }
        self.peek = peek;

        function next() {
            var token = peek();
            is_peeked = false;
            return token;
        }
        self.next = next;

        function position() {
            return cs.position();
        }
        self.position = position;

        return self;
    };

    /**
     * tags: function, if, declaration, parameter, expression, for, literal, identifier, index, call,
     *       reference, postfix, binop, break
     */
    var Parser = function(lex) {
        var self = {};

        var id_counter = 0;

        function new_id() { return ++id_counter; }

        function match_program() {
            // every program is a single function
            match_keyword("function");
            var name = match_ident(); // ignore the class name
            match_symbol("(");
            var params = match_delimited_list(match_parameter, ",", ")");
            var body = match_block();

            return {
                tag: 'function',
                id: new_id(),
                name: name,
                parameters: params,
                body: body,
            };
        }

        function match_block() {
            var stmts = [];
            match_symbol("{");
            while (!peek_symbol("}")) {
                stmts.push(match_statement());
            }
            match_symbol("}");
            return stmts;
        }

        function match_statement() {
            // check for meta tags
            var annotations = [];
            if (peek_symbol('[')) {
                match_symbol('[');
                annotations = match_delimited_list(match_annotation, ";", "]");
            }

            var next = lex.peek();
            var stmt;
            switch (next.value) {
                case "do": stmt = match_dowhile(); break;
                case "for": stmt = match_foreach(); break;
                case "if": stmt = match_ifelse(); break;
                case "while": stmt = match_while(); break;
                case "break": stmt = match_break(); break;
                default: stmt = match_simple_statement(true); break;
            }
            stmt.annotations = annotations;
            return stmt;
        }

        function match_annotation() {
            var name = match_ident();
            return {
                id: new_id(),
                tag:'annotation',
                name: name,
            };
        }

        function match_simple_statement(do_match_ending_semicolon) {
            var next = lex.peek();
            var result;
            var expr;
            switch (next.type) {
                case TokenType.KEYWORD:
                    if (next.value === 'let') {
                        result = match_declaration();
                    } else {
                        throw_error(lex.position(), sprintf(
                            "Expected 'let' or expression, but found {0}",
                            token_to_string(next)));
                    }
                    break;
                default:
                    expr = match_expression(0, true);
                    // HACK translate assignments to their own statement type
                    if (expr.tag === 'binop' && expr.operator === '=') {
                        result = {id:new_id(), tag:'assignment', expression:expr.args[1], destination:expr.args[0]};
                    } else {
                        result = {id:new_id(), tag:'expression', expression:expr};
                    }
                    break;
            }
            if (do_match_ending_semicolon) {
                match_symbol(";");
            }
            return result;
        }

        function match_break() {
            match_keyword("break");
            match_symbol(";");
            return {
                id: new_id(),
                tag: "break"
            };
        }

        function match_dowhile() {
            match_keyword("do");
            var body = match_block();
            match_keyword("while");
            match_symbol("(");
            var cond = match_expression(0);
            match_symbol(")");
            match_symbol(";");
            return {
                id: new_id(),
                tag:'dowhile',
                condition: cond,
                body: body
            };
        }

        function match_while() {
            match_keyword("while");
            match_symbol("(");
            var cond = match_expression(0);
            match_symbol(")");
            var body = match_block();
            return {
                id: new_id(),
                tag: "while",
                condition: cond,
                body: body
            };
        }

        function match_foreach() {
            match_keyword("for");
            match_symbol("(");
            match_keyword("let");
            var variable = match_ident();
            match_keyword("of");
            var collection = match_expression(0);
            match_symbol(")");
            var body = match_block();
            return {
                id: new_id(),
                tag:'foreach',
                variable: variable,
                collection: collection,
                body: body
            };
        }

        function match_ifelse() {
            match_keyword("if");
            match_symbol("(");
            var cond = match_expression(0);
            match_symbol(")");
            var thenb = match_block();
            var elseb = null;
            if (peek_keyword("else")) {
                match_keyword("else");
                if (peek_symbol("{")) {
                    elseb = match_block();
                } else {
                    elseb = [match_statement()];
                }
            }
            return {
                id: new_id(),
                tag: 'if',
                condition: cond,
                then_branch: thenb,
                else_branch: elseb,
            };
        }

        function match_declaration() {
            match_keyword('let');
            var name = match_ident();
            //match_keyword(':');
            //var type = match_type();

            return {
                id: new_id(),
                tag: "declaration",
                name: name,
                //type: type,
            };
        }

        /// Implementation note: expressions use this technique called top-down operator precedence parsing.
        /// rbp means "right bind power". Top-level expressions should be parsed with match_expression(0).
        function match_expression(rbp, is_statement) {
            var left = match_prefix();
            while (rbp < binop_bind_power(lex.peek())) {
                left = match_infix(left, is_statement);
            }
            return left;
        }

        // match prefix operators or sub-expressions of operators
        function match_prefix() {
            var t = lex.next();
            switch (t.type) {
                // literals
                case TokenType.INT_LITERAL:
                case TokenType.STR_LITERAL:
                    return {id:new_id(), tag:'literal', value:t.value};
                case TokenType.IDENTIFIER:
                    return {id:new_id(), tag:'identifier', value:t.value};
                default: throw_error(t.position, "Expected expression");
            }
        }

        var postfix_operators = {
            '++':1, "--":1,
        };

        // match binary operators
        function match_infix(left, is_statement) {
            var t = lex.next();
            switch (t.value) {
                // reference
                case ".":
                    return {id:new_id(), tag:'reference', object:left, name:match_ident()};
                // method call
                case "(":
                    var args = match_delimited_list(function(){return match_expression(0);}, ",", ")");
                    return {id:new_id(), tag:'call', object:left, args:args};
                // array index
                case "[":
                    var index = match_expression(0);
                    match_symbol("]");
                    return {id:new_id(), tag:'index', object:left, index:index};
                // infix binop or postfix
                default:
                    if (t.type !== TokenType.SYMBOL) {
                        throw_error(t.position, "Expected infix operator");
                    }

                    if (t.value in postfix_operators) {
                        return {id:new_id(), tag:"postfix", operator:t.value, args:[left]};
                    } else {
                        // assignment can only appear as a statement
                        if (!is_statement && t.value === '=') {
                            throw_error(t.position, "Assignments cannot be expressions, must be a statement.");
                        }
                        // this assumes all operators are left-associative!
                        // if we need to make them right-associative, match the right expr with a lower bind power
                        return {id:new_id(), tag:"binop", operator:t.value, args:[left, match_expression(binop_bind_power(t))]};
                    }
            }
        }

        // left/right bind power for binary operators or postfix operators
        function binop_bind_power(token) {
            switch (token.value) {
                case ".": return 100;
                case "(": case "[": return 90;
                case "++": case "--": return 80;
                case "*": case "/": case "%": return 60;
                case "+":  case "-": return 50;
                case "==": case "!=": case "<=": case ">=": case "<": case ">": return 40;
                case "&&": case "||": return 30;
                case "=": return 10;
                case ";": case ")": case "]": case ",": return 0;
                default: throw new Error("unknown operator " + token.value);
            }
        }

        /// match a list of items delimited by a symbol (e.g., comma or semicolon) until the closer (e.g., right paren).
        /// Assumes opening paren/bracket/etc was already matched.
        function match_delimited_list(matchfn, delimiter, closer) {
            var arr = [];
            if (!peek_symbol(closer)) {
                while (true) {
                    arr.push(matchfn());
                    if (peek_symbol(delimiter)) {
                        lex.next();
                    } else {
                        break;
                    }
                }
            }
            match_symbol(closer);
            return arr;
        }

        function match_parameter() {
            return {
                id: new_id(),
                tag: 'parameter',
                name: match_ident()
            };
        }

        function match_ident() {
            var t = lex.next();
            if (t.type !== TokenType.IDENTIFIER) {
                throw_error(t.position, sprintf("Expected identifier, found {0}", token_to_string(t)));
            }
            return t.value;
        }

        function peek_ident(val) {
            var token = lex.peek();
            return token.type === TOKEN_IDENTIFIER && token.value === val;
        }

        function match_keyword(kw) { return match_token(TokenType.KEYWORD, kw); }

        function peek_keyword(kw) { return peek_token(TokenType.KEYWORD, kw); }

        function match_symbol(s) { return match_token(TokenType.SYMBOL, s); }

        function peek_symbol(s) { return peek_token(TokenType.SYMBOL, s); }

        function match_token(expected_type, expected_value) {
            if (!peek_token(expected_type, expected_value)) {
                throw_error(lex.position(), sprintf(
                            "Expected {0} but found {1}",
                            token_to_string({type:expected_type, value:expected_value}),
                            token_to_string(lex.next())));
            }
            lex.next(); // advance lexer but ignore result
        }

        function peek_token(expected_type, expected_value) {
            var t = lex.peek();
            return t.type === expected_type && t.value === expected_value;
        }

        self.parse = function() {
            return match_program();
        };

        return self;
    };

    function browser_parse(data, callback) {
        var p = Parser(Lexer(CharStream(data)));
        return p.parse();
    }

    function nodejs_parse(fname, callback) {
        var fs = require('fs');

        fs.readFile(fname, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            var p = Parser(Lexer(CharStream(data)));
            var ast = p.parse();
            callback(ast);
        });
    }

    return {
        nodejs_parse: nodejs_parse,
        browser_parse: browser_parse
    };

}();

if (typeof module !== 'undefined' && typeof process !== 'undefined') {
    if (process.argv.length <= 2) {
        console.log("Usage: node simulator_parser.js <filename>\nWill print a json AST to stdout.");
    } else {
        var filename = process.argv[2];
        simulator_parsing.nodejs_parse(filename, function(ast) {
            console.log(JSON.stringify(ast));
        });
    }
}

