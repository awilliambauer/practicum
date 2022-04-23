class Pet:
	def __init__(self, animal, age, name):
		self.type = animal
		self.age = age
		self.home = "Minnesota"
		self.name = name
	def getAge(self):
		return(self.age)
	def birthday(self):
		self.age = self.age + 1
whiskers = Pet("cat",2,"Whiskers")
whiskersAge = whiskers.getAge()
whiskers.birthday()
print(whiskersAge, whiskers.getAge())