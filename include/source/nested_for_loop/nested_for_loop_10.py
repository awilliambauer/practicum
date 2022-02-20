def nested_for_loop_investigation(a, b):
	c = 0
	for i in range(3):
		for j in range(2):
			if a < 3 * b:
				c = c + a * 2
				a = a + 20
			else:
				b = b + 10
	return(a, b, c)