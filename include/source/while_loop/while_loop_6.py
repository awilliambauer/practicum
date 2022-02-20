def while_loop_investigation(a, b):
	power = 0
	while b >= 1:
		b = b / a
		power+= 1
	return (power)