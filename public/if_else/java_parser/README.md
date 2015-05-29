
# Java Parsing Library

A small Java parser written in pure JavaScript, along with a helper library to do stuff with the resulting AST.
The files `parser.js` and `ast.js` can just be dropped a webpage.
`parser.js` also includes a Node.js command-line interface:
```
node parser.js <filename>.java
```
This will print, to stdout, the AST for the given mystery problem as JSON. You can use this when manually creating example simulator states.

`ast.js` contains several utility functions for things such as finding a node with a particular ID. These will be useful both to call directly, and as examples of how to operate on the AST.

There is a demo, in `example_dom.html`, of transforming the AST into HTML and the striking out some of the lines with CSS. I expect you will need to heavily modify the exact HTML that it produces, but it should serve to get you started.

## AST Spec

The AST is a tree of nested JSON objects (i.e., associative arrays), with each node of the tree represented as one object. These objects contain information about that node, a `tag` that says the type of node, a unique `id`, and fields for child nodes. For example, this is the representation of `x + 1`:
```
{ id:1,
  tag:"binop",
  operator:"+",
  args:[
    { id:2,
      tag:"identifier",
      value:"x"
    },
    { id:3,
      tag:"literal",
      value:1
    }
  ]
}
```
There is nothing sacrosanct about the current AST structure, so feel free to request changes to the way it's constructed (or change yourself). Note that this structure is probably more general than your mystery problems need, so feel free to simplify and create new types of nodes to make things easier for you. For example, `System.out.println(...)` is parsed to several nodes. They could hypothetically be collapsed to a new node type `println`.

## Language Limitations

This only parses a subset of the Java language. It should be enough to cover all potential mystery problems, but here's a list of some of the limitations, some of which will be adderessed as we need them:

- It is assumed that every input file is public class containing a single public static method.
- All `for`/`if`/`else` statements *must* have braces around their bodies.
- The only allowable type names allowed are `void`, `int`, and `int[]`. This can be easily relaxed to any primitive type.
- Prefix unary operators and grouping parentheses are currently not supported, but those are easy to add. Some operators may be missing.

