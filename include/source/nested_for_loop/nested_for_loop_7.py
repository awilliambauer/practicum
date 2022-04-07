for num in lst:
	for j in range(len(lst)):
		if num < 0:
			lst[j] = lst[j] + 3
print(lst)