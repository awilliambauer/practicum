/*
The array of state objects for each step of the first problem
 */
var states = [
    {
        promptText: "Is there at least one multiplication, division, or mod operator? Yes.",
        highlighted: [
            []
        ],
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
    {
        promptText: "Start at the left, and search for the first multiplication, division, or mod operator in the expression.",
        highlighted: [
            []
        ],
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
    {
        promptText: "This is the first multiplication, division, or mod operator.",
        highlighted: [
            [1]
        ],
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
    {
        promptText: "This is the left operand.",
        highlighted: [
            [1,0]
        ],
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
    {
        promptText: "This is the right operand.",
        highlighted: [
            [1,0,2]
        ],
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
    {
        promptText: "We will place the result of this operation here.",
        highlighted: [
            [1,0,2],
            [0]
        ],
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
                {type: "empty"},
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
    {
        promptText: "Set the result to be 22 % 7.",
        highlighted: [
            [1,0,2],
            [0]
        ],
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
    {
        promptText: "Is there at least one multiplication, division, or mod operator? Yes.",
        highlighted: [
            [],
            []
        ],
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
    {
        promptText: "Let's solve the problem!",
        highlighted: [
            [],
            [],
            []
        ],
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
    {
        promptText: "Let's solve the problem!",
        highlighted: [
            [],
            [],
            [],
            []
        ],
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
    {
        promptText: "Let's solve the problem!",
        highlighted: [
            [],
            [],
            [],
            [],
            []
        ],
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
    {
        promptText: "Let's solve the problem!",
        highlighted: [
            [],
            [],
            [],
            [],
            [],
            []
        ],
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
