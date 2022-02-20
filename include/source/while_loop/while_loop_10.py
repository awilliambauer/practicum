def while_loop_investigation(a, b):
	while a < b:
		a = a + 1
		if a % 2 == 0:
			continue
		else:
			b = b - a
	return (a, b)
