def nested_for_loop_investigation(no_squares):
	nums = [3, 4, 5]
	for i in range(len(no_squares)):
		for num in nums:
			if num * num == no_squares[i]:
				no_squares[i] = 0
				break
	return(no_squares)