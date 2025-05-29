from django.urls import path
from . import views
from django.contrib.auth import views as auth_views

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
    path('login_admin/', views.login_admin, name='login_admin'),
    path('admin_cambio/', views.cambio_pass, name='admin_cambio'),
    path('agregar_empleado/', views.agregar_e, name='agregar_empleado'),
    path('guardar_pedido/', views.guardar_pedido, name='guardar_pedido'),
    path('mi_cuenta/', views.mi_cuenta_cliente, name='mi_cuenta_cliente'),

    path('producto/procesar_agregar/', views.procesar_agregar_producto, name='procesar_agregar_producto'),     
    path('login_cliente_django/', views.login_cliente_django, name='login_cliente_django'),
    path('logout_cliente/', auth_views.LogoutView.as_view(next_page='/'), name='logout_cliente'),
    path('api/get_cliente_data/', views.get_cliente_data, name='get_cliente_data_api'),
    path('api/pedidos/<str:pedido_id>/marcar-pagado/', views.cambiar_estado_pedido_a_pagado, name='marcar_pedido_pagado'),
    path('api/pedidos/marcar-rechazado/', views.marcar_pedido_rechazado, name='marcar_pedido_rechazado'),
    path('api/pedidos/<str:pedido_id>/marcar-enviado/', views.marcar_pedido_enviado, name='marcar_pedido_enviado'),
    path('mi-cuenta/', views.mi_cuenta, name='mi_cuenta'),




]
