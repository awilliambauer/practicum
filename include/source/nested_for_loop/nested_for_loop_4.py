for i in range(lst[0], lst[1]):
	for j in range(len(lst)):
		lst[j] = lst[j] + i
		if lst[j] > 10:
			return(lst)
print(lst)