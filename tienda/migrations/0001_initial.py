# Generated by Django 5.2.1 on 2025-05-11 18:55

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Bodeguero',
            fields=[
                ('id_bodeguero', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('rut', models.CharField(max_length=12)),
                ('nombre', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=100)),
                ('contraseña', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'BODEGUERO',
            },
        ),
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('rut', models.CharField(max_length=12, primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=100)),
                ('contraseña', models.CharField(max_length=100)),
                ('telefono', models.CharField(blank=True, max_length=15, null=True)),
                ('direccion', models.CharField(blank=True, max_length=40, null=True)),
            ],
            options={
                'db_table': 'CLIENTE',
            },
        ),
        migrations.CreateModel(
            name='Contador',
            fields=[
                ('id_contador', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('rut', models.CharField(max_length=12)),
                ('nombre', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=100)),
                ('contraseña', models.CharField(max_length=100)),
            ],
            options={
                'db_table': 'CONTADOR',
            },
        ),
        migrations.CreateModel(
            name='Producto',
            fields=[
                ('id_producto', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=150)),
                ('descripcion', models.CharField(blank=True, max_length=150, null=True)),
                ('precio', models.IntegerField()),
                ('marca', models.CharField(max_length=50)),
                ('categoria', models.CharField(max_length=50)),
            ],
            options={
                'db_table': 'PRODUCTO',
            },
        ),
        migrations.CreateModel(
            name='Sucursal',
            fields=[
                ('id_sucursal', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
                ('direccion', models.CharField(max_length=40)),
                ('telefono', models.CharField(blank=True, max_length=15, null=True)),
            ],
            options={
                'db_table': 'SUCURSAL',
            },
        ),
        migrations.CreateModel(
            name='Pedido',
            fields=[
                ('id_pedido', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('fecha', models.DateTimeField(auto_now_add=True)),
                ('estado', models.CharField(max_length=15)),
                ('tipo_entrega', models.CharField(max_length=15)),
                ('direccion_entrega', models.CharField(blank=True, max_length=50, null=True)),
                ('bodeguero', models.ForeignKey(db_column='id_bodeguero', on_delete=django.db.models.deletion.PROTECT, to='tienda.bodeguero')),
                ('cliente', models.ForeignKey(db_column='id_cliente', on_delete=django.db.models.deletion.PROTECT, to='tienda.cliente')),
            ],
            options={
                'db_table': 'PEDIDO',
            },
        ),
        migrations.CreateModel(
            name='Pago',
            fields=[
                ('id_pago', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('monto', models.IntegerField()),
                ('metodo', models.CharField(max_length=20)),
                ('fecha', models.DateTimeField(blank=True, null=True)),
                ('estado', models.CharField(max_length=20)),
                ('contador', models.ForeignKey(db_column='id_contador', on_delete=django.db.models.deletion.PROTECT, to='tienda.contador')),
                ('pedido', models.ForeignKey(db_column='id_pedido', on_delete=django.db.models.deletion.PROTECT, to='tienda.pedido')),
            ],
            options={
                'db_table': 'PAGO',
            },
        ),
        migrations.AddField(
            model_name='contador',
            name='id_sucursal',
            field=models.ForeignKey(db_column='id_sucursal', on_delete=django.db.models.deletion.CASCADE, to='tienda.sucursal'),
        ),
        migrations.AddField(
            model_name='bodeguero',
            name='id_sucursal',
            field=models.ForeignKey(db_column='id_sucursal', on_delete=django.db.models.deletion.CASCADE, to='tienda.sucursal'),
        ),
        migrations.CreateModel(
            name='Administrador',
            fields=[
                ('id_admin', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('nombre', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=100)),
                ('contraseña', models.CharField(max_length=100)),
                ('id_sucursal', models.ForeignKey(db_column='id_sucursal', on_delete=django.db.models.deletion.CASCADE, to='tienda.sucursal')),
            ],
            options={
                'db_table': 'ADMINISTRADOR',
            },
        ),
        migrations.CreateModel(
            name='Vendedor',
            fields=[
                ('id_vendedor', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('rut', models.CharField(max_length=12)),
                ('nombre', models.CharField(max_length=100)),
                ('email', models.EmailField(max_length=100)),
                ('contraseña', models.CharField(max_length=100)),
                ('id_sucursal', models.ForeignKey(db_column='id_sucursal', on_delete=django.db.models.deletion.CASCADE, to='tienda.sucursal')),
            ],
            options={
                'db_table': 'VENDEDOR',
            },
        ),
        migrations.AddField(
            model_name='pedido',
            name='vendedor',
            field=models.ForeignKey(db_column='id_vendedor', on_delete=django.db.models.deletion.PROTECT, to='tienda.vendedor'),
        ),
        migrations.CreateModel(
            name='DetallePedido',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('cantidad', models.IntegerField()),
                ('precio_unitario', models.IntegerField()),
                ('pedido', models.ForeignKey(db_column='id_pedido', on_delete=django.db.models.deletion.CASCADE, to='tienda.pedido')),
                ('producto', models.ForeignKey(db_column='id_producto', on_delete=django.db.models.deletion.CASCADE, to='tienda.producto')),
            ],
            options={
                'db_table': 'DETALLE_PEDIDO',
                'unique_together': {('pedido', 'producto')},
            },
        ),
        migrations.CreateModel(
            name='Inventario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('stock', models.IntegerField(default=0)),
                ('bodeguero', models.ForeignKey(db_column='id_bodeguero', on_delete=django.db.models.deletion.PROTECT, to='tienda.bodeguero')),
                ('producto', models.ForeignKey(db_column='id_producto', on_delete=django.db.models.deletion.PROTECT, to='tienda.producto')),
                ('sucursal', models.ForeignKey(db_column='id_sucursal', on_delete=django.db.models.deletion.PROTECT, to='tienda.sucursal')),
            ],
            options={
                'db_table': 'INVENTARIO',
                'unique_together': {('sucursal', 'producto', 'bodeguero')},
            },
        ),
    ]
