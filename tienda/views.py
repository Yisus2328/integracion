from django.shortcuts import render

# Create your views here.
def home(request):
    return render(request, 'home.html')

def carrito(request):
    return render(request, 'carrito.html')

def index(request):
    return render(request, 'index.html')