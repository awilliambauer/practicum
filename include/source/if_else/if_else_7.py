def if_else_investigation(a, b):
	if a * 2 < b:
		a = a * 3
	if b < a:
		b += 1
	else:
		a -= 1
	return (a, b)