class Point:
	def __init__(self, x, y):
		width = 30
		height = 40
		self.x = self.inImage(x,width)
		self.y = self.inImage(y,height)
	def inImage(self,n,distance):
		if n < 0:
			return(0)
		elif n > distance:
			return(distance)
		else:
			return(n)
p1 = Point(15,17)
p2 = Point(16,54)
print(p1.x, p2.y)