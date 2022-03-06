a = 3
b = 0
for i in range(start, end, step):
	if i > b:
		b = b + a
		a = a + 1
print(a,b)