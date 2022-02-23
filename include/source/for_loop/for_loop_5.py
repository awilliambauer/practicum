def for_loop_investigation(start, end):
	a = 5
	b = 2
	for i in range(start, end):
		if a > i:
			continue
		a = a + 1
		if a > b:
			b = b + a
	return (a,b)