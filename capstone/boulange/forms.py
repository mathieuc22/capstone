from django import forms

from .models import Bakery, Pastry

class BakeryForm(forms.ModelForm):
    class Meta:
        model = Bakery
        exclude = ('creator','likes',)

class PastryForm(forms.ModelForm):
    class Meta:
        model = Pastry
        exclude = ('bakery','description',)