
function f() {
    let sum;
    sum = 0;
    for (let x of state.array) {
        sum = sum + x;
    }
    state.sum = sum;
}

