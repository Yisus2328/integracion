from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse #
from django.views.decorators.csrf import csrf_exempt #
from django.contrib.auth import authenticate, login 
from django.contrib.auth.models import User
from django.conf import settings
from django.db import transaction
import requests
import json #
from .models import Producto, Cliente,DetallePedido,Bodeguero,Pedido,Vendedor,Administrador,Contador,Sucursal
import os


FASTAPI_API_URL = 'http://127.0.0.1:8001/producto/agregar_prod' 

# Create your views here.
def home(request):
    productos = Producto.objects.all()
    return render(request, 'home.html', {'productos': productos})


def carrito(request):
    return render(request, 'carrito.html')

def index(request):
    return render(request, 'index.html')

def formulario_agregar_producto(request):
    return render(request, 'agregar_producto.html')

def listar_eliminar_producto(request):
    return render(request, 'listar_productos.html')

def agregar_cliente(request):
    return render(request, 'cliente_formulario.html')


def login_t(request):
    return render(request, 'login_t.html')

def v_bodeguero(request):
    return render(request, 'v_bodeguero.html')

def v_contador(request):
    pedidos_en_revision = Pedido.objects.filter(estado='En Revision').order_by('-fecha')
    context = {
        'pedidos_en_revision': pedidos_en_revision
    }
    return render(request, 'v_contador.html', context)

def v_vendedor(request):

    pedidos_preparados = Pedido.objects.filter(estado='Preparado').order_by('-fecha')
    context = {
        'pedidos_preparados': pedidos_preparados
    }
    return render(request, 'v_vendedor.html', context)

def panel_ad(request):
    return render(request, 'panel_ad.html')

def login_admin(request):
    return render(request, 'login_admin.html')

def agregar_e(request):
    return render(request, 'agregar_empleados.html')

def pago(request):
    return render(request, 'pago.html')

def checkout(request):
    return render(request, 'checkout.html')

def mi_cuenta_cliente(request):
    return render(request, 'mi_cuenta.html')

def cambio_pass(request):
    return render(request, 'admin_cambio.html')

def listar_empleados(request):
    return render(request, 'listar_empleados.html')




##contador

def cambiar_estado_pedido_a_pagado(request, pedido_id):
    try:
        
        pedido = get_object_or_404(Pedido, id_pedido=pedido_id)

        
        if pedido.estado == 'En Revision':
            pedido.estado = 'Pagado'
            pedido.save()
            return JsonResponse({'status': 'success', 'message': f'El pedido {pedido_id} ha sido marcado como Pagado.'})
        else:
            return JsonResponse({'status': 'error', 'message': f'El pedido {pedido_id} no está en estado "En Revision" para ser marcado como Pagado.'}, status=400)

    except Exception as e:
        print(f"Error al cambiar el estado del pedido {pedido_id}: {e}")
        return JsonResponse({'status': 'error', 'message': f'Error interno al procesar la solicitud: {str(e)}'}, status=500)
    

def marcar_pedido_rechazado(request):

    pedido_id = request.POST.get('pedido_id')
    if not pedido_id:
        return JsonResponse({'status': 'error', 'message': 'ID de pedido no proporcionado.'}, status=400)

    try:
        pedido = get_object_or_404(Pedido, id_pedido=pedido_id)
        if pedido.estado == 'En Revision':
            pedido.estado = 'Rechazado' 
            pedido.save()
            return JsonResponse({'status': 'ok', 'message': f'Pedido {pedido_id} marcado como Rechazado.'})
        else:
            return JsonResponse({'status': 'error', 'message': 'El pedido no está en estado "En Revisión".'}, status=400)
    except Exception as e:
        return JsonResponse({'status': 'error', 'message': f'Error al marcar pedido como rechazado: {str(e)}'}, status=500)




def marcar_pedido_enviado(request, pedido_id):

    try:
        pedido = get_object_or_404(Pedido, id_pedido=pedido_id)

        if pedido.estado == 'Preparado':
            pedido.estado = 'Enviado'
            pedido.save()
            return JsonResponse({'status': 'success', 'message': f'Pedido {pedido_id} marcado como Enviado.'})
        else:
            return JsonResponse({'status': 'error', 'message': f'El pedido {pedido_id} no está en estado "Preparado" ({pedido.estado}).'}, status=400)

    except Exception as e:
        print(f"Error al marcar pedido {pedido_id} como Enviado: {e}")
        return JsonResponse({'status': 'error', 'message': f'Error interno del servidor: {str(e)}'}, status=500)





