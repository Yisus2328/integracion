from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('carrito/', views.carrito, name='carrito'),
    path('index/', views.index, name='index'),
    path('agregar_producto/', views.formulario_agregar_producto, name='formulario_agregar_producto'),
    path('listar_productos/', views.listar_eliminar_producto, name='listar_productos'),
]
