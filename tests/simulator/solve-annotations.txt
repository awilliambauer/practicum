
function f(y) {
    let x;
    [ImAnAnnotation]
    x = 2;
    [ImAnotherAnnotation]
    if (y > 0) {
        [ImANestedAnnotation;AndLookASecond]
        x = x - y;
    }
    state.result = x;
}

