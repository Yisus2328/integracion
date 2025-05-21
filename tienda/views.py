from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'home.html')

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