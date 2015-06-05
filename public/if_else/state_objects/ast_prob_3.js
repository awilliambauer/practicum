/**
 * Created by Will on 5/26/15.
 */
var ast = {
    "tag"
:
    "method", "id"
:
    64, "name"
:
    "ifElseMystery3", "params"
:
    [{"id": 1, "tag": "parameter", "type": "int", "name": "x"}, {
        "id": 2,
        "tag": "parameter",
        "type": "int",
        "name": "y"
    }, {"id": 3, "tag": "parameter", "type": "int", "name": "z"}], "body"
:
    [{
        "id": 41,
        "tag": "if",
        "condition": {
            "id": 5,
            "tag": "binop",
            "operator": ">",
            "args": [{"id": 4, "tag": "identifier", "value": "x"}, {"id": 6, "tag": "identifier", "value": "y"}]
        },
        "then_branch": [{
            "id": 7,
            "tag": "expression",
            "expression": {
                "id": 9,
                "tag": "binop",
                "operator": "=",
                "args": [{"id": 8, "tag": "identifier", "value": "x"}, {
                    "id": 11,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{"id": 10, "tag": "literal", "value": 9}, {"id": 12, "tag": "identifier", "value": "z"}]
                }]
            }
        }],
        "else_branch": {
            "id": 40,
            "tag": "if",
            "condition": {
                "id": 14,
                "tag": "binop",
                "operator": ">",
                "args": [{"id": 13, "tag": "identifier", "value": "x"}, {"id": 15, "tag": "identifier", "value": "z"}]
            },
            "then_branch": [{
                "id": 16,
                "tag": "expression",
                "expression": {
                    "id": 18,
                    "tag": "binop",
                    "operator": "=",
                    "args": [{"id": 17, "tag": "identifier", "value": "y"}, {
                        "id": 22,
                        "tag": "binop",
                        "operator": "+",
                        "args": [{
                            "id": 20,
                            "tag": "binop",
                            "operator": "+",
                            "args": [{"id": 19, "tag": "identifier", "value": "x"}, {
                                "id": 21,
                                "tag": "identifier",
                                "value": "z"
                            }]
                        }, {"id": 23, "tag": "literal", "value": 1}]
                    }]
                }
            }],
            "else_branch": {
                "id": 39,
                "tag": "if",
                "condition": {
                    "id": 25,
                    "tag": "binop",
                    "operator": ">",
                    "args": [{"id": 24, "tag": "identifier", "value": "y"}, {
                        "id": 26,
                        "tag": "identifier",
                        "value": "z"
                    }]
                },
                "then_branch": [{
                    "id": 27,
                    "tag": "expression",
                    "expression": {
                        "id": 29,
                        "tag": "binop",
                        "operator": "=",
                        "args": [{"id": 28, "tag": "identifier", "value": "z"}, {
                            "id": 31,
                            "tag": "binop",
                            "operator": "-",
                            "args": [{"id": 30, "tag": "identifier", "value": "z"}, {
                                "id": 32,
                                "tag": "literal",
                                "value": 7
                            }]
                        }]
                    }
                }, {
                    "id": 33,
                    "tag": "expression",
                    "expression": {
                        "id": 35,
                        "tag": "binop",
                        "operator": "=",
                        "args": [{"id": 34, "tag": "identifier", "value": "y"}, {
                            "id": 37,
                            "tag": "binop",
                            "operator": "+",
                            "args": [{"id": 36, "tag": "identifier", "value": "x"}, {
                                "id": 38,
                                "tag": "literal",
                                "value": 3
                            }]
                        }]
                    }
                }]
            }
        }
    }, {
        "id": 49,
        "tag": "if",
        "condition": {
            "id": 43,
            "tag": "binop",
            "operator": ">",
            "args": [{"id": 42, "tag": "identifier", "value": "y"}, {"id": 44, "tag": "identifier", "value": "x"}]
        },
        "then_branch": [{
            "id": 45,
            "tag": "expression",
            "expression": {
                "id": 47,
                "tag": "binop",
                "operator": "=",
                "args": [{"id": 46, "tag": "identifier", "value": "z"}, {"id": 48, "tag": "literal", "value": 3}]
            }
        }]
    }, {
        "id": 50,
        "tag": "expression",
        "expression": {
            "id": 63,
            "tag": "call",
            "object": {
                "id": 53,
                "tag": "reference",
                "object": {
                    "id": 52,
                    "tag": "reference",
                    "object": {"id": 51, "tag": "identifier", "value": "System"},
                    "name": "out"
                },
                "name": "println"
            },
            "args": [{
                "id": 61,
                "tag": "binop",
                "operator": "+",
                "args": [{
                    "id": 59,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{
                        "id": 57,
                        "tag": "binop",
                        "operator": "+",
                        "args": [{
                            "id": 55,
                            "tag": "binop",
                            "operator": "+",
                            "args": [{"id": 54, "tag": "identifier", "value": "x"}, {
                                "id": 56,
                                "tag": "literal",
                                "value": " "
                            }]
                        }, {"id": 58, "tag": "identifier", "value": "y"}]
                    }, {"id": 60, "tag": "literal", "value": " "}]
                }, {"id": 62, "tag": "identifier", "value": "z"}]
            }]
        }
    }]
}