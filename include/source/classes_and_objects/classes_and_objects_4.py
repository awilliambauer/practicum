class Pets:
	def __init__(self, animal, age, name):
		self.type = animal
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
	def getPetName(self):
		return(self.pet.name)
whiskers = Pets("cat", 2,"Whiskers")
david = Owner("David", whiskers)
davidsPet = david.getPetName()
print(davidsPet)