# Generated by Django 5.2.1 on 2025-05-28 02:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tienda', '0008_alter_pedido_cliente'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pedido',
            name='tipo_entrega',
            field=models.CharField(max_length=35),
        ),
    ]
