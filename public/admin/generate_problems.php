<?php

$PROBLEMS_FILE = "../../problemProcessing/data/ifelse/ifelse_problems";
$METHOD_CALLS_FILE = "../../problemProcessing/data/ifelse/ifelse_method_calls";
$problemContents = file_get_contents($PROBLEMS_FILE);
$methodCalls = file_get_contents($METHOD_CALLS_FILE);

?>


<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title>Practicum</title>
    <link href="favicon.ico" type="image/x-icon" rel="shortcut icon"/>

    <script src="../vendor/jquery/jquery-1.11.2.min.js"></script>
    <script src="../vendor/jquery/jquery.cookie.js"></script>
    <script src="../vendor/d3/d3.js"></script>

    <script src="../js/java/ast.js"></script>
    <script src="../js/java/parser.js"></script>

    <script type="text/javascript" src="../if_else/java_parser/parser.js"></script>

</head>
<body>

<div style="display: none;" >
    <h3 >Problems file = <?= $PROBLEMS_FILE ?></h3>
    <h3 >Method calls file = <?= $METHOD_CALLS_FILE ?></h3>

    <div id="content" style="display: none;">
        <h4> Problem contents: </h4>
        <?= $problemContents ?>
    </div>

    <div id="methodCalls" style="display: none;">
        <h4> Method calls: </h4>
        <?= $methodCalls ?>
    </div>

    <h4> Problem Text </h4>
    <div id="problemText"> </div>

    <h4> Problem JSON: </h4>
</div>

<div id="container"></div>

