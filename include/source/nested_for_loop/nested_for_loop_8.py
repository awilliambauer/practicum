def nested_for_loop_investigation(lst):
	factors = [2, 3, 4, 6]
	count = 0
	for item in lst:
		if item > 12:
			return(count)
		for factor in factors:
			if item * factor == 12:
				count = count + 1
				break
	return(count)