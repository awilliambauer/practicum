# Practicum

## Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Project Components](#components)
- [Supported Python Features](#features)

## About <a name = "about"></a>

Practicum is a software project that is an interactive, web-based tool which teaches introductory CS topics. It was created to help any student taking the intro class and carefully explains the necessary computer science terms and concepts. One of its strengths is that rather than creating a program for each problem, each type of problem is programmed. This is done by creating a Thought Process Language (TPL). 

The first advantage is that the TPL is able to automatically generate an interactive explanation for any problem within its problem type. The second advantage is that the TPL doesn’t have to be reprogrammed and can be reused. These advantages save time because the programmer only needs to write a problem, and the TPL will handle everything else. 

Overall, Practicum makes it easy for professors to encode their thought process when solving a problem into our system and allow students to walk through it step by step to teach a variety of computer science concepts.


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

Practicum is designed such that a TPL can be made for any problem type as long as our system is able to support it. We currently support the following features:

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

Any TPLs and problems can be written that use these features as they are fully supported by the system.