##agregar pedido
@csrf_exempt
def guardar_pedido(request):
    if request.method == 'POST':
        pedido = None
        data = {} 

        try:
            
            if request.content_type == 'application/json':
                data = json.loads(request.body.decode('utf-8'))
                print(f"DEBUG: Datos JSON parseados (PayPal): {data}")
                comprobante_archivo = None 
            else: 
                data = request.POST.copy()
                print(f"DEBUG: Datos POST estándar (FormData): {data}")
                comprobante_archivo = request.FILES.get('comprobante') 
                print(f"DEBUG: Archivos recibidos (FormData): {request.FILES}")

        except json.JSONDecodeError as e:
            print(f"DEBUG: Error al decodificar JSON: {e}")
            return JsonResponse({'status': 'error', 'errores': [f'Formato de datos JSON inválido: {e}']}, status=400)
        except Exception as e:
            print(f"DEBUG: Error inesperado al leer el cuerpo de la solicitud: {e}")
            return JsonResponse({'status': 'error', 'errores': [f'Error al procesar la solicitud: {str(e)}']}, status=400)


        pedido_id = data.get('pedido_id')

        productos_raw = data.get('productos') or data.get('productos_json')

        total_str = data.get('total') or data.get('total_a_pagar')
        metodo_pago = data.get('metodo_pago', 'paypal') 
        metodo_envio = data.get('metodo_envio', 'estandar') 
        direccion_entrega = data.get('direccion_entrega', '') 


        print(f"DEBUG: pedido_id: {pedido_id}")
        print(f"DEBUG: productos_raw (según tipo de envío): {productos_raw}") 
        print(f"DEBUG: total_str (string/float): {total_str}")
        print(f"DEBUG: metodo_pago: {metodo_pago}")
        print(f"DEBUG: metodo_envio: {metodo_envio}")
        print(f"DEBUG: direccion_entrega: {direccion_entrega}")
        print(f"DEBUG: comprobante_archivo: {comprobante_archivo}")


        if not pedido_id or not productos_raw or not total_str:
            return JsonResponse({'status': 'error', 'errores': ['Faltan datos esenciales del pedido (ID, productos o total).']}, status=400)

        
        productos = []
        try:
            if isinstance(productos_raw, str):
                productos = json.loads(productos_raw)
            else: 
                productos = productos_raw
        except json.JSONDecodeError as e:
            print(f"DEBUG: Error al parsear productos_raw JSON: {e}")
            return JsonResponse({'status': 'error', 'errores': [f'Formato de productos inválido: {e}']}, status=400)

        try:
            total = float(total_str) if isinstance(total_str, str) else float(total_str)
        except ValueError as e:
            print(f"DEBUG: Error al convertir total a float: {e}")
            return JsonResponse({'status': 'error', 'errores': [f'Formato de total inválido: {e}']}, status=400)


        try:
            cliente_logueado = request.user.cliente_profile
        except (Cliente.DoesNotExist, AttributeError):
            return JsonResponse({'status': 'error', 'errores': ['Usuario no autenticado o no es un cliente válido para crear un pedido.']}, status=401)

        try:
            vendedor = Vendedor.objects.first()
            if not vendedor:
                return JsonResponse({'status': 'error', 'errores': ['No se encontró ningún Vendedor en la base de datos.']}, status=500)
        except Exception as e:
            print(f"DEBUG: Error al obtener el primer Vendedor: {e}")
            return JsonResponse({'status': 'error', 'errores': [f"Error interno del servidor al buscar Vendedor: {str(e)}"]}, status=500)

        try:
            bodeguero = Bodeguero.objects.first()
            if not bodeguero:
                return JsonResponse({'status': 'error', 'errores': ['No se encontró ningún Bodeguero en la base de datos.']}, status=500)
        except Exception as e:
            print(f"DEBUG: Error al obtener el primer Bodeguero: {e}")
            return JsonResponse({'status': 'error', 'errores': [f"Error interno del servidor al buscar Bodeguero: {str(e)}"]}, status=500)
            
        estado_pedido = 'Pagado' # Por defecto para PayPal
        if metodo_pago == 'transferencia':
            estado_pedido = 'En Revision'
        
        tipo_entrega = 'envío a domicilio'
        if metodo_envio == 'retiro':
            tipo_entrega = 'retiro en tienda'
            
        # 4. Crear o Actualizar el Pedido
        try:
            pedido, created = Pedido.objects.get_or_create(
                id_pedido=pedido_id,
                defaults={
                    'cliente': cliente_logueado,
                    'vendedor': vendedor,
                    'bodeguero': bodeguero,
                    'estado': estado_pedido,
                    'tipo_entrega': tipo_entrega,
                    'direccion_entrega': direccion_entrega,
                    'comprobante_transferencia': comprobante_archivo if metodo_pago == 'transferencia' else None,
                    'total': total  
                }
            )
            if not created:
                pedido.cliente = cliente_logueado
                pedido.vendedor = vendedor
                pedido.bodeguero = bodeguero
                pedido.estado = estado_pedido
                pedido.tipo_entrega = tipo_entrega
                pedido.direccion_entrega = direccion_entrega
                pedido.total = total  
                if metodo_pago == 'transferencia':
                    pedido.comprobante_transferencia = comprobante_archivo
                else:
                    pedido.comprobante_transferencia = None
                pedido.save()

        except Exception as e:
            print(f"DEBUG: Error al crear/obtener o actualizar pedido en DB: {type(e).__name__}: {e}")
            return JsonResponse({'status': 'error', 'errores': [f"Error al crear/obtener o actualizar pedido: {str(e)}"]}, status=500)

        # 5. Crear DetallePedido
        errores_detalle = []
        if not created:
            DetallePedido.objects.filter(pedido=pedido).delete()

        for item in productos:
            try:
                producto = Producto.objects.get(id_producto=item['id'])
                DetallePedido.crear_detalle(
                    pedido=pedido,
                    producto=producto,
                    cantidad=item['cantidad'],
                    precio_unitario=producto.precio
                )
            except Producto.DoesNotExist:
                errores_detalle.append(f"Producto {item['id']} no existe en la base de datos.")
            except Exception as e:
                errores_detalle.append(f"Error al añadir detalle para producto {item['id']}: {str(e)}")

        if errores_detalle:
            return JsonResponse({'status': 'error', 'errores': errores_detalle}, status=400)

        return JsonResponse({'status': 'ok', 'message': 'Pedido guardado exitosamente (y comprobante si aplica).'})

    return JsonResponse({'status': 'error', 'errores': ['Método no permitido']}, status=405)


