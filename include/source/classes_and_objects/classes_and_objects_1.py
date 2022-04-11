class Pets:
	def __init__(self, type, age, name):
		self.type = type
		self.age = age
		self.home = "Minnesota"
		self.name = name
whiskers = Pets("cat", 2, "Whiskers")
print(whiskers.age)