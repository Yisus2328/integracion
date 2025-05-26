from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Producto 



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




@csrf_exempt
def guardar_pedido(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            from .models import Cliente, Vendedor, Bodeguero, Pedido, Producto, DetallePedido

            try:
                pedido = Pedido.objects.get(id_pedido=data['pedido_id'])
            except Pedido.DoesNotExist:
                cliente = Cliente.objects.first()
                vendedor = Vendedor.objects.first()
                bodeguero = Bodeguero.objects.first()
                pedido = Pedido.objects.create(
                    id_pedido=data['pedido_id'],
                    cliente=cliente,
                    vendedor=vendedor,
                    bodeguero=bodeguero,
                    estado='Pagado',
                    tipo_entrega='online',
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
            return JsonResponse({'status': 'ok'})
        except Exception as e:
            # Esto asegura que siempre devuelves JSON aunque haya error
            return JsonResponse({'status': 'error', 'errores': [str(e)]}, status=500)
    return JsonResponse({'status': 'error', 'errores': ['Método no permitido']}, status=405)