##agregar producto
@csrf_exempt 
def procesar_agregar_producto(request):
    if request.method == 'POST':
        
        id_producto = request.POST.get('id_producto')
        nombre = request.POST.get('nombre')
        descripcion = request.POST.get('descripcion')
        precio = request.POST.get('precio')
        marca = request.POST.get('marca')
        categoria = request.POST.get('categoria')
        stock = request.POST.get('stock')
        imagen_archivo = request.FILES.get('imagen_producto') 

        imagen_url_db = '' 

        
        if imagen_archivo:
            
           
            upload_dir = os.path.join(settings.MEDIA_ROOT, 'productos_imagenes')
            os.makedirs(upload_dir, exist_ok=True) 

            
            file_extension = os.path.splitext(imagen_archivo.name)[1] 
            unique_filename = f"{id_producto}_{os.urandom(4).hex()}{file_extension}" 

            filepath = os.path.join(upload_dir, unique_filename)

            
            with open(filepath, 'wb+') as destination:
                for chunk in imagen_archivo.chunks():
                    destination.write(chunk)

            imagen_url_db = os.path.join(settings.MEDIA_URL, 'productos_imagenes', unique_filename).replace('\\', '/')

        
            try:
                precio_int = int(precio) if precio else 0 
                stock_int = int(stock) if stock else 0 
            except (ValueError, TypeError):
                return JsonResponse({'success': False, 'message': 'Precio o Stock no son números válidos.'}, status=400)

        producto_data_for_fastapi = {
            "id_producto": id_producto,
            "nombre": nombre,
            "descripcion": descripcion,
            "precio": precio_int,
            "marca": marca,
            "categoria": categoria,
            "stock": stock_int,
            "imagen_url": imagen_url_db 
        }

        
        try:
            fastapi_response = requests.post(FASTAPI_API_URL, json=producto_data_for_fastapi)
            fastapi_response.raise_for_status() 

            fastapi_result = fastapi_response.json()
            return JsonResponse({'success': True, 'message': fastapi_result.get('mensaje', 'Producto agregado exitosamente.')})

        except requests.exceptions.RequestException as e:
            print(f"Error al conectar o recibir respuesta de FastAPI: {e}")
            return JsonResponse({'success': False, 'message': f"Error al conectar con el servidor de productos (FastAPI): {e}"}, status=500)
        except json.JSONDecodeError:
            print(f"FastAPI no devolvió JSON válido. Respuesta: {fastapi_response.text}")
            return JsonResponse({'success': False, 'message': 'Error inesperado de FastAPI: Respuesta no es JSON válido.'}, status=500)
        except Exception as e:
            print(f"Error inesperado en la vista de Django: {e}")
            return JsonResponse({'success': False, 'message': f"Error interno del servidor de Django: {e}"}, status=500)

    return JsonResponse({'success': False, 'message': 'Método HTTP no permitido.'}, status=405)


 
