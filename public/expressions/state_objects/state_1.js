/*
The array of state objects for each step of the first problem
 */
var states = [
    { //state 1
        promptText: "Let's solve the problem!",
        highlighted: [],
        problemLines: [
            [
                {type: "int", value: 22},
                {type: "MDMoperator", value: "%"},
                {type: "int", value: 7},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ]
        ]
    },
    { //state 2
        promptText: "Let's solve the problem!",
        highlighted: [],
        problemLines: [
            [
                {type: "int", value: 22},
                {type: "MDMoperator", value: "%"},
                {type: "int", value: 7},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ]
        ]
    },
    { //state 3
        promptText: "Let's solve the problem!",
        highlighted: [],
        problemLines: [
            [
                {type: "int", value: 22},
                {type: "MDMoperator", value: "%"},
                {type: "int", value: 7},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 12},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ]
        ]
    },
    { //state 4
        promptText: "Let's solve the problem!",
        highlighted: [],
        problemLines: [
            [
                {type: "int", value: 22},
                {type: "MDMoperator", value: "%"},
                {type: "int", value: 7},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 12},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 12},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 3.0}
            ]
        ]
    },
    { //state 5
        promptText: "Let's solve the problem!",
        highlighted: [],
        problemLines: [
            [
                {type: "int", value: 22},
                {type: "MDMoperator", value: "%"},
                {type: "int", value: 7},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 12},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 12},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 3.0}
            ],
            [
                {type: "int", value: 13},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 3.0}
            ]
        ]
    },
    { //state 6
        promptText: "Let's solve the problem!",
        highlighted: [],
        problemLines: [
            [
                {type: "int", value: 22},
                {type: "MDMoperator", value: "%"},
                {type: "int", value: 7},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 4},
                {type: "MDMoperator", value: "*"},
                {type: "int", value: 3},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 12},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 6.0},
                {type: "MDMoperator", value: "/"},
                {type: "double", value: 2}
            ],
            [
                {type: "int", value: 1},
                {type: "ASoperator", value: "+"},
                {type: "int", value: 12},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 3.0}
            ],
            [
                {type: "int", value: 13},
                {type: "ASoperator", value: "-"},
                {type: "double", value: 3.0}
            ],
            [
                {type: "int", value: 10.0}
            ]
        ]
    }
];
