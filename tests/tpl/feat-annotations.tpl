
function f(y) {
    let x;
    [ImAnAnnotation]
    x = 2;
    [ImAnotherAnnotation]
    if (y > 0) {
        [ImANestedAnnotation;AndLookASecond]
        x = x - y;
    }
    [Annotation("a", 2+3)]
    state.result = x;
}