##login cliente
@csrf_exempt 
def login_cliente_django(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')

            if not email or not password:
                return JsonResponse({'success': False, 'message': 'Email y contraseña son requeridos.'}, status=400)


            user = authenticate(request, username=email, password=password)

            if user is not None:

                login(request, user) 


                try:
                    cliente_logueado = user.cliente_profile 
                    request.session['cliente_rut'] = cliente_logueado.rut
                except Cliente.DoesNotExist:
                    
                    print(f"Advertencia: No se encontró perfil de cliente para el usuario {user.username}")
                    request.session['cliente_rut'] = None 

                return JsonResponse({
                    'success': True,
                    'message': 'Inicio de sesión exitoso.',
                    'redirect_url': '/', 
                    'cliente_rut': request.session.get('cliente_rut')
                })

            else:
                return JsonResponse({'success': False, 'message': 'Credenciales inválidas. Email o contraseña incorrectos.'}, status=401)

        except json.JSONDecodeError:
            return JsonResponse({'success': False, 'message': 'Formato de solicitud JSON inválido.'}, status=400)
        except Exception as e:
            print(f"Error en la vista de login: {e}")
            return JsonResponse({'success': False, 'message': 'Error interno del servidor.'}, status=500)

    return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)


##apartado de "mi_cuenta"
def get_cliente_data(request): # ¡Ahora esta función obtendrá todo!
    if not request.user.is_authenticated:
        return JsonResponse({'success': False, 'message': 'No autenticado'}, status=401)

    try:
        # 1. Obtener el perfil de cliente
        cliente = request.user.cliente_profile
        
        # Prepara los datos del cliente
        cliente_data = {
            'rut': cliente.rut,
            'nombre': cliente.nombre,
            'email': cliente.email,
            'telefono': cliente.telefono,
            'direccion': cliente.direccion,
        }

        # 2. Obtener los pedidos asociados a este cliente
        pedidos = cliente.pedidos.all().order_by('-fecha') # Ordenamos por fecha descendente

        pedidos_list_data = []
        for pedido in pedidos:
            pedidos_list_data.append({
                'id_pedido': pedido.id_pedido,
                'fecha': pedido.fecha.strftime('%Y-%m-%d %H:%M'), # Formatear la fecha
                'estado': pedido.estado,
                'tipo_entrega': pedido.tipo_entrega,
                'direccion_entrega': cliente.direccion,
                'total': pedido.total,  
            })
        
        # 3. Combinar los datos del cliente y los pedidos en una única respuesta JSON
        return JsonResponse({
            'success': True,
            'cliente': cliente_data,
            'pedidos': pedidos_list_data
        })

    except Cliente.DoesNotExist:
        return JsonResponse({'success': False, 'message': 'No se encontró perfil de cliente para este usuario.'}, status=404)
    except Exception as e:
        print(f"Error en get_cliente_data (clientes y pedidos): {e}") # Mensaje de error más descriptivo
        return JsonResponse({'success': False, 'message': 'Error interno del servidor al obtener datos del cliente y sus pedidos.'}, status=500)
    

