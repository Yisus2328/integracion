document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const abrirCarritoBtn = document.getElementById('abrir-carrito');
    const carritoModal = document.getElementById('carrito-modal');
    const cerrarModalBtn = document.querySelector('.cerrar-modal');
    const carritoItemsContainer = document.getElementById('carrito-items');
    const contadorCarrito = document.getElementById('contador-carrito');
    const totalUsdElement = document.getElementById('total-usd');
    const totalClpElement = document.getElementById('total-clp');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
    const comprarBtn = document.getElementById('comprar');
    const botonesComprar = document.querySelectorAll('.producto button');
    
    // Variables
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    let valorDolar = parseFloat(document.getElementById('valor-dolar').textContent.replace('$', '')) || 0;
    
    // Event Listeners
    abrirCarritoBtn.addEventListener('click', abrirCarrito);
    cerrarModalBtn.addEventListener('click', cerrarCarrito);
    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);
    comprarBtn.addEventListener('click', finalizarCompra);
    
    // Asignar evento a cada botón "Comprar"
    botonesComprar.forEach((boton, index) => {
        boton.addEventListener('click', () => agregarAlCarrito(index));
    });
    
    // Observar cambios en el valor del dólar para actualizar precios CLP
    const observer = new MutationObserver(actualizarPreciosCLP);
    observer.observe(document.getElementById('valor-dolar'), { childList: true });
    
    // Inicializar carrito
    actualizarCarrito();
    
    // Funciones
    function abrirCarrito() {
        carritoModal.style.display = 'block';
    }
    
    function cerrarCarrito() {
        carritoModal.style.display = 'none';
    }
    
    function agregarAlCarrito(index) {
        const productoElement = document.querySelectorAll('.producto')[index];
        const producto = {
            id: index + 1,
            nombre: productoElement.querySelector('h3').textContent,
            precioUsd: parseFloat(productoElement.querySelector('.precio-usd').textContent.replace('USD ', '')),
            imagen: productoElement.querySelector('img').src,
            cantidad: 1
        };
        
        const productoExistente = carrito.find(item => item.id === producto.id);
        
        if (productoExistente) {
            productoExistente.cantidad++;
        } else {
            carrito.push(producto);
        }
        
        actualizarCarrito();
        mostrarNotificacion(`${producto.nombre} agregado al carrito`);
    }
    
    function actualizarCarrito() {
        // Guardar en localStorage
        localStorage.setItem('carrito', JSON.stringify(carrito));
        
        // Actualizar contador
        contadorCarrito.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);
        
        // Actualizar items del carrito
        carritoItemsContainer.innerHTML = '';
        
        if (carrito.length === 0) {
            carritoItemsContainer.innerHTML = '<p>Tu carrito está vacío</p>';
            totalUsdElement.textContent = '0.00';
            totalClpElement.textContent = '0';
            return;
        }
        
        carrito.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'carrito-item';
            itemElement.innerHTML = `
                <img src="${item.imagen}" alt="${item.nombre}">
                <div class="carrito-item-info">
                    <h4>${item.nombre}</h4>
                    <p>USD ${item.precioUsd.toFixed(2)}</p>
                </div>
                <div class="carrito-item-cantidad">
                    <button class="disminuir" data-index="${index}">-</button>
                    <span>${item.cantidad}</span>
                    <button class="aumentar" data-index="${index}">+</button>
                </div>
                <span class="carrito-item-precio">
                    USD ${(item.precioUsd * item.cantidad).toFixed(2)}
                </span>
                <span class="carrito-item-eliminar" data-index="${index}">🗑️</span>
            `;
            carritoItemsContainer.appendChild(itemElement);
        });
        
        // Actualizar totales
        actualizarTotales();
        
        // Asignar eventos a los nuevos botones
        document.querySelectorAll('.disminuir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                disminuirCantidad(index);
            });
        });
        
        document.querySelectorAll('.aumentar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                aumentarCantidad(index);
            });
        });
        
        document.querySelectorAll('.carrito-item-eliminar').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                eliminarItem(index);
            });
        });
    }
    
    function actualizarTotales() {
        const totalUsd = carrito.reduce((total, item) => total + (item.precioUsd * item.cantidad), 0);
        const totalClp = totalUsd * valorDolar;
        
        totalUsdElement.textContent = totalUsd.toFixed(2);
        totalClpElement.textContent = Math.round(totalClp);
    }
    
    function actualizarPreciosCLP() {
        valorDolar = parseFloat(document.getElementById('valor-dolar').textContent.replace('$', '')) || 0;
        if (carrito.length > 0) {
            actualizarTotales();
        }
    }
    
    function disminuirCantidad(index) {
        if (carrito[index].cantidad > 1) {
            carrito[index].cantidad--;
        } else {
            carrito.splice(index, 1);
        }
        actualizarCarrito();
    }
    
    function aumentarCantidad(index) {
        carrito[index].cantidad++;
        actualizarCarrito();
    }
    
    function eliminarItem(index) {
        carrito.splice(index, 1);
        actualizarCarrito();
    }
    
    function vaciarCarrito() {
        carrito = [];
        actualizarCarrito();
        mostrarNotificacion('Carrito vaciado');
    }
    
    function finalizarCompra() {
        if (carrito.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        
        // Aquí iría la lógica para procesar la compra
        alert('Compra realizada con éxito! Gracias por tu compra en Ferremas.');
        vaciarCarrito();
        cerrarCarrito();
    }
    
    function mostrarNotificacion(mensaje) {
        const notificacion = document.createElement('div');
        notificacion.className = 'notificacion';
        notificacion.textContent = mensaje;
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.classList.add('mostrar');
        }, 10);
        
        setTimeout(() => {
            notificacion.classList.remove('mostrar');
            setTimeout(() => {
                document.body.removeChild(notificacion);
            }, 300);
        }, 3000);
    }
    
    // Cerrar modal al hacer clic fuera del contenido
    window.addEventListener('click', (event) => {
        if (event.target === carritoModal) {
            cerrarCarrito();
        }
    });
});
// Fin del código