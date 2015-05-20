/**
 * Created by meredithlampe on 5/11/15.
 */

/*
mainAst is the abstract syntax tree for the current problem.
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
/*
These states hold the current state of the array mystery problem.
array: Holds an array of the values stored in the problem's array
        (not included in variables array because it is placed in the
        dom differently from the other variables)
variables: Holds an associative array mapping variable names to their
            values (includes i, arrayLength and any temporary variables
            that need to be displayed in the variable bank)
promptText: A string containing the text to be displayed.
ast: Holds a reference to the AST of the current problem
index: Holds the label of the first array index. Null means
        the indices have not yet been labeled.
styleClasses: Holds an associative array mapping names of CSS style
                classes to arrays of IDs and classes of elements
                in the DOM to which the CSS style class should be
                applied.
 */
var states = [
    { //state 1 (initial)
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: "?"
        },
        promptText: "Let's solve the problem!",
        ast: mainAst,
        index: null, // null means that they haven't answered yet
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 1 (initial)
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: "?"
        },
        promptText: "Let's label the indices of the array!",
        ast: mainAst,
        index: null,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [".indices"],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    //state 2
    {
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: "?"
        },
        promptText: "The next line is a for loop header. First, we'll initialize the counter.",
        ast: mainAst,
        index: 0,
        styleClasses: {
            mainColorText: ["#init"],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },
    // State 3
    {
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: "?"
        },
        promptText: "What is the counter i initialized to?",
        ast: mainAst,
        index: false,
        styleClasses: {
            mainColorText: ["#init", "#i"],
            mainColorBorder: ["#idiv"],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 4
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "Next, we’ll see if the for loop test passses. Does the for loop test pass?",
        ast: mainAst,
        styleClasses: {
            mainColorText: ["#test"],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    {//state 5
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "The test passed. Let’s execute the code in the body of the for loop.",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
},

    { //state 6
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "The next line of code is an assignment statement so, let’s evaluate the expression on the right side of the assignment statement.",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },
    //the following states need to be checked and worked on.    
    { //state 7
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "What is the value of i?",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 8
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "What is the value of i - 1?",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 9
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "What is the value of a[i – 1]?",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 10
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "What is the value of a[i + 1]?",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 11
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "What is the result of the expression?",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 12
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "Now that we’ve evaluated the right side of the assignment statement, let’s determine where this value is going to be stored. The left side of the assignment statement tells us where to store the value.",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 13
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "Which element of the array is going to store the result of the expression?",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 14
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "Update that element in the array",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 15
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "We’ve reached the end of the for loop body, which means we need to update our counter and reevaluate the for loop test.",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    },

    { //state 13
        array: [11, 14, 2, 4, 7],
        variables: {
            arrayLength: 5,
            i: 1
        },
        promptText: "What is i updated to?",
        ast: mainAst,
        styleClasses: {
            mainColorText: [],
            mainColorBorder: [],
            accent1Highlight: [],
            accent1Border: [],
            accent2Hightlight: [],
            accent2Border: []
        }
    }
    //1 loop iteration

]
