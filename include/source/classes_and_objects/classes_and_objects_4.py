class Pet:
	def __init__(self, type, age, name):
		self.type = type
		self.name = name
		self.home = "Minnesota"
		self.age = age
	def getAge(self):
		return (self.age)
	def birthday(self):
		self.age = self.age + 1
class Owner:
	def __init__(self, name, pet):
		self.name = name
		self.pet = pet
	def getNameOfPet(self):
		return(self.pet.name)
whiskers = Pet("cat", 2,"Whiskers")
david = Owner("David", whiskers)
davidsPet = david.getNameOfPet()
print(davidsPet)