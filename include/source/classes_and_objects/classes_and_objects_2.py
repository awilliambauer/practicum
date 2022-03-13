class Pets:
	def __init__(self, animal, age, name):
		self.type = animal
		self.age = age
		self.home = "Minnesota"
		self.name = name

whiskers = Pets("cat",2,"Whiskers")
buster = Pets("dog",4,"Buster")
print(whiskers.type)
print(buster.type)