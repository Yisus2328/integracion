document.addEventListener('DOMContentLoaded', function () {
    const abrirCarritoBtn = document.getElementById('abrir-carrito');
    const carritoModal = document.getElementById('carrito-modal');
    const cerrarModalBtn = document.querySelector('.cerrar-modal');
    const carritoItemsContainer = document.getElementById('carrito-items');
    const contadorCarrito = document.getElementById('contador-carrito');
    const totalUsdElement = document.getElementById('total-usd');
    const totalClpElement = document.getElementById('total-clp');
    const vaciarCarritoBtn = document.getElementById('vaciar-carrito');
    const botonesComprar = document.querySelectorAll('.btn-comprar');
    const comprarBtnContainer = document.getElementById('comprar-btn-container');
    const valorDolarElement = document.getElementById('valor-dolar');
    const envioModal = document.getElementById('envio-modal');
    const cerrarEnvio = document.querySelector('.cerrar-envio-modal');
    const btnCancelarEnvio = document.querySelector('.btn-cancelar-envio');
    const metodoEnvioSelect = document.getElementById('metodo-envio');
    const costoEnvioUsdElement = document.getElementById('costo-envio-usd');
    const costoEnvioClpElement = document.getElementById('costo-envio-clp');

    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    // Tomar valor dólar del DOM
    let valorDolar = parseFloat(valorDolarElement.textContent.replace('$', '')) || 0;
    let costoEnvio = 0;

    abrirCarritoBtn.addEventListener('click', abrirCarrito);
    cerrarModalBtn.addEventListener('click', cerrarCarrito);
    vaciarCarritoBtn.addEventListener('click', vaciarCarrito);

    botonesComprar.forEach((boton, index) => {
        boton.addEventListener('click', () => agregarAlCarrito(index));
    });

    metodoEnvioSelect.addEventListener('change', function () {
        switch (this.value) {
            case 'estandar':
                costoEnvio = 5.00;
                break;
            case 'express':
                costoEnvio = 15.00;
                break;
            case 'retiro':
                costoEnvio = 0.00;
                break;
            default:
                costoEnvio = 0;
        }
        actualizarTotalesConEnvio();
        renderizarBotonPaypal();
    });

    // Observa cambios en el valor dólar para actualizar cálculos automáticamente
    const observer = new MutationObserver(() => {
        valorDolar = parseFloat(valorDolarElement.textContent.replace('$', '')) || 0;
        actualizarPreciosCLP();
        actualizarTotalesConEnvio();
        renderizarBotonPaypal();
    });

    observer.observe(valorDolarElement, { childList: true });

    actualizarCarrito();
    actualizarPreciosCLP();
    actualizarTotalesConEnvio();

    function abrirCarrito() {
        carritoModal.style.display = 'block';
        if (carrito.length > 0) {
            renderizarBotonPaypal();
        }
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

        const existente = carrito.find(item => item.id === producto.id);
        if (existente) {
            existente.cantidad++;
        } else {
            carrito.push(producto);
        }

        actualizarCarrito();
        actualizarTotalesConEnvio();
        renderizarBotonPaypal();
    }

    function actualizarCarrito() {
        carritoItemsContainer.innerHTML = '';
        if (carrito.length === 0) {
            carritoItemsContainer.innerHTML = '<p>Tu carrito está vacío</p>';
            comprarBtnContainer.innerHTML = '';
        } else {
            carrito.forEach((item, index) => {
                const itemHTML = `
                    <div class="carrito-item">
                        <img src="${item.imagen}" alt="${item.nombre}" />
                        <div>
                            <h4>${item.nombre}</h4>
                            <p>USD ${item.precioUsd.toFixed(2)} x ${item.cantidad}</p>
                            <p>Subtotal: USD ${(item.precioUsd * item.cantidad).toFixed(2)}</p>
                            <button onclick="eliminarDelCarrito(${index})">Eliminar</button>
                        </div>
                    </div>
                `;
                carritoItemsContainer.innerHTML += itemHTML;
            });
        }

        const totalUsd = carrito.reduce((acc, item) => acc + item.precioUsd * item.cantidad, 0);
        const totalClp = totalUsd * valorDolar;

        totalUsdElement.textContent = totalUsd.toFixed(2);
        totalClpElement.textContent = Math.round(totalClp).toLocaleString();

        contadorCarrito.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);

        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    window.eliminarDelCarrito = function (index) {
        carrito.splice(index, 1);
        actualizarCarrito();
        actualizarTotalesConEnvio();
        renderizarBotonPaypal();
    };

    function vaciarCarrito() {
        carrito = [];
        actualizarCarrito();
        actualizarTotalesConEnvio();
        comprarBtnContainer.innerHTML = '';
    }

    function actualizarPreciosCLP() {
        document.querySelectorAll('.producto').forEach((productoElement, index) => {
            const precioUsd = parseFloat(productoElement.querySelector('.precio-usd').textContent.replace('USD ', ''));
            const precioClp = precioUsd * valorDolar;
            productoElement.querySelector('.valor-convertido').textContent = Math.round(precioClp).toLocaleString();
        });
    }

    function actualizarTotalesConEnvio() {
        const totalUsd = carrito.reduce((acc, item) => acc + item.precioUsd * item.cantidad, 0);
        const totalConEnvioUsd = totalUsd + costoEnvio;
        const totalClp = totalConEnvioUsd * valorDolar;

        totalUsdElement.textContent = totalConEnvioUsd.toFixed(2);
        totalClpElement.textContent = Math.round(totalClp).toLocaleString();

        costoEnvioUsdElement.textContent = costoEnvio.toFixed(2);
        costoEnvioClpElement.textContent = Math.round(costoEnvio * valorDolar).toLocaleString();
    }

    function renderizarBotonPaypal() {
        comprarBtnContainer.innerHTML = ''; // limpiar contenedor antes

        const totalUsd = carrito.reduce((acc, item) => acc + item.precioUsd * item.cantidad, 0) + costoEnvio;

        paypal.Buttons({
            createOrder: function (data, actions) {
                return actions.order.create({
                    purchase_units: [{
                        amount: {
                            currency_code: "USD", // importante poner moneda
                            value: totalUsd.toFixed(2)
                        }
                    }]
                });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(function (details) {
                    alert('Gracias por tu compra, ' + details.payer.name.given_name + '!');
                    vaciarCarrito();
                    cerrarCarrito();
                });
            }
        }).render('#comprar-btn-container');
    }

    // Modal de envío
    function abrirModalEnvio() {
        envioModal.style.display = 'flex';
    }

    cerrarEnvio.addEventListener('click', () => {
        envioModal.style.display = 'none';
    });

    btnCancelarEnvio.addEventListener('click', () => {
        envioModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === envioModal) {
            envioModal.style.display = 'none';
        }
    });

    // Exportar para usar fuera si hace falta abrir modal
    window.abrirModalEnvio = abrirModalEnvio;
});
