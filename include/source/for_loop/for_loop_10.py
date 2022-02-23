def for_loop_investigation(word):
	x = 0
	for letter in word:
		if letter == 's':
			x = x + 7
		if letter == 'i':
			x = x - 3
	return (x)