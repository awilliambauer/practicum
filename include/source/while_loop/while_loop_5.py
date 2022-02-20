def while_loop_investigation(lst):
	to_add = 13
	i = 0
	while i < len(lst):
		lst[i] = lst[i] + to_add 
		i = i + 1
	return (lst)