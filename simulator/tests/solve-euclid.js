
function euclid(state) {
    var current_step;
    current_step = state.steps[state.stepi];
    while(current_step.left != current_step.right) {
        if (current_step.left < current_step.right) {
            state.steps.push({left:current_step.left, right:current_step.right - current_step.left});
        } else {
            state.steps.push({left:current_step.left - current_step.right, right:current_step.right});
        }
        state.stepi = state.stepi + 1;
    }
    state.result = current_step.left;
}