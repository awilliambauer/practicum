# Practicum

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Project Components](#components)
- [Supported Python Features](#features)

## About <a name = "about"></a>

Practicum is an interactive, web-based tool that teaches introductory CS topics. Its purpose is to provide a quick and easy way to practice basic computer science concepts, such as if statements and for loops. Practicum's goal is to supplement classroom learning or provide a refresher to students who have not coded in a while, not teach these concepts on its own. 

Practicum's strength comes from the Thought Process Language (TPL) framework which automatically generates a guide that walks the user through any problem provided to the system. This sets Practicum apart by allowing it to generate instructive material procedurally rather than needing to manually write and input all of the prompts that a user will see. Practicum is easy to expand as it will do the bulk of the work in creating more instructional material. It also makes the process of encoding problem-solving strategies relatively simple and efficient.

Practicum allows students to take a guided walk through problems that highlight challenging new CS concepts to better understand how these concepts work in a practical setting. Our hope is that this will reinforce their classroom learning and leave them better prepared to apply this new material in their own code.

## Getting Started <a name = "getting_started"></a>

To get a copy of Practicum working on your local machine, run the following code in your terminal:

```
git clone https://github.com/awb-carleton/practicum.git
cd practicum
```

If you have your SSH key stored on GitHub, run this code in your terminal instead:

```
git clone git@github.com:awb-carleton/practicum.git
cd practicum
```

Once you have cloned the repository to your local machine, you can run the code using any HTTP server. The most common way of doing this is using Python's http module. To run the website on localhost, run the following code in your terminal:

```
python3 -m http.server --directory .
```

This will open the website at http://localhost:8000.

### Working with the Code

Check out the [_documentation/](https://github.com/awb-carleton/practicum/tree/master/_documentation) folder for help getting started working with the code.

"How to implement a new problem type" ([how2tpl.pdf](https://github.com/awb-carleton/practicum/tree/master/_documentation/how2tpl.pdf) | [Drive](https://docs.google.com/document/d/1eg8Tox9nYs7trHIMKeAPPXxesR0sKyPjBCj5IUvd2pQ/edit?usp=sharing)) explains the process for creating a TPL file in order to implement a new problem type. It is the ideal first stop for those looking to expand Practicum either on a small scale (e.g., for a particular classroom), or on a larger scale (e.g., a comps group).

"How the TPL connects to the front-end" ([tpl2front-end.pdf](https://github.com/awb-carleton/practicum/tree/master/_documentation/tpl2front-end.pdf) | [Drive](https://docs.google.com/document/d/1egbUw6Iy0888BOBr29NdAMZ4O1p3XycoqHWDFYtrAd8/edit?usp=sharing)) explains in prose how the TPL connects to the front end and its visualizations in additional detail.

## Prerequisites

All you need to run Practicum is an HTTP server to serve the website. All dependencies have been downloaded locally and can be found in the vendor folder. We recommend using the python HTTP server, so you will need Python installed if you want to use it to serve the website. But besides that, no other dependencies are required.

## Project Components <a name = "components"></a>

The project is broken down into many individual folders. We will go over what each folder contains and any relevant files inside.

### Controller

The controller contains all the code required to run a problem. It contains the HTML and CSS for the problem page as well as the JavaScript that makes it run. All the code related to initializing the problem, checking answers, highlighting lines and sections of the problem, and stepping through the code can be found here.

### CSS

The css folder contains the CSS files for the entire project. The majority of CSS classes live in csed.css.

### Include

The include folder contains the categoryConfig.json file. This is the file that holds all the problems for the system and is where all problems are pulled from. 

### JS

The js folder has the index.js file, which deals with loading all the problems, creating the main home page and populating it with all the data, and initializing problems for when they are clicked on.

The logging.js file deals with logging usage information about the system.

There are two subfolders in the JS folder. The **change later** java folder has all the code for parsing through the Python code. The ast.js file contains code to create the Abstract Syntax Tree, the formatter.js file converts the AST into HTML to display on the problem page, the parser.js file is responsible for parsing through the AST and evaluating the Python code, and the simulator.js file executes statements and handles moving through the code.

The tpl folder is similar, but it contains the code required to interpret the TPLs. It also contains a folder called algorithms which contains the TPLs for each problem type, as well as tplHelper.js, which contains the functions used to create the TPL. tplHelper.js is what allows the TPLs to be parsed be the rest of the system.

### Vendor

The vendor folder contains all the dependencies for the project. This includes all major libraries used in the code such as D3.js, Bootstrap, and JQuery, along with more.

## Supported Python Features <a name = "features"></a>

Practicum is designed such that a TPL can be made for any problem type as long as our system is able to support it. These features are what the Python interpreter of our system currently supports. We currently support the following features:

- for loops
- while loops
- if statements along with elif and else
- nested for loops
- break
- continue
- iteration over strings
- updating list values
- range
- len

Any TPLs and problems can be written that use these features as they are fully supported by the system. Any keywords or functionality not listed here is not supported by our Python interpreter.


