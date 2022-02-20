def nested_for_loop_investigation(lst_inner):
	lst_outer = [2, 3, 4]
	for i in range(len(lst_outer)):
		for j in range(len(lst_inner)):
			lst_inner[j] = lst_inner[j] * lst_outer[i]
	return(lst_inner)