def mi_cuenta(request):
    if request.method == 'POST':
        
        pedido_id = request.POST.get('pedido_id')
        nuevo_comprobante = request.FILES.get('comprobante_transferencia') 

        if not pedido_id or not nuevo_comprobante:
            return JsonResponse({'status': 'error', 'message': 'ID de pedido o nuevo comprobante no proporcionado.'}, status=400)

        try:
            with transaction.atomic(): # Inicia una transacción atómica
                cliente = request.user.cliente_profile # Aseguramos que el cliente está asociado al usuario
                pedido = get_object_or_404(Pedido, id_pedido=pedido_id, cliente=cliente) # Verificación de propiedad del pedido

                if pedido.estado == 'Rechazado':


                    pedido.comprobante_transferencia = nuevo_comprobante
                    pedido.estado = 'En Revision' # Cambiar el estado a "En Revisión"
                    pedido.save()

                    return JsonResponse({'status': 'ok', 'message': f'Comprobante del pedido {pedido_id} actualizado y estado cambiado a "En Revisión".'})
                else:
                    return JsonResponse({'status': 'error', 'message': f'El pedido {pedido_id} no está en estado "Rechazado" y no se puede resubir el comprobante.'}, status=400)

        except Cliente.DoesNotExist:
             return JsonResponse({'status': 'error', 'message': 'Perfil de cliente no encontrado para este usuario.'}, status=404)
        except Pedido.DoesNotExist:
            return JsonResponse({'status': 'error', 'message': 'Pedido no encontrado o no pertenece a este cliente.'}, status=404)
        except Exception as e:
            print(f"Error al resubir comprobante para pedido {pedido_id}: {e}")
            return JsonResponse({'status': 'error', 'message': f'Error interno al procesar la solicitud: {str(e)}'}, status=500)
    
    return render(request, 'mi_cuenta.html')


##metodos empleados

def listar_todos_los_empleados_manual(request):

    all_employees_data = []

    try:
        # Obtener y serializar vendedores
        vendedores = Vendedor.objects.select_related('id_sucursal').all()
        for vendedor in vendedores:
            all_employees_data.append({
                'id': vendedor.id_vendedor, # Usar 'id' genérico
                'rut': vendedor.rut,
                'nombre': vendedor.nombre,
                'email': vendedor.email,
                'id_sucursal': vendedor.id_sucursal.id_sucursal, # Acceder al ID de la sucursal
                'nombre_sucursal': vendedor.id_sucursal.nombre, # Si quieres el nombre de la sucursal
                'tipo': 'vendedor'
            })

        # Obtener y serializar bodegueros
        bodegueros = Bodeguero.objects.select_related('id_sucursal').all()
        for bodeguero in bodegueros:
            all_employees_data.append({
                'id': bodeguero.id_bodeguero,
                'rut': bodeguero.rut,
                'nombre': bodeguero.nombre,
                'email': bodeguero.email,
                'id_sucursal': bodeguero.id_sucursal.id_sucursal,
                'nombre_sucursal': bodeguero.id_sucursal.nombre,
                'tipo': 'bodeguero'
            })

        # Obtener y serializar contadores
        contadores = Contador.objects.select_related('id_sucursal').all()
        for contador in contadores:
            all_employees_data.append({
                'id': contador.id_contador,
                'rut': contador.rut,
                'nombre': contador.nombre,
                'email': contador.email,
                'id_sucursal': contador.id_sucursal.id_sucursal,
                'nombre_sucursal': contador.id_sucursal.nombre,
                'tipo': 'contador'
            })


        return JsonResponse({
            'success': True,
            'empleados': all_employees_data
        })

    except Exception as e:
        print(f"Error en listar_todos_los_empleados_manual: {e}")
        return JsonResponse({'success': False, 'message': 'Error interno del servidor al obtener datos de empleados.'}, status=500)


