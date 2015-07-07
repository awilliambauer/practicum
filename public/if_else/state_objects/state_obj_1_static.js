var state = [
    {
        "prompt": "First, look at the structure of the code in the problem",
        "initialization": {"x": 3, "y": 20},
        "lineNum": 1,
        "vars": {},
        "highlighted": []
    },
    {
        "prompt": "This problem has two separate if/else blocks",
        "lineNum": 1,
        "vars": {},
        "highlighted": ["blocks"]
    },
    {
        "prompt": "Next, look at the method call",
        "lineNum": 1,
        "vars": {},
        "highlighted": ["blocks", 1]
    },
    {
        "prompt": "What are the initial values of x and y? x = 3, y = 20",
        "lineNum": 1,
        "vars": {},
        "highlighted": ["blocks", 1]
    },
    {
        "prompt": "Add these variables to the variable bank to keep track",
        "lineNum": 1,
        "vars": {"x": 3, "y": 20},
        "highlighted": ["blocks",1]
    },
    {
        "prompt": "Now walk through the code line-by-line, keeping track of variable values in the variable back.",
        "lineNum": 1,
        "vars": {"x": 3, "y": 20},
        "highlighted": ["blocks"]
    },
    {
        "prompt": "This line sets the variable z equal to 4",
        "lineNum": 2,
        "vars": {"x": 3, "y": 20},
        "highlighted": ["blocks",2]
    },
    {
        "prompt": "Add z to the variable bank",
        "lineNum": 2,
        "vars": {"x": 3, "y": 20, "z": 4},
        "highlighted": ["blocks",2]
    },

    {
        "prompt": "We're at the beginning of a new if/else block",
        "lineNum": 4,
        "vars": {"x": 3, "y": 20, "z": 4},
        "highlighted": ["blocks",4]
    },
    {
        "prompt": "Does this conditional evaluate to true? No, so we skip it.",
        "lineNum": 4,
        "vars": {"x": 3, "y": 20, "z": 4},
        "highlighted": ["blocks",4]
    },
    {
        "prompt": "There are no 'else if' statements, so we move on to the else branch.",
        "lineNum": 6,
        "vars": {"x": 3, "y": 20, "z": 4},
        "highlighted": ["blocks",6]
    },
    {
        "prompt": "This is the next line we will execute.",
        "lineNum": 7,
        "vars": {"x": 3, "y": 20, "z": 4},
        "highlighted": ["blocks",7]
    },
    {
        "prompt": "This line sets the variable z = z + 9. Now z = 13.",
        "lineNum": 7,
        "vars": {"x": 3, "y": 20, "z": 4},
        "highlighted": ["blocks",7]
    },
    {
        "prompt": "Update z in the variable bank.",
        "lineNum": 7,
        "vars": {"x": 3, "y": 20, "z": 13},
        "highlighted": ["blocks",7]
    },

    {
        "prompt": "We're at the beginning of a new if/else block",
        "lineNum": 10,
        "vars": {"x": 3, "y": 20, "z": 13},
        "highlighted": ["blocks",10]
    },
    {
        "prompt": "Does this conditional evaluate to true? No, so we skip it.",
        "lineNum": 10,
        "vars": {"x": 3, "y": 20, "z": 13},
        "highlighted": ["blocks",10]
    },
    {
        "prompt": "There is an 'else if' statement to evaluate.",
        "lineNum": 12,
        "vars": {"x": 3, "y": 20, "z": 13},
        "highlighted": ["blocks",12]
    },
    {
        "prompt": "Does this conditional evaluate to true? Yes, so we enter this branch.",
        "lineNum": 12,
        "vars": {"x": 3, "y": 20, "z": 13},
        "highlighted": ["blocks",12]
    },
    {
        "prompt": "This is the next line we will execute.",
        "lineNum": 13,
        "vars": {"x": 3, "y": 20, "z": 4},
        "highlighted": ["blocks",13]
    },
    {
        "prompt": "This line sets the variable y = y - 3. Now y = 17.",
        "lineNum": 13,
        "vars": {"x": 3, "y": 20, "z": 4},
        "highlighted": ["blocks",13]
    },
    {
        "prompt": "Update y in the variable bank.",
        "lineNum": 13,
        "vars": {"x": 3, "y": 17, "z": 13},
        "highlighted": ["blocks",13]
    },

    {
        "prompt": "This is the next line we will execute.",
        "lineNum": 17,
        "vars": {"x": 3, "y": 17, "z": 13},
        "highlighted": ["blocks",17]
    },
    {
        "prompt": "We're at a println statement that prints (z + ' ' + y). What will it print? '13 17'",
        "lineNum": 17,
        "vars": {"x": 3, "y": 17, "z": 13},
        "highlighted": ["blocks",17]
    },
    {
        "prompt": "Enter the solution in the solution box",
        "lineNum": 17,
        "vars": {"x": 3, "y": 17, "z": 13},
        "highlighted": ["blocks","solution"]
    }
];