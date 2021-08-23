from django.db import models
from django.utils import tree
from django.contrib.auth.models import User

CITIES = (
          ('Paris', 'Paris'),
          ('Quebec', 'Quebec'),
          ('Istanbul', 'Istanbul'),
)

class Bakery(models.Model):
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bakeries")
    name = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    city = models.CharField(max_length=100, choices=CITIES)
    likes = models.ManyToManyField(User, related_name='likes')

    def number_of_likes(self):
        return self.likes.count()

    def __str__(self):
        return self.name

class Pastry(models.Model):
    bakery = models.ForeignKey(Bakery, on_delete=models.CASCADE, related_name="pastries")
    item = models.CharField(max_length=50)
    description = models.TextField(blank=True)
    price= models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f'{self.item} : {self.price} €'