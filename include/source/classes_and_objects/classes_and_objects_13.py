class Student:
	def __init__(self, name, major):
		self.name = name
		self.major = major
		self.isCS = self.checkCS(major)

	def changeMajor(self,newMajor):
		self.major = newMajor
		self.checkCS(self.major)

	def checkCS(self,major):
		if major == "CS":
			self.isCS = True
		else:
			self.isCS = False

class Teacher:
	def __init__(self,name, classNum):
		self.name = name
		self.classNum = classNum
		self.roster = []

	def addStudent(self,student):
		self.roster.append(student)


student1 = Student("Jade", "CS")
student2 = Student("John", "Math")
professor = Teacher("James", 111)
professor.addStudent(student1)
professor.addStudent(student2)

roster = professor.roster
for i in range(len(roster)):
	print(roster[i].name)