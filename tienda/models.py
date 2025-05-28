# Create your models here.
from django.db import models
from django.contrib.auth.models import User

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
    email = models.EmailField(max_length=100, unique=True)
    contraseña = models.CharField(max_length=100)
    telefono = models.CharField(max_length=15, null=True, blank=True)
    direccion = models.CharField(max_length=40, null=True, blank=True)

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True, related_name='cliente_profile')

    class Meta:
        db_table = 'CLIENTE'

    def __str__(self):
        return f"{self.nombre} ({self.rut})"


class Producto(models.Model):
    id_producto = models.CharField(max_length=10, primary_key=True)
    nombre = models.CharField(max_length=150)
    descripcion = models.CharField(max_length=150, null=True, blank=True)
    precio = models.IntegerField()
    marca = models.CharField(max_length=50)
    categoria = models.CharField(max_length=50)
    stock = models.IntegerField(default=0)
    imagen_url = models.CharField(max_length=255, null=True, blank=True) 

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
    id_pedido = models.CharField(max_length=50, primary_key=True)
    cliente = models.ForeignKey('Cliente', on_delete=models.PROTECT, db_column='rut', related_name='pedidos')
    vendedor = models.ForeignKey('Vendedor', on_delete=models.PROTECT, db_column='id_vendedor')
    bodeguero = models.ForeignKey('Bodeguero', on_delete=models.PROTECT, db_column='id_bodeguero')
    fecha = models.DateTimeField(auto_now_add=True)
    estado = models.CharField(max_length=15)
    tipo_entrega = models.CharField(max_length=35)
    direccion_entrega = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = 'PEDIDO'

    def __str__(self):
        return f"Pedido {self.id_pedido} de {self.cliente.nombre}"

class DetallePedido(models.Model):
    pedido = models.ForeignKey('Pedido', on_delete=models.CASCADE, db_column='id_pedido', primary_key=False)
    producto = models.ForeignKey('Producto', on_delete=models.CASCADE, db_column='id_producto', primary_key=False)
    cantidad = models.IntegerField()
    precio_unitario = models.IntegerField()

    class Meta:
        db_table = 'DETALLE_PEDIDO'
        unique_together = ('pedido', 'producto')  # Define la clave primaria compuesta

    def __str__(self):
        return f"DetallePedido(pedido={self.pedido}, producto={self.producto}, cantidad={self.cantidad}, precio_unitario={self.precio_unitario})"

    @classmethod
    def crear_detalle(cls, pedido, producto, cantidad, precio_unitario):
        detalle = cls(
            pedido=pedido,
            producto=producto,
            cantidad=cantidad,
            precio_unitario=precio_unitario
        )
        detalle.save()
        return detalle

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