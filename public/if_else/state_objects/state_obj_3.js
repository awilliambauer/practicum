var state = [
    {
        "prompt": "If/Else: Before starting, note the separate if/else blocks that are highlighted.",
        "initialization": {"x": 3, "y": 20, "z": 30}
    },

    {
        "prompt": "Initialization: What are the starting values of our variables?",
        "lineNum": 3,
        "answer": {"x": 3, "y": 20, "z": 30}
    },

    {
        "prompt": "Conditionals: We're at the beginning of a new if/else block. Let's find the first branch that evaluates to true.",
        "lineNum": 3,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "updated": ["x", "y", "z"]
    },

    {
        "prompt": "Booleans: What does this expression evaluate to?",
        "lineNum": 3,
        "testResult": false,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        }
    },

    {
        "prompt": "If/Else: Since this test evaluated to false, we won't go into this branch.",
        "lineNum": 3,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {"3": false},
        "crossOut": [4]
    },

    {
        "prompt": "If/Else: Which line should we execute next?",
        "lineNum": 3,
        "nextLine": 5,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {"3": false},
        "crossOut": [4]
    },

    {
        "prompt": "Conditionals: Now that the previous branch of this structure evaluated to false, we need to investigate the next branch.",
        "lineNum": 5,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {"3": false},
        "crossOut": [4]
    },

    {
        "prompt": "Booleans: What does this expression evaluate to?",
        "lineNum": 5,
        "testResult": false,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false
        },
        "crossOut": [4]
    },

    {
        "prompt": "If/Else: Since this test evaluated to false, we won't go into this branch.",
        "lineNum": 5,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false
        },
        "crossOut": [4, 6]
    },


    {
        "prompt": "If/Else: Which line should we execute next?",
        "lineNum": 5,
        "nextLine": 7,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false
        },
        "crossOut": [4, 6]
    },

    {
        "prompt": "Conditionals: Now that the previous branch of this structure evaluated to false, we need to investigate the next branch.",
        "lineNum": 7,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false
        },
        "crossOut": [4, 6]
    },

    {
        "prompt": "Booleans: What does this expression evaluate to?",
        "lineNum": 7,
        "testResult": false,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false
        },
        "crossOut": [4, 6]
    },

    {
        "prompt": "If/Else: Since this test evaluated to false, we won't go into this branch.",
        "lineNum": 7,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false,
            "7": false
        },
        "crossOut": [4, 6, 8, 9]
    },

    {
        "prompt": "If/Else: Which line should we execute next?",
        "lineNum": 7,
        "nextLine": 10,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false,
            "7": false
        },
        "crossOut": [4, 6, 8, 9]
    },

    {
        "prompt": "Conditionals: Since we've evaluated every branch of this structure, we need to move onto the next if/else structure.",
        "lineNum": 10,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false,
            "7": false
        },
        "crossOut": [4, 6, 8, 9]
    },

    {
        "prompt": "Booleans: What does this expression evaluate to?",
        "lineNum": 12,
        "testResult": true,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false,
            "7": false
        },
        "crossOut": [4, 6, 8, 9]
    },

    {
        "prompt": "If/Else: Since this branch evaluated to true, we will enter this branch",
        "lineNum": 12,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false,
            "7": false,
            "12": true
        },
        "crossOut": [4, 6, 8, 9]
    },

    {
        "prompt": "If/Else: Which line should we execute next?",
        "lineNum": 12,
        "nextLine": 13,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "bools": {
            "3": false,
            "5": false,
            "7": false,
            "12": true
        },
        "crossOut": [4, 6, 8, 9]
    },

    {
        "prompt": "Assignment: What is the value of this variable after this line executes?",
        "lineNum": 13,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30}
        },
        "answer": {"z": 3},
        "bools": {
            "3": false,
            "5": false,
            "7": false,
            "12": true
        },
        "crossOut": [4, 6, 8, 9]
    },

    {
        "prompt": "Answer: Now use your variable bank to fill in the answer!",
        "lineNum": 15,
        "vars": {
            "1": {"x": 3, "y": 20, "z": 30},
            "13": {"x": 3, "y": 20, "z": 3}

        },
        "bools": {
            "3": false,
            "5": false,
            "7": false,
            "12": true
        },
        "crossOut": [4, 6, 8, 9],
        "updated": ["z"]
    }
];
/**
 * Created b"y" Alicheae on 5/19/2015.
 */
