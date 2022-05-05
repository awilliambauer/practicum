class Student:
	def __init__(self, name, major):
		self.name = name
		self.major = major
		self.isCS = self.checkCS(major)
	def checkCS(self,major):
		if major == "CS":
			self.isCS = True
		else:
			self.isCS = False
student1 = Student("Jade", "Art History")
if student1.isCS:
	print("Great major!")
else:
	print("You should consider a new major...")