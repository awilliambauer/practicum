def for_loop_investigation(start, end):
	b = 0
	for i in range(start, end):
		if i % 2 == 0:
			b = b + i
	return (b)