def if_else_investigation(a, b):
	c = 2
	if a + c < b:
		c = c + 8
	else:
		b = b + 10
	if a + c < b:
		c = c + 8
	else:
		b = b + 10
	return (b, c)