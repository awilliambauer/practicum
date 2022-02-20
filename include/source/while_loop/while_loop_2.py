def while_loop_investigation(lst):
	i = 0
	sum = 0
	while(i < len(lst)): 
		sum = sum + lst[i]
		i = i + 1
	return (sum)