function f() {
    while (state.i < 10) {
        if (state.i > 0) {
            break;
        }
        state.arr[state.i] = 1;
        state.i = state.i + 1;
    }
    do {
        state.arr[state.i] = 2;
        state.i = state.i + 1;
        if (state.i > 2) {
            break;
        }
    } while(state.i < 6);
    for (let a of state.arr) {
        if (a == 0) {
            break;
        }
        state.s = state.s + a;
    }
}