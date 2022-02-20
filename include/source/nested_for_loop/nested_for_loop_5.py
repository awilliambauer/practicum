def nested_for_loop_investigation(data_lst, mean):
	for i in range(2):
		for j in range(len(data_lst)):
			if data_lst[j] < mean:
				data_lst[j] = data_lst[j] + 2
	return(data_lst)