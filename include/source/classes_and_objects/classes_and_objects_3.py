class Pets:
	def __init__(self, type, age, name):
		self.type = type
		self.age = age
		self.home = "Minnesota"
		self.name = name
	def getAge(self):
		return(self.age)
	def birthday(self):
		self.age = self.age + 1
whiskers = Pets("cat",2,"Whiskers")
anAge = whiskers.getAge()
whiskers.birthday()
print(anAge, whiskers.getAge())