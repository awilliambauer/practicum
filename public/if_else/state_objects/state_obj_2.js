/*
 Questions:
 Do we want special prompt for JUST an if statement?
 Current prompt is: "Let's find the first branch that evaluates to true."

 Add one copy of AST
 one array
 */

var state = [
    {
        prompt: "If/Else: Before starting, note the separate if/else blocks that are highlighted."
    },

    {
        prompt: "Initialization: What are the starting values of our variables?",
        lineNum: 1,
        answer: {x: 8, y: 30}
    },

    {
        prompt: "Initialization: What is the starting value of this variable?",
        lineNum: 2,
        vars: {
            1: {x: 3, y: 20}
        },
        answer: {z: 7},
        updated: [x, y]
    },

    {
        prompt: "Conditionals: We're at the beginning of a new if/else block. Let's find the first branch that evaluates to true.",
        lineNum: 4,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 7}
        },
        updated: [z]
    },

    {
        prompt: "Booleans: What does this expression evaluate to?",
        lineNum: 4,
        testResult: true,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 7}
        }
    },

    {
        prompt: "If/Else: Since this branch evaluated to true, we won't enter any of the following branches.",
        lineNum: 4,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 7}
        },
        bools: {4: true}
    },

    {
        prompt: "Assignment: What is the value of this variable after this line executes?",
        lineNum: 5,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4}
        },
        answer: {z: 13},
        bools: {4: true}
    },

    {
        prompt: "Conditionals: We're at the beginning of a new if/else block. Let's find the first branch that evaluates to true.",
        lineNum: 8,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            5: {x: 15, y: 20, z: 13}
        },
        bools: {4: true},
        updated: [z]
    },

    {
        prompt: "Booleans: What does this expression evaluate to?",
        lineNum: 8,
        testResult: true,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 7},
            5: {x: 15, y: 20, z: 13}
        },
        bools: {4: true}
    },

    {
        prompt: "If/Else: Since this branch evaluated to true, we won't enter any of the following branches.",
        lineNum: 8,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 7},
            5: {x: 15, y: 20, z: 13}
        },
        bools: {4: true, 8: true}
    },

    {
        prompt: "Assignment: What is the value of this variable after this line executes?",
        lineNum: 9,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 7},
            5: {x: 15, y: 20, z: 13}
        },
        answer: {y: 25},
        bools: {4: true, 8: true}
    },

    {
        prompt: "Assignment: What is the value of this variable after this line executes?",
        lineNum: 10,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            5: {x: 15, y: 20, z: 13},
            9: {x: 15, y: 25, z: 13}
        },
        answer: {x: 30},
        bools: {4: true, 8: true},
        updated: [z]
    },

    {
        prompt: "Conditionals: We're at the beginning of a new if/else block. Let's find the first branch that evaluates to true.",
        lineNum: 13,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            5: {x: 15, y: 20, z: 13},
            9: {x: 15, y: 25, z: 13},
            10: {x: 30, y: 25, z: 13}
        },
        bools: {4: true, 8: true},
        updated: [z]
    },

    {
        prompt: "Booleans: What does this expression evaluate to?",
        lineNum: 13,
        testResult: false,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            5: {x: 15, y: 20, z: 13},
            9: {x: 15, y: 25, z: 13},
            10: {x: 30, y: 25, z: 13}
        },
        bools: {4: true, 8: true}
    },

    {
        prompt: "If/Else: Since this test evaluated to false, we won't go into this branch.",
        lineNum: 13,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            5: {x: 15, y: 20, z: 13},
            9: {x: 15, y: 25, z: 13},
            10: {x: 30, y: 25, z: 13}
        },
        bools: {4: true, 8: true, 13: false},
        crossOut: [14]
    },

    {
        prompt: "Answer: Now use your variable bank to fill in the answer!",
        lineNum: 17,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            5: {x: 15, y: 20, z: 13},
            9: {x: 15, y: 25, z: 13},
            10: {x: 30, y: 25, z: 13}
        },
        bools: {4: true, 8: true, 13: false},
        crossOut: [14]
    }
];
