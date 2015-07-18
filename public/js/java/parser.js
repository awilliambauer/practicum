
var java_parsing = function() {
    "use strict";

    /// string format function
    function sprintf(fmt) {
        var args = arguments;
        return fmt.replace(/{(\d+)}/g, function(match, index) {
            index = parseInt(index);
            return typeof args[index+1] !== 'undefined' ? args[index+1] : match;
        });
    }

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
        DOUBLE_LITERAL: "DOUBLE_LITERAL",
        STR_LITERAL: "STR_LITERAL",
    };

    /// Token creation functions (doesn't put position info in, that's added manually)
    var Token = {
        keyword: function(v) { return {type:TokenType.KEYWORD, value:v}; },
        symbol: function(v) { return {type:TokenType.SYMBOL, value:v}; },
        identifier: function(v) { return {type:TokenType.IDENTIFIER, value:v}; },
        integer: function(v) { return {type:TokenType.INT_LITERAL, value:v}; },
        double: function(v) { return {type:TokenType.DOUBLE_LITERAL, value:v}; },
        string: function(v) { return {type:TokenType.STR_LITERAL, value:v}; },
    };

    function token_to_string(t) {
        return t.type + ":" + t.value;
    }

    /// Tokenizes a CharacterStream into a stream of token objects.
    var Lexer = function(cs) {

        var self = {};

        var is_peeked = false;
        var last_position = cs.position();
        var current_token;

        // these are all dicts because javascript doesn't have sets, boo
        var keywords = {
            "class":1, "public":1, "static":1,
            "void":1, "int":1,
            "for":1, "if":1, "else":1
        };

        var symbols = {
            "[":1, "]":1, "{":1, "}":1, "(":1, ")":1,
            "=":1, ";":1, ".":1, ",":1,
            "<":1, ">":1, "<=":1, ">=":1, "==":1, "!=":1,
            "+":1, "-":1, "*":1, "/":1, "!":1, "%":1,
            "+=":1, "-=":1, "*=":1, "/=":1, "%=":1,
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
                var is_double = false;
                while (!cs.iseof() && (isdigit(cs.peek()) || cs.peek() === '.')) {
                    c = cs.next();
                    is_double = is_double || c === '.';
                    num += c;
                }
                token = (is_double ? Token.double : Token.integer)(parseFloat(num));
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
            last_position = cs.position();
            return token;
        }
        self.next = next;

        function position() {
            return last_position;
        }
        self.position = position;

        return self;
    };

    var Parser = function(lex) {
        var self = {};

        var id_counter = 0;

        function new_id() { return ++id_counter; }

        function location(start) {
            return {start:start, end:lex.position()};
        }

        function match_program() {
            var start = lex.position();
            // let's assume every program is a class with a single method, with nothing fancy.
            match_keyword("public");
            match_keyword("class");
            match_ident(); // ignore the class name
            match_symbol("{");
            match_keyword("public");
            match_keyword("static");
            match_type(); // ignore return type
            var name = match_ident();
            var params = match_delimited_list(match_parameter, ",");
            var body = match_block();

            return {
                id: new_id(),
                location: location(start),
                tag: 'method',
                name: name,
                params: params,
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
            var next = lex.peek();
            switch (next.value) {
                case "for": return match_forloop();
                case "if": return match_ifelse();
                default: return match_simple_statement(true);
            }
        }

        function match_simple_statement(do_match_ending_semicolon) {
            var start = lex.position();
            var next = lex.peek();
            var result;
            switch (next.type) {
                case TokenType.KEYWORD:
                    result = match_declaration();
                    break;
                default:
                    result = {id:new_id(), location: location(start), tag:'expression', expression:match_expression(0)};
                    break;
            }
            if (do_match_ending_semicolon) {
                match_symbol(";");
            }
            return result;
        }

        function match_forloop() {
            var start = lex.position();
            match_keyword("for");
            match_symbol("(");
            var init = match_simple_statement(true);
            var cond = match_expression(0);
            match_symbol(";");
            var incr = match_simple_statement(false);
            match_symbol(")");
            var body = match_block();
            return {
                id: new_id(),
                location: location(start),
                tag:'for',
                initializer: init,
                condition: cond,
                increment: incr,
                body: body
            };
        }

        function match_ifelse() {
            var start = lex.position();
            match_keyword("if");
            match_symbol("(");
            var cond = match_expression(0);
            match_symbol(")");
            var thenb = match_block();
            var elseb = undefined;
            if (peek_keyword("else")) {
                match_keyword("else");
                if (peek_symbol("{")) {
                    elseb = match_block();
                } else {
                    // HACK assume another if here, so match the block. this is probably not what we want eventually.
                    elseb = match_statement();
                }
            }
            return {
                id: new_id(),
                location: location(start),
                tag: 'if',
                condition: cond,
                then_branch: thenb,
                else_branch: elseb,
            };
        }

        function match_declaration() {
            var start = lex.position();
            var type = match_type();
            var expression = match_expression(0);
            // assumes that if the first token is a keyword, then there is a type, otherwise there isn't
            return {
                id: new_id(),
                location: location(start),
                tag: "declaration",
                type: type,
                expression: expression
            };
        }

        /// Implementation note: expressions use this technique called top-down operator precedence parsing.
        /// rbp means "right bind power". Top-level expressions should be parsed with match_expression(0).
        function match_expression(rbp) {
            var left = match_prefix();
            while (!lex.iseof() && rbp < binop_bind_power(lex.peek())) {
                left = match_infix(left);
            }
            return left;
        }

        // match prefix operators or sub-expressions of operators
        function match_prefix() {
            var start = lex.position();
            var t = lex.next();
            switch (t.type) {
                // literals
                case TokenType.INT_LITERAL:
                    return {id:new_id(), location:location(start), tag:'literal', type:'int', value:t.value};
                case TokenType.DOUBLE_LITERAL:
                    return {id:new_id(), location:location(start), tag:'literal', type:'double', value:t.value};
                case TokenType.STR_LITERAL:
                    return {id:new_id(), location:location(start), tag:'literal', type:'string', value:t.value};
                case TokenType.IDENTIFIER:
                    return {id:new_id(), location:location(start), tag:'identifier', value:t.value};
                default: throw_error(t.position, "Expected expression");
            }
        }

        var postfix_operators = {
            '++':1, "--":1,
        };

        // match binary operators
        function match_infix(left) {
            var start = lex.position();
            var t = lex.next();
            switch (t.value) {
                // reference
                case ".":
                    var name = match_ident()
                    return {id:new_id(), location:location(start), tag:'reference', object:left, name:name};
                // method call
                case "(":
                    var args = match_delimited_list(function(){return match_expression(0);}, ",", true);
                    return {id:new_id(), location:location(start), tag:'call', object:left, args:args};
                // array index
                case "[":
                    var index = match_expression(0);
                    match_symbol("]");
                    return {id:new_id(), location:location(start), tag:'index', object:left, index:index};
                // infix binop or postfix
                default:
                    if (t.type !== TokenType.SYMBOL) {
                        throw_error(t.position, "Expected infix operator");
                    }

                    if (t.value in postfix_operators) {
                        return {id:new_id(), location:location(start), tag:"postfix", operator:t.value, args:[left]};
                    } else {
                        // this assumes all operators are left-associative!
                        // if we need to make them right-associative, match the right expr with a lower bind power
                        var right = match_expression(binop_bind_power(t));
                        return {id:new_id(), location:location(start), tag:"binop", operator:t.value, args:[left, right]};
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
                case "=": case "*=": case "/=": case "%=": case "+=":  case "-=": return 10;
                case ";": case ")": case "]": case ",": return 0;
                default: throw new Error("unknown operator " + token.value);
            }
        }

        /// match a list of items delimited by a symbol (e.g., comma or semicolon)
        function match_delimited_list(matchfn, delimiter, do_skip_open_parn) {
            var arr = [];
            if (!do_skip_open_parn) {
                match_symbol("(");
            }
            if (!peek_symbol(")")) {
                while (true) {
                    arr.push(matchfn());
                    if (peek_symbol(delimiter)) {
                        lex.next();
                    } else {
                        break;
                    }
                }
            }
            match_symbol(")");
            return arr;
        }

        function match_parameter() {
            var start = lex.position();
            var type = match_type();
            var name = match_ident();
            return {
                id: new_id(),
                location: location(start),
                tag: 'parameter',
                type: type,
                name: name
            };
        }

        /// Only capable of matching void, int, and int[].
        function match_type() {
            var t = lex.next();
            var tn = t.value;
            switch (tn) {
                case 'void': break;
                case 'int': break;
                default: throw_error(t.position, "Expected 'int' or 'void', found " + tn);
            }
            if (peek_symbol("[")) {
                match_symbol("[");
                match_symbol("]");
                return tn + "[]";
            } else {
                return tn;
            }
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

        self.parse_program = function() {
            return match_program();
        };

        self.parse_expression = function() {
            return match_expression(0);
        };

        return self;
    };

    var self = {};

    self.parse_program = function(source) {
        var p = Parser(Lexer(CharStream(source)));
        return p.parse_program();
    }

    self.parse_expression = function(source) {
        var p = Parser(Lexer(CharStream(source)));
        return p.parse_expression();
    };

    return self;
}();

if (typeof module !== 'undefined' && typeof process !== 'undefined') {
    if (process.argv.length <= 2) {
        console.log("Usage: node parser.js <filename>\nWill print a json AST to stdout.");
    } else {
        var filename = process.argv[2];
        var fs = require('fs');
        fs.readFile(filename, 'utf8', function (err,data) {
            if (err) {
                console.log(err);
            } else {
                var ast = java_parsing.parse_program(data);
                console.log(JSON.stringify(ast));
            }
        });
    }
}

