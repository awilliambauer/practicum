if a < b and a < c:
	a = a + c
	c += 1
elif a >= b:
	a = a - b
	b -= 1
if a >= b and a >= c:
	a += 1
	c += 1
print (a, b ,c)