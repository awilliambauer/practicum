a = 4
b = 21
for i in range(start, end, step):
	a = a + 6
	if a > b:
		b = b + 8
print(a, b)