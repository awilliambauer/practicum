def for_loop_investigation(lst):
	a = 5
	for n in lst:
		a = a - 3
		if n < 0:
			a = a + 3
		if -1 < n and n < 1:
			return(a)
	return (a)