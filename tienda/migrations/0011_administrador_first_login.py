# Generated by Django 5.2.1 on 2025-05-29 17:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tienda', '0010_pedido_comprobante_transferencia'),
    ]

    operations = [
        migrations.AddField(
            model_name='administrador',
            name='first_login',
            field=models.BooleanField(default=True),
        ),
    ]
