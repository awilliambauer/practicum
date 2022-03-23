
var python_parsing = function() {
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
            if (c === "\n" || c.charCodeAt(0) == NEW_LINE) {
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

        self.home = function() {
            bufidx -= col;
            col = 0;
        }

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

        var keywords = {
            "def":1, "return":1, "break":1, "continue":1, "print":1,
            "for":1, "in":1, "if":1, "else":1, "elif":1, "while":1, "class": 1
        };

        var symbols = {
            "[":1, "]":1, "{":1, "}":1, "(":1, ")":1, ":":1,
            "=":1, ";":1, ".":1, ",":1,
            "<":1, ">":1, "<=":1, ">=":1, "==":1, "!=":1,
            "+":1, "-":1, "*":1, "/":1, "!":1, "%":1,
            "+=":1, "-=":1, "*=":1, "/=":1, "%=":1,
            "&":1, "|":1, "and":1, "or":1, "\t":1,
            "\n":1, "**":1,
        };

        function iseof() {
            return cs.iseof();
        }
        self.iseof = iseof;

        function isspace(c) {
            return c === ' ' || c === '\r';
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
            while (!cs.iseof() && (cs.peek() !== "\n" || cs.peek().charCodeAt(0) !== NEW_LINE)) {
                text += cs.next();
            }
            // read the ending newline
            if (!cs.iseof()) cs.next();
            return text.trim();
        }

        function skip_whitespace() {
            while (!cs.iseof() && (isspace(cs.peek()) || iscommentstart(cs.peek()))) {
                if (iscommentstart(cs.next())) {
                    read_until_newline();
                }
            }
        }

        function get_next() {
            skip_whitespace();

            if (iseof()) {
                throw_error(cs.position(), "Unexpected EOF.");
            }

            var pos = cs.position();
            var c = cs.next();
            var token;

            // check for tokens
            if (c in symbols) {
                if ((c + cs.peek()) in symbols) {
                    token = Token.symbol(c + cs.next());
                } 
                else {
                    token = Token.symbol(c);
                }
            } 
            else if (isalpha(c)) {
                var ident = c;
                while (!cs.iseof() && isident(cs.peek())) {
                    c = cs.next();
                    ident += c;
                }
                token = ident in keywords ? Token.keyword(ident) : Token.identifier(ident);
                // ONLY for "and" and "or" case.
                if (ident in symbols) {
                  token = ident in symbols ? Token.symbol(ident) : Token.identifier(ident);
                }
            } 
            else if (isdigit(c)) {
                var num = c;
                var is_double = false;
                while (!cs.iseof() && (isdigit(cs.peek()) || cs.peek() === '.')) {
                    c = cs.next();
                    is_double = is_double || c === '.';
                    num += c;
                }
                token = (is_double ? Token.double : Token.integer)(parseFloat(num));
            } 
            else if (c === '"') {
                var str = "";
                while (cs.peek() !== '"') {
                    str += cs.next();
                }
                cs.next();
                token = Token.string(str);
            } 
            else if (c === "'") {
                var str = "";
                while (cs.peek() !== "'") {
                    str += cs.next();
                }
                cs.next();
                token = Token.string(str);
            }
            else if (c.charCodeAt(0) == HORIZONTAL_TAB) {
                  token = Token.symbol("\t");
            } 
            else if (c.charCodeAt(0) == NEW_LINE) {
                token = Token.symbol("\n");
            }
            else {
                throw_error(pos, sprintf("Unexpected character '{0}'", c));
            }

            skip_whitespace();


            token.position = pos;
            return token;
        }

        function peek() {
            if (!is_peeked && !iseof()) {
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

        function home() {
            cs.home();
            is_peeked = false;
            peek();
        }
        self.home = home

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
            
            // HACK: top-level function definition for legacy problems
            // TODO: abstract function definitions so this is not necessary
            if (lex.peek().value == "def") {
                return match_method(0);
            } else {   
                // var name = "dummy_function";
                var params = "";
                var body = match_block(0);
                // console.log(JSON.stringify(body, null, 2));
            }

            return {
                id: new_id(),
                location: location(start),
                tag: 'block',
                name: name,
                params: params,
                body: body,
            };
        }

        function match_method(indent_level) {
            var start = lex.position();
            match_keyword("def");
            var name = match_ident();
            var params = match_delimited_list(match_parameter, ",");
            match_symbol(":");
            var body = match_block(indent_level + 1);
            // console.log(JSON.stringify(body, null, 2));

            return {
                id: new_id(),
                location: location(start),
                tag: 'method',
                name: name,
                params: params,
                body: body,
            };
        }
        
        function match_class(indent_level) {
            var start = lex.position();
            match_keyword("class");
            var name = match_ident();
            match_symbol(":");
            
            var body = match_block(indent_level + 1);

            return {
                id: new_id(),
                location: location(start),
                tag: 'class',
                name: name,
                // params: params,
                body: body,
            };
        }
        
        // Peeks and calls the appropriate match.
        function match_class_method_or_statement(indent_level) {
            if (lex.peek().value == "def") {
                return match_method(indent_level);
            } else if (lex.peek().value == "class") {
                return match_class(indent_level);
            } else {                
                return match_statement(indent_level);
            }
        }

        function match_block(indent_level) {            
            // Skip newline at start of block
            if (peek_symbol("\n")) {
                match_symbol("\n");
            }
            
            var stmts = [];
            // first line in block must be fully indented
            for (let i = 0; i < indent_level; i++) {
                match_symbol("\t");
            }
            
            stmts.push(match_class_method_or_statement(indent_level));
            
            while (true) {
                // Skip newlines within block
                if (peek_symbol("\n")) {
                    match_symbol("\n");
                }
                
                // Stop parsing block at end of file.
                if (lex.iseof()) return stmts;
                
                // Stop parsing block if indent level decreases 
                for (let i = 0; i < indent_level; i++) {
                    if (!peek_symbol("\t")) {
                        lex.home();
                        return stmts;
                    }
                    match_symbol("\t")
                }
                
                // Otherwise, push to statements.
                stmts.push(match_class_method_or_statement(indent_level));
            }
        }

        function match_statement(indent_level) {
            var next = lex.peek();
            switch (next.value) {
                case "for": return match_forloop(indent_level);
                case "if": return match_ifelse(indent_level);
                case "while": return match_whileloop(indent_level);
                case "return": return match_return_statement();
                case "print": return match_print_statement();
                case "break": return match_break();
                case "continue": return match_continue();
                default: return match_simple_statement(false);
            }
        }

        function match_return_statement() {
            var start = lex.position();
            match_keyword("return");
            var values = match_delimited_list(function(){return match_expression(0);}, ",");
            return {
                id:new_id(),
                location: location(start),
                tag: "expression",
                expression: {
                    id: new_id(),
                    location: location(start),
                    tag: "return",
                    args: {type: "array", value: values}
                }
            };
        }

        function match_print_statement() {
            var start = lex.position();
            match_keyword("print");
            var values = match_delimited_list(function(){return match_expression(0);}, ",");
            return {
                id:new_id(),
                location: location(start),
                tag: "expression",
                expression: {
                    id: new_id(),
                    location: location(start),
                    tag: "print",
                    args: {type: "array", value: values}
                }
            };
        }

        function match_break() {
            var start = lex.position();
            match_keyword("break");
            return {
                id: new_id(),
                location: location(start),
                tag: "break"
            };
        }

        function match_continue() {
            var start = lex.position();
            match_keyword("continue");
            return {
                id: new_id(),
                location: location(start),
                tag: "continue"
            };
        }

        function match_simple_statement(do_match_ending_semicolon) {
            var start = lex.position();
            var next = lex.peek();
            var result;
            switch (next.type) {
                case TokenType.IDENTIFIER:
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

        function match_whileloop(indent_level) {
            var start = lex.position();
            match_keyword("while");
            var cond = match_expression(0);
            match_symbol(":");
            var body = match_block(indent_level + 1);
            return {
                id: new_id(),
                location: location(start),
                tag:'while',
                condition: cond,
                body: body
            };
        }

        function match_forloop(indent_level) {
            var start = lex.position();
            match_keyword("for");
            var variable = {id:new_id(), location:location(lex.position()), tag:'identifier', value:match_ident()};
            match_keyword("in");
            var iter = match_expression(0);
            match_symbol(":");
            var body = match_block(indent_level + 1);
            return {
                id: new_id(),
                location: location(start),
                tag:'for',
                variable: variable,
                iterable: iter,
                body: body
            };
        }

        function match_ifelse(indent_level, is_elif=false) {
            var start = lex.position();
            if (!is_elif) match_keyword("if");
            else match_keyword("elif");
            var cond = match_expression(0);
            var has_elif = false;
            var elseb = undefined;
            match_symbol(":");
            var thenb = match_block(indent_level + 1);
            // this for loop matches the right number of tabs before the elif/else, so that the peek gives us that token
            for (let i = 0; i < indent_level; i++) if (peek_symbol("\t")) match_symbol("\t");
            if (!lex.iseof() && peek_keyword("elif")) {
                has_elif = true;
                elseb = match_ifelse(indent_level, true);
            } else if (!lex.iseof() && peek_keyword("else")) {
                match_keyword("else");
                match_symbol(":");
                elseb = match_block(indent_level + 1);
            } else { // did not find an elif/else keyword
                lex.home(); // needs to un-match the tabs if there was not an elif/else
            }

            var result = {
                id: new_id(),
                location: location(start),
                tag: 'if',
                condition: cond,
                then_branch: thenb,
                else_is_elif: has_elif,
                else_branch: elseb
            };
            return result;
        }

        function match_declaration() {
            var start = lex.position();
            var expression = match_expression(0);
            return {
                id: new_id(),
                location: location(start),
                tag: "declaration",
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
        
        function match_new_line() {
            
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
                case TokenType.SYMBOL:
                    if (t.value === '\n') {
                        // New line denotes the end of an expression.
                        // So, we ignore this character and match the next char                       
                        return match_statement();
                    } else if (t.value === '(') {
                        var e = match_expression(0);
                        match_symbol(")"); // ) has bind power of 0, so match_expression halts and doesn't consume it
                        return {id:new_id(), location:location(start), tag:'paren_expr', value:e};
                    } else if (t.value === "-") {
                        let peek_type = lex.peek().type
                        if (peek_type === TokenType.INT_LITERAL || peek_type === TokenType.DOUBLE_LITERAL) {
                            t = lex.next();
                            return {id:new_id(), location:location(start), tag:'literal', type:(peek_type===TokenType.INT_LITERAL?'int':'double'), value:t.value*-1};
                        }
                        throw_error(t.position, "only integers can be negative");
                    } else if (t.value === '[') {
                        let arr = match_delimited_list(function(){return match_expression(0);}, ',', true, "[]");
                        return {id:new_id(), location:location(start), tag:'literal', type:'array', value:arr};
                    } else {

                        throw_error(t.position, "( is the only symbol that can prefix an expression");
                        break;
                    }
                    break;
                default: throw_error(t.position, "Expected expression");
            }
        }

        // match binary operators
        function match_infix(left) {
            var start = lex.position();
            var t = lex.next();
            switch (t.value) {
                // reference
                case ".":
                    var name = match_ident();
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
                case "*": case "/": case "%": case "**":return 60;
                case "+":  case "-": return 50;
                case "==": case "!=": case "<=": case ">=": case "<": case ">": return 40;
                case "and": case "or": return 30;
                case "=": case "*=": case "/=": case "%=": case "+=":  case "-=": return 10;
                case ";": case ")": case "]": case ",": case ":": case "\t": case "\n": return 0;
                default: throw new Error("unknown operator " + token.value);
            }
        }

        /// match a list of items delimited by a symbol (e.g., comma or semicolon)
        function match_delimited_list(matchfn, delimiter, do_skip_open_parn, brackets="()") {
            var arr = [];
            if (!do_skip_open_parn) {
                match_symbol(brackets[0]);
            }
            if (!peek_symbol(brackets[1])) {
                while (true) {
                    arr.push(matchfn());
                    if (peek_symbol(delimiter)) {
                        lex.next();
                    } else {
                        break;
                    }
                }
            }
            match_symbol(brackets[1]);
            return arr;
        }

        function match_parameter() {
            var start = lex.position();
            var name = match_ident();
            return {
                id: new_id(),
                location: location(start),
                tag: 'parameter',
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
                    token_to_string(lex.peek())));
            } else { // only advance if there is no error?
                lex.next(); // advance lexer but ignore result
            }
        }

        function peek_token(expected_type, expected_value) {
            var t = lex.peek();
            return t.type === expected_type && t.value === expected_value;
        }

        self.parse_program = function() {
            return match_program(); //We choose match_program over match method since it can be a method/class/or just code without a method
        };

        self.parse_method = function() {
            return match_method(0);
        };

        self.parse_expression = function() {
            return match_expression(0);
        };

        self.parse_statement = function() {
            return match_statement(0);
        };

        return self;
    };

    var self = {};

    self.parse_program = function(source) {
        var p = Parser(Lexer(CharStream(source)));
        return p.parse_program();
    };

    self.parse_method = function(source) {
        var p = Parser(Lexer(CharStream(source)));
        return p.parse_method();
    };

    self.parse_expression = function(source) {
        var p = Parser(Lexer(CharStream(source)));
        return p.parse_expression();
    };

    self.parse_statement = function(source) {
        var p = Parser(Lexer(CharStream(source)));
        return p.parse_statement();
    };

    return self;
}();

if (typeof module !== 'undefined' && typeof process !== 'undefined') {
    if (process.argv.length <= 2) {

    } else {
        var filename = process.argv[2];
        var fs = require('fs');
        fs.readFile(filename, 'utf8', function (err,data) {
            if (err) {

            } else {
                var ast = python_parsing.parse_program(data);

            }
        });
    }
}
