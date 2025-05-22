from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('carrito/', views.carrito, name='carrito'),
    path('index/', views.index, name='index'),
    path('agregar_producto/', views.formulario_agregar_producto, name='formulario_agregar_producto'),
    path('listar_productos/', views.listar_eliminar_producto, name='listar_productos'),
    path('agregar_cliente/', views.agregar_cliente, name='agregar_cliente'),
    path('login_t/', views.login_t, name='login_t'),
    path('bodegueros/inventario/', views.v_bodeguero, name='v_bodeguero'),
    path('contadores/dashboard/', views.v_contador, name='v_contador'),
    path('vendedores/ventas/', views.v_vendedor, name='v_vendedor'),
    path('panel_ad/', views.panel_ad, name='panel_administrador'),
    path('login_a/', views.login_a, name='login_a'),
    path('agregar_empleado/', views.agregar_e, name='agregar_empleado'),


]
