# Generated by Django 3.2.6 on 2021-08-24 09:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('boulange', '0004_alter_cart_user'),
    ]

    operations = [
        migrations.RenameField(
            model_name='cart',
            old_name='pasty',
            new_name='pastry',
        ),
    ]
