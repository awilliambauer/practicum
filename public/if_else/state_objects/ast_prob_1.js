/**
 * Created by Will on 5/26/15.
 */
var ast = {
    "tag"
:
    "method", "id"
:
    58, "name"
:
    "ifElseMystery1", "params"
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
            "args": [{"id": 4, "tag": "identifier", "value": "z"}, {"id": 6, "tag": "literal", "value": 4}]
        }
    }, {
        "id": 22,
        "tag": "if",
        "condition": {
            "id": 8,
            "tag": "binop",
            "operator": "<=",
            "args": [{"id": 7, "tag": "identifier", "value": "z"}, {"id": 9, "tag": "identifier", "value": "x"}]
        },
        "then_branch": [{
            "id": 10,
            "tag": "expression",
            "expression": {
                "id": 12,
                "tag": "binop",
                "operator": "=",
                "args": [{"id": 11, "tag": "identifier", "value": "z"}, {
                    "id": 14,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{"id": 13, "tag": "identifier", "value": "x"}, {"id": 15, "tag": "literal", "value": 1}]
                }]
            }
        }],
        "else_branch": [{
            "id": 16,
            "tag": "expression",
            "expression": {
                "id": 18,
                "tag": "binop",
                "operator": "=",
                "args": [{"id": 17, "tag": "identifier", "value": "z"}, {
                    "id": 20,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{"id": 19, "tag": "identifier", "value": "z"}, {"id": 21, "tag": "literal", "value": 9}]
                }]
            }
        }]
    }, {
        "id": 47,
        "tag": "if",
        "condition": {
            "id": 24,
            "tag": "binop",
            "operator": ">",
            "args": [{"id": 23, "tag": "identifier", "value": "z"}, {"id": 25, "tag": "identifier", "value": "y"}]
        },
        "then_branch": [{
            "id": 26,
            "tag": "expression",
            "expression": {
                "id": 28,
                "tag": "postfix",
                "operator": "++",
                "args": [{"id": 27, "tag": "identifier", "value": "y"}]
            }
        }],
        "else_branch": {
            "id": 46,
            "tag": "if",
            "condition": {
                "id": 30,
                "tag": "binop",
                "operator": "<",
                "args": [{"id": 29, "tag": "identifier", "value": "z"}, {"id": 31, "tag": "identifier", "value": "y"}]
            },
            "then_branch": [{
                "id": 32,
                "tag": "expression",
                "expression": {
                    "id": 34,
                    "tag": "binop",
                    "operator": "=",
                    "args": [{"id": 33, "tag": "identifier", "value": "y"}, {
                        "id": 36,
                        "tag": "binop",
                        "operator": "-",
                        "args": [{"id": 35, "tag": "identifier", "value": "y"}, {
                            "id": 37,
                            "tag": "literal",
                            "value": 3
                        }]
                    }]
                }
            }],
            "else_branch": [{
                "id": 38,
                "tag": "expression",
                "expression": {
                    "id": 40,
                    "tag": "binop",
                    "operator": "=",
                    "args": [{"id": 39, "tag": "identifier", "value": "z"}, {
                        "id": 44,
                        "tag": "binop",
                        "operator": "+",
                        "args": [{
                            "id": 42,
                            "tag": "binop",
                            "operator": "+",
                            "args": [{"id": 41, "tag": "identifier", "value": "x"}, {
                                "id": 43,
                                "tag": "identifier",
                                "value": "y"
                            }]
                        }, {"id": 45, "tag": "literal", "value": 7}]
                    }]
                }
            }]
        }
    }, {
        "id": 48,
        "tag": "expression",
        "expression": {
            "id": 57,
            "tag": "call",
            "object": {
                "id": 51,
                "tag": "reference",
                "object": {
                    "id": 50,
                    "tag": "reference",
                    "object": {"id": 49, "tag": "identifier", "value": "System"},
                    "name": "out"
                },
                "name": "println"
            },
            "args": [{
                "id": 55,
                "tag": "binop",
                "operator": "+",
                "args": [{
                    "id": 53,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{"id": 52, "tag": "identifier", "value": "z"}, {"id": 54, "tag": "literal", "value": " "}]
                }, {"id": 56, "tag": "identifier", "value": "y"}]
            }]
        }
    }
    ]
};