var main = {
    "tag": "method",
    "id": 36,
    "name": "mystery",
    "params": [{"id": 1, "tag": "parameter", "type": "int[]", "name": "list"}],
    "body": [{
        "id": 35,
        "tag": "for",
        "initializer": {
            "id": 2,
            "tag": "declaration",
            "type": "int",
            "expression": {
                "id": 4,
                "tag": "binop",
                "operator": "=",
                "args": [{"id": 3, "tag": "identifier", "value": "i"}, {"id": 5, "tag": "literal", "value": 1}]
            }
        },
        "condition": {
            "id": 7,
            "tag": "binop",
            "operator": "<",
            "args": [{"id": 6, "tag": "identifier", "value": "i"}, {
                "id": 9,
                "tag": "reference",
                "object": {"id": 8, "tag": "identifier", "value": "list"},
                "name": "length"
            }]
        },
        "increment": {
            "id": 10,
            "tag": "expression",
            "expression": {
                "id": 12,
                "tag": "postfix",
                "operator": "++",
                "args": [{"id": 11, "tag": "identifier", "value": "i"}]
            }
        },
        "body": [{
            "id": 34,
            "tag": "if",
            "condition": {
                "id": 20,
                "tag": "binop",
                "operator": "==",
                "args": [{
                    "id": 18,
                    "tag": "binop",
                    "operator": "%",
                    "args": [{
                        "id": 17,
                        "tag": "index",
                        "object": {"id": 13, "tag": "identifier", "value": "list"},
                        "index": {
                            "id": 15,
                            "tag": "binop",
                            "operator": "-",
                            "args": [{"id": 14, "tag": "identifier", "value": "i"}, {
                                "id": 16,
                                "tag": "literal",
                                "value": 1
                            }]
                        }
                    }, {"id": 19, "tag": "literal", "value": 2}]
                }, {"id": 21, "tag": "literal", "value": 0}]
            },
            "then_branch": [{
                "id": 22,
                "tag": "expression",
                "expression": {
                    "id": 28,
                    "tag": "postfix",
                    "operator": "++",
                    "args": [{
                        "id": 27,
                        "tag": "index",
                        "object": {"id": 23, "tag": "identifier", "value": "list"},
                        "index": {
                            "id": 25,
                            "tag": "binop",
                            "operator": "-",
                            "args": [{"id": 24, "tag": "identifier", "value": "i"}, {
                                "id": 26,
                                "tag": "literal",
                                "value": 1
                            }]
                        }
                    }]
                }
            }, {
                "id": 29,
                "tag": "expression",
                "expression": {
                    "id": 33,
                    "tag": "postfix",
                    "operator": "++",
                    "args": [{
                        "id": 32,
                        "tag": "index",
                        "object": {"id": 30, "tag": "identifier", "value": "list"},
                        "index": {"id": 31, "tag": "identifier", "value": "i"}
                    }]
                }
            }]
        }]
    }]
}