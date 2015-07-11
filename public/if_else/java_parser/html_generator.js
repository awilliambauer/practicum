"use strict";

var LINENUM = 1;
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

	switch (node.tag) {
		case 'method':
			var elem = $('<ul>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			// elem.append($("<li>").html('public class <span style="color:purple">A</span> {'));
			var text = $("<li>").html(LINENUM + "\t" + indent(0) + 'public static void <span style="color:purple">' + node.name + '</span>(');
			text.addClass(LINENUM + "");
			LINENUM++;    
			firstIter = true;
			node.params.forEach(function(p) {
				if (!firstIter) {
					text.append(", ");
				}
				firstIter = false;
				text.append(to_dom(p, -1));
			});
			text.append(') {');
			elem.append(text);
			node.body.forEach(function(s) {
				if (s.tag === 'if') {
					// hack to add a blank line before each if/else block
					elem.append($("<li>").text((LINENUM)).addClass(LINENUM + ""));
					LINENUM++;
				}
				elem.append(to_dom(s, 1));
			});
			elem.append($("<li>").text(LINENUM + "\t" + indent(0) + "}").addClass(LINENUM + ""));
			LINENUM++;
			// elem.append($("<li>").text("}"));
			break;

		case 'parameter':
			var elem = $('<span>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			elem.html(node.type + ' <span style="color:blue">' + node.name + '</span>');
			break;

		case 'declaration':
			var elem = $('<li>').text(LINENUM + "\t").addClass(LINENUM + "");
			LINENUM++;
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			if (!special_flag) {
				elem.append(indent(indent_level));
			}
			elem.append(node.type + " ");
			elem.append(to_dom(node.expression, indent_level));
			if (!special_flag) {
				elem.append(";");
			}
			break;

		case 'expression':
			var elem = $('<li>').text(LINENUM + "\t").addClass(LINENUM + "");
			LINENUM++;
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			// add some space if top-level (could replace this with something fancier)
			if (!special_flag) {
				if (indent_level <= 2) { elem.append(""); }
				elem.append(indent(indent_level));
			}
			elem.append(to_dom(node.expression, indent_level));
			if (!special_flag) {
				elem.append(";");
			}
			break;

		case 'for':
			var elem = $('<span>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
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
			elem.append(indent(indent_level) + '}');
			break;

		case 'if':
			var elem = $("<span>");
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			var text = $("<li>");
			text.addClass(LINENUM + "").append((LINENUM) + "\t");
			LINENUM++;
			text.append(indent(indent_level));
			if (special_flag) {
				text.append('} <span style="color:purple">else </span>');
			}

			text.append("<span style='color:purple'>if </span>(");
			text.append(to_dom(node.condition, indent_level));
			text.append(") {");
			elem.append(text);
			node.then_branch.forEach(function(s) {
				elem.append(to_dom(s, indent_level + 1));
			});
			if (node.else_branch) {
				// check if the else branch is another if/else, if so, skip brackets/newlines
				if (node.else_branch.tag === 'if') {
					var result = to_dom(node.else_branch, indent_level, true);
					elem.append(result);
				} else {
					var text = indent(indent_level) + '} <span style="color:purple">else </span>{';
					elem.append($("<li>").html(LINENUM + "\t" + text).addClass(LINENUM + ""));
					LINENUM++;
					node.else_branch.forEach(function(s) {
						elem.append(to_dom(s, indent_level + 1));
					});
				}
			}
			if (!special_flag) {
				elem.append($("<li>").text(LINENUM + "\t" + indent(indent_level) + "}").addClass(LINENUM + ""));
				LINENUM++;
			}
			break;

		case 'binop':
			var elem = $('<span>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			elem.append(to_dom(node.args[0], indent_level));
			elem.append(" " + node.operator + " ");
			elem.append(to_dom(node.args[1], indent_level));
			break;

		case 'postfix':
			var elem = $('<span>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			elem.append(to_dom(node.args[0], indent_level));
			elem.append(node.operator);
			break;

		case 'call':
			var elem = $('<span>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			elem.append(to_dom(node.object, indent_level));
			elem.append('(');
			// HACK this totally assumes function calls have only one argument,
			// which happens to be true for array and if/else mysteries.
			elem.append(to_dom(node.args[0], indent_level));
			elem.append(')');
			break;

		case 'index':
			var elem = $('<span>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			elem.append(to_dom(node.object, indent_level));
			elem.append('[');
			elem.append(to_dom(node.index, indent_level));
			elem.append(']');
			break;

		case 'reference':
			var elem = $('<span>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			elem.append(to_dom(node.object, indent_level));
			elem.append('.' + node.name);
			break;

		case 'identifier':
			var elem = $('<span>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
			elem.text(node.value);
			elem.css('color', 'blue');
			break;

		case 'literal':
			var elem = $('<span>');
			var firstIter;
			elem.attr('id', 'java-ast-' + node.id);
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

function on_convert(ast) {
	var dom = to_dom(ast, -1);
	return dom[0];
	// $('#problem_space > pre').html('').append(dom[0]);
	// $('#tohighlight').val().split(' ').forEach(function(id) {
	//     console.log('crossing out ' + id);
	//     set_class_of_ast_dom_element(parseInt(id), 'struck-out');
	// });
}

function on_show() {
	var ast = java_parsing.browser_parse($('#code').val());
	var node = java_ast.find_by_id(parseInt($('#toshow').val()), ast);
	$('#node').html(node.tag);
}
