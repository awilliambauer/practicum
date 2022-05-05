class Pet:
	def __init__(self, animal, age, name):
		self.type = animal
		self.age = age
		self.home = "Minnesota"
		self.name = name
buster = Pet("dog", 4, "Buster")
print(buster.age)