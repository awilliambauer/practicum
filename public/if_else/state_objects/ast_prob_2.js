/**
 * Created by Will on 5/26/15.
 */
var ast = {
    "tag"
:
    "method", "id"
:
    59, "name"
:
    "ifElseMystery2", "params"
:
    [{"id": 1, "tag": "parameter", "type": "int", "name": "x"}, {
        "id": 2,
        "tag": "parameter",
        "type": "int",
        "name": "y"
    }], "body"
:
    [{
        "id": 3,
        "tag": "declaration",
        "type": "int",
        "expression": {
            "id": 5,
            "tag": "binop",
            "operator": "=",
            "args": [{"id": 4, "tag": "identifier", "value": "z"}, {"id": 6, "tag": "literal", "value": 2}]
        }
    }, {
        "id": 16,
        "tag": "if",
        "condition": {
            "id": 8,
            "tag": "binop",
            "operator": "<",
            "args": [{"id": 7, "tag": "identifier", "value": "z"}, {"id": 9, "tag": "identifier", "value": "x"}]
        },
        "then_branch": [{
            "id": 10,
            "tag": "expression",
            "expression": {
                "id": 12,
                "tag": "binop",
                "operator": "=",
                "args": [{"id": 11, "tag": "identifier", "value": "x"}, {
                    "id": 14,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{"id": 13, "tag": "identifier", "value": "x"}, {"id": 15, "tag": "literal", "value": 12}]
                }]
            }
        }]
    }, {
        "id": 34,
        "tag": "if",
        "condition": {
            "id": 20,
            "tag": "binop",
            "operator": ">",
            "args": [{
                "id": 18,
                "tag": "binop",
                "operator": "+",
                "args": [{"id": 17, "tag": "identifier", "value": "z"}, {"id": 19, "tag": "identifier", "value": "y"}]
            }, {"id": 21, "tag": "identifier", "value": "x"}]
        },
        "then_branch": [{
            "id": 22,
            "tag": "expression",
            "expression": {
                "id": 24,
                "tag": "binop",
                "operator": "=",
                "args": [{"id": 23, "tag": "identifier", "value": "y"}, {
                    "id": 26,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{"id": 25, "tag": "identifier", "value": "y"}, {"id": 27, "tag": "literal", "value": 5}]
                }]
            }
        }, {
            "id": 28,
            "tag": "expression",
            "expression": {
                "id": 30,
                "tag": "binop",
                "operator": "=",
                "args": [{"id": 29, "tag": "identifier", "value": "x"}, {
                    "id": 32,
                    "tag": "binop",
                    "operator": "*",
                    "args": [{"id": 31, "tag": "identifier", "value": "x"}, {"id": 33, "tag": "literal", "value": 2}]
                }]
            }
        }]
    }, {
        "id": 44,
        "tag": "if",
        "condition": {
            "id": 36,
            "tag": "binop",
            "operator": ">",
            "args": [{"id": 35, "tag": "identifier", "value": "y"}, {"id": 37, "tag": "identifier", "value": "x"}]
        },
        "then_branch": [{
            "id": 38,
            "tag": "expression",
            "expression": {
                "id": 40,
                "tag": "binop",
                "operator": "=",
                "args": [{"id": 39, "tag": "identifier", "value": "z"}, {
                    "id": 42,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{"id": 41, "tag": "identifier", "value": "z"}, {
                        "id": 43,
                        "tag": "identifier",
                        "value": "y"
                    }]
                }]
            }
        }]
    }, {
        "id": 45,
        "tag": "expression",
        "expression": {
            "id": 58,
            "tag": "call",
            "object": {
                "id": 48,
                "tag": "reference",
                "object": {
                    "id": 47,
                    "tag": "reference",
                    "object": {"id": 46, "tag": "identifier", "value": "System"},
                    "name": "out"
                },
                "name": "println"
            },
            "args": [{
                "id": 56,
                "tag": "binop",
                "operator": "+",
                "args": [{
                    "id": 54,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{
                        "id": 52,
                        "tag": "binop",
                        "operator": "+",
                        "args": [{
                            "id": 50,
                            "tag": "binop",
                            "operator": "+",
                            "args": [{"id": 49, "tag": "identifier", "value": "x"}, {
                                "id": 51,
                                "tag": "literal",
                                "value": " "
                            }]
                        }, {"id": 53, "tag": "identifier", "value": "y"}]
                    }, {"id": 55, "tag": "literal", "value": " "}]
                }, {"id": 57, "tag": "identifier", "value": "z"}]
            }]
        }
    }]
};