@csrf_exempt
def actualizar_empleado(request, tipo_empleado, empleado_id):
    """
    Actualiza el nombre, email y el id_sucursal de un empleado específico.
    Se espera un método PUT/PATCH con un JSON en el cuerpo.
    Ejemplo de JSON: {"nombre": "Nuevo Nombre", "email": "nuevo@ejemplo.com", "id_sucursal": "S002"}
    """
    if request.method not in ['PUT', 'PATCH']:
        return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)

    try:
        data = json.loads(request.body)
        nuevo_nombre = data.get('nombre')
        nuevo_email = data.get('email')
        nueva_id_sucursal = data.get('id_sucursal') # Este es el ID de la nueva sucursal

        # 1. Validar que al menos uno de los campos se proporciona para actualizar
        if not any([nuevo_nombre, nuevo_email, nueva_id_sucursal]):
             return JsonResponse({'success': False, 'message': 'Se debe proporcionar al menos nombre, email o id_sucursal para actualizar.'}, status=400)


        # 2. Identificar el Modelo del Empleado y buscarlo
        modelo_empleado = None
        if tipo_empleado == 'vendedor':
            modelo_empleado = Vendedor
        elif tipo_empleado == 'bodeguero':
            modelo_empleado = Bodeguero
        elif tipo_empleado == 'contador':
            modelo_empleado = Contador
        else:
            return JsonResponse({'success': False, 'message': 'Tipo de empleado no válido.'}, status=400)

        try:
            empleado = modelo_empleado.objects.get(pk=empleado_id)
        except modelo_empleado.DoesNotExist:
            return JsonResponse({'success': False, 'message': f'{tipo_empleado.capitalize()} con ID {empleado_id} no encontrado.'}, status=404)

        # 3. Preparar la actualización dentro de una transacción
        with transaction.atomic():
            if nuevo_nombre:
                empleado.nombre = nuevo_nombre
            if nuevo_email:
                empleado.email = nuevo_email

            if nueva_id_sucursal:
                try:
                    # Buscamos la nueva sucursal por su ID
                    nueva_sucursal_obj = Sucursal.objects.get(id_sucursal=nueva_id_sucursal)
                    empleado.id_sucursal = nueva_sucursal_obj # Asignamos el objeto Sucursal
                except Sucursal.DoesNotExist:
                    return JsonResponse({'success': False, 'message': f'ID de sucursal {nueva_id_sucursal} no encontrada. No se puede actualizar.'}, status=400)
            
            empleado.save()

        # 4. Respuesta Exitosa
        return JsonResponse({
            'success': True,
            'message': f'{tipo_empleado.capitalize()} {empleado_id} actualizado exitosamente.',
            'empleado_actualizado': {
                'id': empleado_id,
                'tipo': tipo_empleado,
                'nombre': empleado.nombre,
                'email': empleado.email,
                'id_sucursal': empleado.id_sucursal.id_sucursal,
                'nombre_sucursal': empleado.id_sucursal.nombre # Retornamos el nombre real de la sucursal asignada
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({'success': False, 'message': 'Cuerpo de la petición JSON inválido.'}, status=400)
    except Exception as e:
        print(f"Error al actualizar empleado {tipo_empleado} {empleado_id}: {e}")
        return JsonResponse({'success': False, 'message': f'Error interno del servidor al actualizar el {tipo_empleado}.'}, status=500)
    
@csrf_exempt # Advertencia: Deshabilita la protección CSRF para esta vista.
def eliminar_empleado(request, tipo_empleado, empleado_id):

    if request.method != 'DELETE':
        return JsonResponse({'success': False, 'message': 'Método no permitido.'}, status=405)

    try:
        # 1. Identificar el Modelo del Empleado
        modelo_empleado = None
        if tipo_empleado == 'vendedor':
            modelo_empleado = Vendedor
        elif tipo_empleado == 'bodeguero':
            modelo_empleado = Bodeguero
        elif tipo_empleado == 'contador':
            modelo_empleado = Contador
        else:
            return JsonResponse({'success': False, 'message': 'Tipo de empleado no válido.'}, status=400)

        # 2. Buscar y Eliminar el Empleado dentro de una transacción
        with transaction.atomic():
            try:
                empleado = modelo_empleado.objects.get(pk=empleado_id)
                empleado_nombre = empleado.nombre # Guardar el nombre antes de eliminar
                empleado.delete()
            except modelo_empleado.DoesNotExist:
                return JsonResponse({'success': False, 'message': f'{tipo_empleado.capitalize()} con ID {empleado_id} no encontrado.'}, status=404)

        # 3. Respuesta Exitosa
        return JsonResponse({
            'success': True,
            'message': f'{tipo_empleado.capitalize()} "{empleado_nombre}" (ID: {empleado_id}) eliminado exitosamente.'
        })

    except Exception as e:
        print(f"Error al eliminar empleado {tipo_empleado} {empleado_id}: {e}")
        return JsonResponse({'success': False, 'message': f'Error interno del servidor al eliminar el {tipo_empleado}.'}, status=500)