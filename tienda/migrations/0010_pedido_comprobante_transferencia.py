# Generated by Django 5.2.1 on 2025-05-28 03:26

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tienda', '0009_alter_pedido_tipo_entrega'),
    ]

    operations = [
        migrations.AddField(
            model_name='pedido',
            name='comprobante_transferencia',
            field=models.FileField(blank=True, null=True, upload_to='comprobantes_transferencia/'),
        ),
    ]
