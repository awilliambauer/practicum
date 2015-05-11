/**
 * Created by meredithlampe on 5/11/15.
 */
var mainAst = {
    "tag": "method",
        "id": 34,
        "name": "arrMys",
        "params": [{"id": 1, "tag": "parameter", "type": "int[]", "name": "arr"}],
        "body": [{
        "id": 33,
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
                "id": 10,
                "tag": "binop",
                "operator": "-",
                "args": [{
                    "id": 9,
                    "tag": "reference",
                    "object": {"id": 8, "tag": "identifier", "value": "arr"},
                    "name": "length"
                }, {"id": 11, "tag": "literal", "value": 1}]
            }]
        },
        "increment": {
            "id": 12,
            "tag": "expression",
            "expression": {
                "id": 14,
                "tag": "postfix",
                "operator": "++",
                "args": [{"id": 13, "tag": "identifier", "value": "i"}]
            }
        },
        "body": [{
            "id": 15,
            "tag": "expression",
            "expression": {
                "id": 19,
                "tag": "binop",
                "operator": "=",
                "args": [{
                    "id": 18,
                    "tag": "index",
                    "object": {"id": 16, "tag": "identifier", "value": "arr"},
                    "index": {"id": 17, "tag": "identifier", "value": "i"}
                }, {
                    "id": 27,
                    "tag": "binop",
                    "operator": "+",
                    "args": [{
                        "id": 21,
                        "tag": "binop",
                        "operator": "*",
                        "args": [{"id": 20, "tag": "identifier", "value": "i"}, {
                            "id": 26,
                            "tag": "index",
                            "object": {"id": 22, "tag": "identifier", "value": "arr"},
                            "index": {
                                "id": 24,
                                "tag": "binop",
                                "operator": "-",
                                "args": [{"id": 23, "tag": "identifier", "value": "i"}, {
                                    "id": 25,
                                    "tag": "literal",
                                    "value": 1
                                }]
                            }
                        }]
                    }, {
                        "id": 32,
                        "tag": "index",
                        "object": {"id": 28, "tag": "identifier", "value": "arr"},
                        "index": {
                            "id": 30,
                            "tag": "binop",
                            "operator": "+",
                            "args": [{"id": 29, "tag": "identifier", "value": "i"}, {
                                "id": 31,
                                "tag": "literal",
                                "value": 1
                            }]
                        }
                    }]
                }]
            }
        }]
    }]
};

var states = [
    { //state 1 (initial)
        variables: {
            array: [11, 14, 2, 4, 7],
            arrayLength: 5,
            i: null
        },
        promptText: "Let's solve the problem!",
        ast: mainAst,
        index: null, // null means that they haven't answered yet
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Highlight: [],
            accent2Border: [],
        }
    },

    { //state 1 (initial)
        variables: {
            array: [11, 14, 2, 4, 7],
            arrayLength: 5,
            i: null
        },
        promptText: "Let's label the indices of the array!",
        ast: mainAst,
        index: null,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [".indices"],
            accent1Highlight: [],
            accent1Border: [],
            accent2Highlight: [],
            accent2Border: []
        }
    },

    { //state 2
        variables: {
            array: [11, 14, 2, 4, 7],
            arrayLength: 5,
            i: null
        },
        promptText: "The next line is a for loop header. First, we'll initialize the counter.",
        ast: mainAst,
        index: 0,
        styleClasses: {
            mainColorText: ["#java-ast-3","#java-ast-4", "#java-ast-5"],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border:[],
            accent2Highlight: [],
            accent2Border: []
        }
    },

    { //state 3
        variables: {
            array: [11, 14, 2, 4, 7],
            arrayLength: 5,
            i: null
        },
        promptText: "What is the counter i initialized to?",
        ast: mainAst,
        index: false,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border:[],
            accent2Highlight: [],
            accent2Border: []
        }
    },

    { //state 4
        variables: {
            array: [11, 14, 2, 4, 7],
            arrayLength: 5,
            i: 1
        },
        promptText: "Next, we’ll see if the for loop test passses. Does the for loop test pass?",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border:[],
            accent2Highlight: [],
            accent2Border: []
        }
    }


]