<script type="text/javascript">

    function replaceN(s, original, changed, count) {
        for (var i = 0; i < count; i++) {
            s = s.replace(original, changed);
        }
        return s;
    }

    function getIfElseArgs(ifElseMethodCall) {
        var args = ifElseMethodCall.replace("ifElseMystery(", "").replace(");", "").split(", ");
        return args;
    }

    // ugh this baby needs some regexes too bad i don't have any internet.
    function cleanProblemText(problemText) {
        problemText = problemText.replace(/OROR/g, "||");

        //
        problemText = problemText.replace(/<.*>/g, "");

        problemText = problemText.replace(/\n/g, "");
        problemText = problemText.replace(/\t/g, "");

        // UGLY, get rid of the prompts. Probably a better way to do this.
        problemText = problemText.replace("For each call below, indicate what output is produced.", "");
        //problemText = problemText.replace(, "");
        problemText = problemText.replace("For each call below to the following method, write the output that is produced, as it would appear on the console:", "");
        problemText = problemText.replace("Consider the following method.", "");
        problemText = problemText.replace("Consider the following method:", "");
        problemText = problemText.replace("For each call below, write the value that is returned", "");

        // A little ugly -- html decode the code
        problemText = $("<div/>").html(problemText).text();

        return problemText;
    }

    function getFormattedProblemText(problemText) {
        problemText = problemText.replace(/OROR/g, "||");

        problemText = problemText.replace(/<.*>/g, "");


        // UGLY, get rid of the prompts. Probably a better way to do this.
        problemText = problemText.replace("For each call below, indicate what output is produced.", "");
        problemText = problemText.replace("For each call below to the following method, write the output that is produced, as it would appear on the console:", "");
        problemText = problemText.replace("Consider the following method.", "");
        problemText = problemText.replace("Consider the following method:", "");
        problemText = problemText.replace("For each call below, write the value that is returned", "");

        // get rid of blank newlines -- not so great for problem formatting
        problemText = problemText.replace(/\n[ \t]*\n/g, "\n");
        problemText = problemText.replace(/\n[ \t]*\n/g, "\n");
        problemText = problemText.replace(/\n[ \t]*\n/g, "\n");
        problemText = problemText.replace(/\n[ \t]*\n/g, "\n");
        problemText = problemText.replace(/\n[ \t]*\n/g, "\n");
        problemText = problemText.replace(/^[ \t]*\n/g, "");
        problemText = problemText.replace(/\t/g, "    ");

        // A little ugly -- html decode the code
        problemText = $("<div/>").html(problemText).text();

        return problemText;
    }


    function getArgNames(problemText) {
        var argsString = problemText.match("\\((int [^)]*)\\)")[1];
        var args = argsString.replace(/int /g, "").split(", ");
        return args;
    }

    function matchArgs(argNames, args) {
        if (argNames.length != args.length) {
            console.error("Not given the same length of args and names, unable to match them");
        }

        var argObj = {};
        for (var i = 0; i < argNames.length; i++) {
            argObj[argNames[i]] = args[i];
        }
        return argObj;
    }

    function generateUUID(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
    };

    function makeASTStates(methodCalls, argNames, AST) {
        var states = [];
        for (var i = 0; i < methodCalls.length; i++) {
            states.push({
                "prompt": "First, look at the structure of the code in the problem",
                "initialization": matchArgs(argNames, methodCalls[i]),
                "lineNum": 1,
                "vars": {},
                "highlighted": [],
                "AST": AST,
            });
        }
        return states;
    }

    function makeProblemTextStates(methodCalls, argNames, problemText) {
        var states = [];
        for (var i = 0; i < methodCalls.length; i++) {
            states.push({
                "prompt": "First, look at the structure of the code in the problem",
                "initialization": matchArgs(argNames, methodCalls[i]),
                "lineNum": 1,
                "vars": {},
                "highlighted": [],
                "problemText": problemText,
            });
        }
        return states;
    }



    // Grabs method calls from the #methodCalls dom element
    // Expects sql output with:
    // | <id> | <methodcalltext> |
    // Returns {
    //   id1: [
    //     methodCall1,
    //     methodCall2,
    //   ],
    //   id2: [
    //     methodCall3,
    //   ]
    // }
    function getMethodCallsFromDOM() {
        var methodCalls = {};
        var mcPieces = $("#methodCalls").html().split("|");
        for (var i = 0; i < mcPieces.length - 1; i+=3 ) {
            var problemId = mcPieces[i + 1].trim();
            var methodCall = mcPieces[i + 2].trim();
            var args = getIfElseArgs(methodCall);

            if(!methodCalls.hasOwnProperty(problemId)) {
                methodCalls[problemId] = [];
            }
            var argsSets = methodCalls[problemId];
            argsSets.push(args);

            methodCalls[problemId] = argsSets;
        }
        return methodCalls;
    }

    $(document).ready(function() {
        var methodCalls = getMethodCallsFromDOM();

        // SQL uses |'s, and that's also or. Sub it with a placeholder for a minute...
        var pieces = $("#content").html().replace(/[|][|]/g, "OROR").split("|");

        var problems = [];
        var problemNum = 1;
        for (var i = 0; i < pieces.length - 3; i+=4) {
            // pieces at i is blank
            var problemId = pieces[i + 1].trim();
            var problemTitle = pieces[i + 2].trim();
            var problemText = pieces[i + 3].trim();
            var cleanedProblemText = cleanProblemText(problemText);
            var argNames = getArgNames(cleanedProblemText);

            var formattedProblemText = getFormattedProblemText(problemText);



            // Parser wants the code in a class.
            var parsableProblemText = "public class A { " + cleanedProblemText + "}";

            try {
                // May throw error during parsing:
                var AST = java_parsing.browser_parse(parsableProblemText);

                var argsSets = methodCalls[problemId];
                //var states = makeASTStates(argsSets, argNames, AST);
                var states = makeProblemTextStates(argsSets, argNames, formattedProblemText);

                var initialState = states[0];
                var alternateStartingStates = states.slice(1);

                problems.push({
                    id: generateUUID(),
                    category: "if_else",
                    title: "If/Else Mystery " + problemNum,
                    initialState: initialState,
                    alternateStartingStates: alternateStartingStates,

                    //problemText: formattedProblemText,

                    // Not used by our tools, but may prove helpful...
                    examProblemDatabaseId: problemId,
                });
                problemNum++;
            } catch (e) {
                console.error("Unable to parse id " + problemId + ": " + parsableProblemText);
                //if (problemId == 103) {
                //    throw e;
                //}
            }
        }

        d3.select("#container").selectAll("div").data(problems).enter()
            .append("div")
            .attr("id", function(problem) { return problem.problemId; } )
            .append("pre")

            // Pretty print, with a comma at the end so I can copy/paste into catConfig
            .text(function(problem) { return JSON.stringify(problem, false, 4) + ", "; } );

            // Minified, removes line breaks...
            //.text(function(problem) { return JSON.stringify(problem); } );

            // Just the problem text
            //.text(function(problem) { return problem.problemText; } );
        ;

    });
</script>

</body>
</html>