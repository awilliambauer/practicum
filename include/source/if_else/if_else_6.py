def if_else_investigation(x, y):
	z = 4
	if z <= x or x > 5:
		z = x + 1
	else:
		z = z + 9
	if z <= y:
		y += 1
	return (z, y)