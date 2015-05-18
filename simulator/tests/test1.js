
function algorithm(state) {
    var left_operand;
    var right_operand;
    var operator;
    left_operand = state.left;
    right_operand = state.right;
    operator = state.op;
    state.result = eval(left_operand + operator + right_operand);
}

