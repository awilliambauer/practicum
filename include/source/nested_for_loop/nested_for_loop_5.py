for i in range(2):
	for j in range(len(data_lst)):
		if data_lst[j] < mean:
			data_lst[j] = data_lst[j] + 2
print(data_lst)