# Create your models here.
from django.db import models

class Sucursal(models.Model):
    id_sucursal = models.CharField(max_length=10, primary_key=True)
    nombre = models.CharField(max_length=100)
    direccion = models.CharField(max_length=40)
    telefono = models.CharField(max_length=15, null=True, blank=True)

    class Meta:
        db_table = 'SUCURSAL'  # Nombre de la tabla en minúsculas

class Cliente(models.Model):
    rut = models.CharField(max_length=12, primary_key=True)
    nombre = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    contraseña = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15, null=True, blank=True)
    direccion = models.CharField(max_length=40, null=True, blank=True)

    class Meta:
        db_table = 'CLIENTE'

class Producto(models.Model):
    id_producto = models.CharField(max_length=10, primary_key=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.CharField(max_length=150, null=True, blank=True)
    precio = models.IntegerField()
    marca = models.CharField(max_length=50)
    categoria = models.CharField(max_length=50)

    class Meta:
        db_table = 'PRODUCTO'

class Administrador(models.Model):
    id_admin = models.CharField(max_length=10, primary_key=True)
    nombre = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    contraseña = models.CharField(max_length=100)
    id_sucursal = models.ForeignKey('Sucursal', on_delete=models.CASCADE, db_column='id_sucursal')

    class Meta:
        db_table = 'ADMINISTRADOR'

class Vendedor(models.Model):
    id_vendedor = models.CharField(max_length=10, primary_key=True)
    rut = models.CharField(max_length=12)
    nombre = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    contraseña = models.CharField(max_length=100)
    id_sucursal = models.ForeignKey('Sucursal', on_delete=models.CASCADE, db_column='id_sucursal')

    class Meta:
        db_table = 'VENDEDOR'

class Bodeguero(models.Model):
    id_bodeguero = models.CharField(max_length=10, primary_key=True)
    rut = models.CharField(max_length=12)
    nombre = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    contraseña = models.CharField(max_length=100)
    id_sucursal = models.ForeignKey('Sucursal', on_delete=models.CASCADE, db_column='id_sucursal')

    class Meta:
        db_table = 'BODEGUERO'

class Contador(models.Model):
    id_contador = models.CharField(max_length=10, primary_key=True)
    rut = models.CharField(max_length=12)
    nombre = models.CharField(max_length=100)
    email = models.EmailField(max_length=100)
    contraseña = models.CharField(max_length=100)
    id_sucursal = models.ForeignKey('Sucursal', on_delete=models.CASCADE, db_column='id_sucursal')

    class Meta:
        db_table = 'CONTADOR'

from django.db import models

class Pedido(models.Model):
    id_pedido = models.CharField(max_length=10, primary_key=True)
    cliente = models.ForeignKey('Cliente', on_delete=models.PROTECT, db_column='id_cliente')
    vendedor = models.ForeignKey('Vendedor', on_delete=models.PROTECT, db_column='id_vendedor')
    bodeguero = models.ForeignKey('Bodeguero', on_delete=models.PROTECT, db_column='id_bodeguero')
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=15)
    tipo_entrega = models.CharField(max_length=15)
    direccion_entrega = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'PEDIDO'

class DetallePedido(models.Model):
    pedido = models.ForeignKey('Pedido', on_delete=models.CASCADE, db_column='id_pedido', primary_key=False)
    producto = models.ForeignKey('Producto', on_delete=models.CASCADE, db_column='id_producto', primary_key=False)
    cantidad = models.IntegerField()
    precio_unitario = models.IntegerField()

    class Meta:
        db_table = 'DETALLE_PEDIDO'
        unique_together = ('pedido', 'producto')  # Define la clave primaria compuesta

class Inventario(models.Model):
    sucursal = models.ForeignKey('Sucursal', on_delete=models.PROTECT, db_column='id_sucursal', primary_key=False)
    producto = models.ForeignKey('Producto', on_delete=models.PROTECT, db_column='id_producto', primary_key=False)
    bodeguero = models.ForeignKey('Bodeguero', on_delete=models.PROTECT, db_column='id_bodeguero', primary_key=False)
    stock = models.IntegerField(default=0)

    class Meta:
        db_table = 'INVENTARIO'
        unique_together = ('sucursal', 'producto', 'bodeguero')  # Define la clave primaria compuesta


class Pago(models.Model):
    id_pago = models.CharField(max_length=10, primary_key=True)
    pedido = models.ForeignKey('Pedido', on_delete=models.PROTECT, db_column='id_pedido')
    contador = models.ForeignKey('Contador', on_delete=models.PROTECT, db_column='id_contador')
    monto = models.IntegerField()
    metodo = models.CharField(max_length=20)
    fecha = models.DateTimeField(null=True, blank=True)
    estado = models.CharField(max_length=20)

    class Meta:
        db_table = 'PAGO'