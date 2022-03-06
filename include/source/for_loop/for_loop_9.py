a = 10
b = 0
for i in range(start, end, step):
	if a > i: 
		a = a - 2
		b = b + 1
print(a,b)