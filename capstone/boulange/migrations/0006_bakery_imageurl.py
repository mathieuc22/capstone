# Generated by Django 3.2.6 on 2021-09-15 18:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('boulange', '0005_rename_pasty_cart_pastry'),
    ]

    operations = [
        migrations.AddField(
            model_name='bakery',
            name='imageUrl',
            field=models.TextField(blank=True),
        ),
    ]