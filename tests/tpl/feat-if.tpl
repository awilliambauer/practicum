function useIf() {
    if (state.branch == 0) {
        state.result = 0;
    } else if (state.branch == 1) {
        state.result = 1;
    } else {
        state.result = 2;
    }
}
