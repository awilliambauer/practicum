def if_else_investigation(x, y):
	z = 0
	if x >= y:
		x = x / 2
		z += 1
	if x > z and y <= z:
		z += 1
	elif x > z:
		y = y - 5
	return (x, y, z)