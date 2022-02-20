def nested_for_loop_investigation(lst):
	count = 0
	for i in range(3):
		for j in range(len(lst)):
			if lst[j] < 50:
				lst[j] = lst[j] + 10
			else:
				count = count + 1
	return(count)