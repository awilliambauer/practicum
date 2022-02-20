def if_else_investigation(a, b):
	if a % 2 != 0:
		a = a * 2
	if a > 10:
		b += 1
	elif a > 10:
		a -= 1
		b -= 1
	return (a, b)