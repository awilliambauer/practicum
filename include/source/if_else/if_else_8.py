def if_else_investigation(x, y):

	if x == y or y < 5:
		x = x + 11
	elif x > 2 * y:
		x = 0
	if x == 0 and y > x:
		x = x + 2
		y = y + 2
	return (x, y)