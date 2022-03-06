while a < b:
	a = a + 1
	if a % 2 == 0:
		continue
	else:
		b = b - a
print (a, b)