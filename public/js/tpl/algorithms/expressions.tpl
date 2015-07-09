function TPLAlgorithm() {
	let weWillPlaceTheResultOfThisOperationHere;

	while(helper.isThereAtLeastOneMultiplicationDivisionOrModOperator(state)) {
		[Prompt]
		"Start at the left, and search for the first multiplication, division, or mod operator in the expression";
		let thisIsTheFirstMultiplicationDivisionOrModOperator;
		thisIsTheFirstMultiplicationDivisionOrModOperator = helper.getFirstMultiplicationDivisionOrModOperatorFromLeft(state);
		let thisIsTheLeftOperand;
		thisIsTheLeftOperand = helper.getLeftOperand(state, thisIsTheFirstMultiplicationDivisionOrModOperator);
		let thisIsTheRightOperand;
		thisIsTheRightOperand = helper.getRightOperand(state, thisIsTheFirstMultiplicationDivisionOrModOperator);
		let weWillPlaceTheResultOfThisOperationHere;
		weWillPlaceTheResultOfThisOperationHere = helper.createNewLineWithEmptyCell(state, thisIsTheFirstMultiplicationDivisionOrModOperator);
		helper.calculate(state, thisIsTheFirstMultiplicationDivisionOrModOperator);
	}

	while(helper.isThereAtLeastOneAdditionOrSubtractionOperator(state)) {
	    [Prompt]
		"Start at the left, and find the first addition or subtraction operator";
		let thisIsTheFirstAdditionOrSubtractionOperator;
		thisIsTheFirstAdditionOrSubtractionOperator = helper.getFirstAdditionOrSubtractionOperatorFromLeft(state);
		let thisIsTheLeftOperand;
		thisIsTheLeftOperand = helper.getLeftOperand(state, thisIsTheFirstAdditionOrSubtractionOperator);
		let thisIsTheRightOperand;
		thisIsTheRightOperand = helper.getRightOperand(state, thisIsTheFirstAdditionOrSubtractionOperator);
		let weWillPlaceTheResultOfThisOperationHere;
		weWillPlaceTheResultOfThisOperationHere = helper.createNewLineWithEmptyCell(state, thisIsTheFirstAdditionOrSubtractionOperator);
		helper.calculate(state, thisIsTheFirstAdditionOrSubtractionOperator);
	}
}
