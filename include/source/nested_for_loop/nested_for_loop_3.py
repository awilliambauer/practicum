vowels = 'aeiou'
count = 0
for letter in word:
	for vowel in vowels:
		if letter == vowel:
			count = count + 1
			break
print(count)