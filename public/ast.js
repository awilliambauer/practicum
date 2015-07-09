
var java_ast = function() {
    "use strict";
    var self = {};

    // things to write helpers for:
    // - find node at particular id
    // - visit all nodes/statements/expressions

    /// Returns an array of all direct child nodes of this node.
    /// Useful for functions that need to recusively explore all nodes.
    function children_of(node) {
        switch (node.tag) {
            case 'method':
                return node.params.concat(node.body);

            case 'declaration':
            case 'expression':
                return [node.expression];

            case 'for':
                return [node.initializer, node.condition, node.increment].concat(node.body);

            case 'if':
                return [node.condition].concat(node.then_branch).concat(node.else_branch ? node.else_branch : []);

            case 'binop':
            case 'postfix':
                return node.args;

            case 'call':
                return [node.object].concat(node.args);

            case 'index':
                return [node.object, node.index];

            case 'reference':
                return [node.object];

            case 'parameter':
            case 'identifier':
            case 'literal':
                return [];

            default:
                throw new Error("unknown ast tag " + node.tag);
        }
    }
    self.children_of = children_of;

    /// Finds and returns the first node `n` for which `predicate(n)` returns true.
    /// Returns null if no node is found.
    function find_first(predicate, node) {
        if (predicate(node)) {
            return node;
        }

        var arr = children_of(node);
        for (var i = 0; i < arr.length; i++) {
            var r = find_first(predicate, arr[i]);
            if (r) return r;
        }

        return null;
    }
    self.find_first = find_first;

    /// Returns an array of ALL nodes `n` such that `predicate(n)` returns true.
    /// Similar to a functional "filter" on lists, only on AST nodes.
    /// (Use find_all(function(){return true;}, ast) to grab an array of all nodes!)
    function find_all(predicate, node) {
        function rec(predicate, node, acc) {
            if (predicate(node)) {
                acc.push(node);
            }

            var arr = children_of(node);
            for (var i = 0; i < arr.length; i++) {
                rec(predicate, arr[i], acc);
            }

            return acc;
        }

        return rec(predicate, node, []);
    }
    self.find_all = find_all;

    /// Returns the node with the given id.
    /// This is mostly an illustration of how to use `find_first`.
    function find_by_id(id, node) {
        if (typeof id !== 'number') throw new Error('id must be a number!');
        if (!node) throw new Error ('node is null!');
        return find_first(function(n) { return n.id === id; }, node);
    }
    self.find_by_id = find_by_id;

    return self;
}();
