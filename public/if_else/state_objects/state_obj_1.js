var state = [
    {
        prompt: "If/Else: Before starting, note the separate if/else blocks that are highlighted."
    },

    {
        prompt: "Initialization: What are the starting values of our variables?",
        lineNum: 1,
        answer: {x: 3, y: 20}
    },

    {prompt: "Initialization: What is the starting value of this variable?",
        lineNum: 2,
        vars: {
            1: {x: 3, y: 20}
        },
        answer: {z: 4},
        updated: ["x", "y"]
    },

    {
        prompt: "Conditionals: We're at the beginning of a new if/else block. Let's find the first branch that evaluates to true.",
        lineNum: 4,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4}
        },
        updated: ["z"]
    },

    {
        prompt: "Booleans: What does this expression evaluate to?",
        lineNum: 4,
        testResult: false,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4}
        }
    },

    {
        prompt: "If/Else: Since this test evaluated to false, we won't go into this branch.",
        lineNum: 4,
        crossOut: [5],
        vars: {1: {x: 3, y: 20}, 2: {x: 3, y: 20, z: 4}},
        bools: {4: false},
    },

    {
        prompt: "If/Else: We enter this else branch because all other tests in this structure evaluated to false",
        lineNum: 6,
        crossOut: [5],
        vars: {1: {x: 3, y: 20}, 2: {x: 3, y: 20, z: 4}},
        bools: {4: false},
    },

    {
        prompt: "Assignment: What is the value of this variable after this line executes?",
        lineNum: 7,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
        },
        bools: {4: false},
        answer: {z : 13},
        crossOut: [5]
    },

    {
        prompt: "Conditionals: We're at the beginning of a new if/else block. Let's find the first branch that evaluates to true.",
        lineNum: 10,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            7:{x: 3, y: 20, z: 13}
        },
        bools: {4: false},
        crossOut: [5],
        updated: ["z"]
    },

    {
        prompt: "Booleans: What does this expression evaluate to?",
        lineNum: 10,
        testResult: false,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            7:{x: 3, y: 20, z: 13}
        },
        bools: {4: false},
        crossOut: [5]
    },

    {
        prompt: "If/Else: Since this test evaluated to false, we won't go into this branch.",
        lineNum: 10,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            7:{x: 3, y: 20, z: 13}
        },
        bools: {4: false, 10: false},
        crossOut: [5, 11],
    },

    {
        prompt: "Booleans: What does this expression evaluate to?",
        lineNum: 12,
        testResult: true,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            7: {x: 3, y: 20, z: 13}
        },
        bools: {4: false, 10: false},
        crossOut: [5, 11],
    },

    {
        prompt: "If/Else: Since this branch evaluated to true, we won't enter any of the following branches.",
        lineNum: 12,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            7: {x: 3, y: 20, z: 13}
        },
        bools: {4: false, 10: false, 12: true},
        crossOut: [5, 11, 14, 15]
    },

    {
        prompt: "Assignment: What is the value of this variable after this line executes?",
        lineNum: 13,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            7: {x: 3, y: 20, z: 13}
        },
        answer: {y: 17},
        bools: {4: false, 10: false, 12: true},
        crossOut: [5, 11, 14, 15]
    },

    {
        prompt: "Answer: Now use your variable bank to fill in the answer!",
        lineNum: 17,
        vars: {
            1: {x: 3, y: 20},
            2: {x: 3, y: 20, z: 4},
            7: {x: 3, y: 20, z: 13},
            13: {x: 3, y: 17, z: 13}
        },
        bools: {4: false, 10: false, 12: true},
        updated: ["y"],
        crossOut: [5, 11, 14, 15],
    }
];