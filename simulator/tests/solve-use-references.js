function references(state) {
    state.a = Math.min(3, state.d.length);
    state.b.a = state.d.pop();
    var t;
    t = state.c.a;
    state.d.push(t);
    state.d[0] = state.d[0] + state.d[0];
}