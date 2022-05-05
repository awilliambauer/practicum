i = 0
sum = 0
while i < len(lst) - 1: 
	i = i + 1 
	if lst[i] % 2 == 1:
		sum = sum + lst[i]  
print (sum)