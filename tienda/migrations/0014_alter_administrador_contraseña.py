# Generated by Django 5.2.1 on 2025-05-29 18:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tienda', '0013_remove_administrador_first_login_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='administrador',
            name='contraseña',
            field=models.CharField(max_length=100),
        ),
    ]
