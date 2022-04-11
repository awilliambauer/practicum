class Pet:
	def __init__(self, type, age, name):
		self.type = type
		self.age = age
		self.home = "Minnesota"
		self.name = name
whiskers = Pet("cat",2,"Whiskers")
buster = Pet("dog",4,"Buster")
print(whiskers.type, buster.type)