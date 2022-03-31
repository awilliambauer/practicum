class Point:
	def __init__(self, x, y):
		width = 30
		height = 40
		self.x = self.inImage(x,width)
		self.y = self.inImage(y,height)
	def inImage(self, n, distance):
		if (n < 0):
			return (0)
		elif (n > distance):
			return (distance)
		else:
			return (n)
	def getDistance(self, point):
		return ((((self.x - point.x )**2) + ((self.y-point.y)**2) )**0.5)
class Circle:
	def __init__(self,c,r):
		self.center = c
		self.radius = r        
	def moveCircleLeft(self, distance):
		newX = self.center.x - distance
		if (newX < 0):
			newX = 0
		self.center.x = newX
p1 = Point(15,15)
circle1 = Circle(p1,10)
circle1.moveCircleLeft(10)
print(circle1.center.x, p1.x)
# print(newX) #intentionally trigger error to show scope?