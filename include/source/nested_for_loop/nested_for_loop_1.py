def nested_for_loop_investigation(a, b):
	c = 0
	for i in range(a):
		for j in range(b):
			c = c + 1
	return(c)