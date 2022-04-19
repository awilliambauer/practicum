class Point:
	def __init__(self, x, y):
		width = 30
		height = 40
		self.x = self.inImage(x,width)
		self.y = self.inImage(y,height)
	def inImage(self,n,distance):
		if (n < 0):
			return (0)
		elif (n > distance):
			return (distance)
		else:
			return (n)
	def getDistance(self,point):
		return ((((self.x - point.x)**2) + ((self.y-point.y)**2))**0.5)
p1 = Point(10,0)
p2 = Point(30,0)
distance = p1.getDistance(p2)
print(distance)