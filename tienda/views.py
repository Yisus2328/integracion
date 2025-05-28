from django.shortcuts import render
from django.http import JsonResponse #
from django.views.decorators.csrf import csrf_exempt #
from django.contrib.auth import authenticate, login #
from django.contrib.auth.models import User 
from django.conf import settings
import requests
import json #
from .models import Producto, Cliente
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
    return render(request, 'v_contador.html')

def v_vendedor(request):
    return render(request, 'v_vendedor.html')

def panel_ad(request):
    return render(request, 'panel_ad.html')

def login_a(request):
    return render(request, 'login_a.html')

def agregar_e(request):
    return render(request, 'agregar_empleados.html')

def pago(request):
    return render(request, 'pago.html')

def checkout(request):
    return render(request, 'checkout.html')

def mi_cuenta_cliente(request):
    return render(request, 'mi_cuenta.html')




@csrf_exempt
def guardar_pedido(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            from .models import Cliente, Vendedor, Bodeguero, Pedido, Producto, DetallePedido

            try:
                cliente_logueado = request.user.cliente_profile 
            except Cliente.DoesNotExist:
                return JsonResponse({'status': 'error', 'errores': ['No se encontró perfil de cliente asociado al usuario logueado.']}, status=400)

            vendedor = Vendedor.objects.first() 
            bodeguero = Bodeguero.objects.first() 

          
            metodo_pago = data.get('metodo_pago', 'paypal')  
            if metodo_pago == 'transferencia':
                estado_pedido = 'En Revision'
            else:
                estado_pedido = 'Pagado'

        
            metodo_envio = data.get('metodo_envio', 'estandar')  
            if metodo_envio == 'retiro':
                tipo_entrega = 'retiro en tienda'
            else:
                tipo_entrega = 'envío a domicilio'

            try:
                pedido = Pedido.objects.get(id_pedido=data['pedido_id'])
            except Pedido.DoesNotExist:
                pedido = Pedido.objects.create(
                    id_pedido=data['pedido_id'],
                    cliente=cliente_logueado, 
                    vendedor=vendedor,
                    bodeguero=bodeguero,
                    estado=estado_pedido,
                    tipo_entrega=tipo_entrega,
                    direccion_entrega='', 
                )

            errores = []
            for item in data['productos']:
                try:
                    producto = Producto.objects.get(id_producto=item['id'])
                    DetallePedido.crear_detalle(
                        pedido=pedido,
                        producto=producto,
                        cantidad=item['cantidad'],
                        precio_unitario=producto.precio
                    )
                except Producto.DoesNotExist:
                    errores.append(f"Producto {item['id']} no existe")
                except Exception as e:
                    errores.append(str(e))

            if errores:
                return JsonResponse({'status': 'error', 'errores': errores}, status=400)

            return JsonResponse({'status': 'ok', 'message': 'Pedido guardado exitosamente'})

        except json.JSONDecodeError:
            return JsonResponse({'status': 'error', 'errores': ['Formato JSON inválido.']}, status=400)
        except Exception as e:
            return JsonResponse({'status': 'error', 'errores': [str(e)]}, status=500)

    return JsonResponse({'status': 'error', 'errores': ['Método no permitido']}, status=405)



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
                'direccion_entrega': pedido.direccion_entrega, 
                # Agrega más campos si son relevantes para mostrar
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