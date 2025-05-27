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
    const idReal = productoElement.getAttribute('data-id'); // <-- id real de la base de datos
    const producto = {
        id: idReal,
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
                            <button class="btn-eliminar" data-index="${index}">Eliminar</button>
                        </div>
                    </div>
                `;
                carritoItemsContainer.innerHTML += itemHTML;
            });
            // Asignar eventos a los botones eliminar
            document.querySelectorAll('.btn-eliminar').forEach(btn => {
                btn.addEventListener('click', function () {
                    eliminarDelCarrito(parseInt(this.getAttribute('data-index')));
                });
            });
        }

        const totalUsd = carrito.reduce((acc, item) => acc + item.precioUsd * item.cantidad, 0);
        const totalClp = totalUsd * valorDolar;

        totalUsdElement.textContent = totalUsd.toFixed(2);
        totalClpElement.textContent = Math.round(totalClp).toLocaleString();

        contadorCarrito.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);

        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    function eliminarDelCarrito(index) {
        carrito.splice(index, 1);
        actualizarCarrito();
        actualizarTotalesConEnvio();
        renderizarBotonPaypal();
    }

    function vaciarCarrito() {
        carrito = [];
        actualizarCarrito();
        actualizarTotalesConEnvio();
        comprarBtnContainer.innerHTML = '';
    }

    function actualizarPreciosCLP() {
        document.querySelectorAll('.producto').forEach((productoElement) => {
            const precioUsd = parseFloat(productoElement.querySelector('.precio-usd').textContent.replace('USD ', ''));
            const precioClp = precioUsd * valorDolar;
            productoElement.querySelector('.valor-convertido').textContent = Math.round(precioClp).toLocaleString();
        });
    }

    function actualizarTotalesConEnvio() {
        // Calcular total de artículos
        const cantidadArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        let totalUsd = carrito.reduce((acc, item) => acc + item.precioUsd * item.cantidad, 0);

        // Aplicar descuento si hay más de 4 artículos
        let descuento = 0;
        if (cantidadArticulos > 4) {
            descuento = totalUsd * 0.10; // 10% de descuento
            totalUsd = totalUsd - descuento;
        }

        const totalConEnvioUsd = totalUsd + costoEnvio;
        const totalClp = totalConEnvioUsd * valorDolar;

        totalUsdElement.textContent = totalConEnvioUsd.toFixed(2);
        totalClpElement.textContent = Math.round(totalClp).toLocaleString();

        costoEnvioUsdElement.textContent = costoEnvio.toFixed(2);
        costoEnvioClpElement.textContent = Math.round(costoEnvio * valorDolar).toLocaleString();

        // Mostrar el descuento si aplica
        let descuentoElement = document.getElementById('descuento-carrito');
        if (!descuentoElement) {
            descuentoElement = document.createElement('p');
            descuentoElement.id = 'descuento-carrito';
            descuentoElement.style.color = '#28a745';
            totalUsdElement.parentElement.parentElement.insertBefore(descuentoElement, totalUsdElement.parentElement.nextSibling);
        }
        if (descuento > 0) {
            descuentoElement.textContent = `¡Descuento aplicado: -$${descuento.toFixed(2)} USD!`;
            descuentoElement.style.display = 'block';
        } else {
            descuentoElement.style.display = 'none';
        }
    }

    function renderizarBotonPaypal() {
        comprarBtnContainer.innerHTML = ''; // limpiar contenedor antes

        // Calcular total de artículos y total USD con descuento si aplica
        const cantidadArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
        let totalUsd = carrito.reduce((acc, item) => acc + item.precioUsd * item.cantidad, 0);

        if (cantidadArticulos > 4) {
            totalUsd = totalUsd - (totalUsd * 0.10);
        }

        const totalConEnvioUsd = totalUsd + costoEnvio;

        if (totalConEnvioUsd > 0 && typeof paypal !== "undefined" && paypal.Buttons) {
            paypal.Buttons({
                createOrder: function(_, actions) {
                    // Recalcular total por si acaso
                    let totalActual = carrito.reduce((acc, item) => acc + item.precioUsd * item.cantidad, 0);
                    if (cantidadArticulos > 4) {
                        totalActual = totalActual - (totalActual * 0.10);
                    }
                    totalActual = totalActual + costoEnvio;
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: totalActual.toFixed(2),
                                currency_code: "USD"
                            }
                        }]
                    });
                },
                onApprove: function(_, actions) {
                    return actions.order.capture().then(function(details) {
                        // Guardar el detalle del pedido en el backend solo después del pago exitoso
                        fetch('/guardar_pedido/', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-CSRFToken': getCookie('csrftoken')
                            },
                            body: JSON.stringify({
                                pedido_id: details.id, // Usa el id de PayPal como id_pedido
                                productos: carrito,    // El array de productos del carrito
                                total: totalConEnvioUsd
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.status === 'ok') {
                                // Copia los productos antes de vaciar el carrito
                                const productosComprados = carrito.slice();
                                mostrarModalConfirmacion(details, totalConEnvioUsd, productosComprados);
                                vaciarCarrito();
                                cerrarCarrito();
                            } else {
                                mostrarError('No se pudo guardar el detalle del pedido: ' + (data.errores || data.msg));
                            }
                        })
                        .catch(() => {
                            // mostrarError('Error de red al guardar el pedido.');
                        });
                    });
                }
            }).render('#comprar-btn-container');
        }
    }

    // Función para mostrar el modal de confirmación
    function mostrarModalConfirmacion(details, totalUsd, productosComprados) {
        const cantidadArticulos = productosComprados.reduce((acc, item) => acc + item.cantidad, 0);
        const metodoEnvio = document.getElementById('metodo-envio').options[document.getElementById('metodo-envio').selectedIndex].text;
        const subtotal = totalUsd - costoEnvio;

        const modalHTML = `
            <div class="order-success-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:2000;font-family:Arial,sans-serif;">
                <div class="order-success-content" style="background:white;padding:30px;border-radius:10px;max-width:600px;width:90%;max-height:90vh;overflow-y:auto;box-shadow:0 5px 15px rgba(0,0,0,0.3);">
                    <div class="order-success-header" style="text-align:center;margin-bottom:20px;padding-bottom:15px;border-bottom:1px solid #eee;">
                        <div style="font-size:50px;color:#28a745;margin-bottom:15px;">✓</div>
                        <h2 style="color:#28a745;margin-bottom:10px;">¡Gracias por tu compra!</h2>
                        <p>Tu pedido #${details.id.substr(0, 8)} ha sido procesado con éxito</p>
                    </div>
                    <div style="margin-bottom:20px;">
                        <h3 style="color:#333;margin-bottom:15px;font-size:18px;border-bottom:1px solid #eee;padding-bottom:5px;">Información del pago</h3>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">ID de transacción:</span>
                            <span style="color:#333;">${details.id}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Estado:</span>
                            <span style="color:#333;">${details.status}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Fecha:</span>
                            <span style="color:#333;">${new Date(details.create_time).toLocaleString()}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Correo PayPal:</span>
                            <span style="color:#333;">${details.payer.email_address}</span>
                        </div>
                    </div>
                    <div style="margin-bottom:20px;">
                        <h3 style="color:#333;margin-bottom:15px;font-size:18px;border-bottom:1px solid #eee;padding-bottom:5px;">Información de envío</h3>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Método:</span>
                            <span style="color:#333;">${metodoEnvio}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Costo de envío:</span>
                            <span style="color:#333;">$${costoEnvio.toFixed(2)} USD</span>
                        </div>
                    </div>
                    <div style="margin-bottom:20px;">
                        <h3 style="color:#333;margin-bottom:15px;font-size:18px;border-bottom:1px solid #eee;padding-bottom:5px;">Productos (${cantidadArticulos})</h3>
                        <div style="margin-top:15px;">
                            ${productosComprados.map(item => `
                                <div style="display:flex;align-items:center;margin-bottom:15px;padding-bottom:15px;border-bottom:1px dashed #eee;">
                                    <img src="${item.imagen}" alt="${item.nombre}" style="width:60px;height:60px;object-fit:cover;border-radius:5px;margin-right:15px;">
                                    <div style="flex-grow:1;">
                                        <div style="font-weight:bold;margin-bottom:5px;">${item.nombre}</div>
                                        <div style="color:#666;">Cantidad: ${item.cantidad}</div>
                                    </div>
                                    <div style="color:#e67e22;">$${(item.precioUsd * item.cantidad).toFixed(2)} USD</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div style="margin-top:20px;padding-top:15px;border-top:2px solid #eee;">
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Subtotal:</span>
                            <span style="color:#333;">$${subtotal.toFixed(2)} USD</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Envío:</span>
                            <span style="color:#333;">$${costoEnvio.toFixed(2)} USD</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-top:10px;">
                            <span style="font-weight:bold;color:#2c3e50;font-size:18px;">Total:</span>
                            <span style="color:#333;font-size:22px;">$${totalUsd.toFixed(2)} USD</span>
                        </div>
                    </div>
                    <button onclick="document.querySelector('.order-success-modal').remove();" style="display:block;width:100%;padding:12px;background-color:#007bff;color:white;border:none;border-radius:5px;font-size:16px;cursor:pointer;margin-top:20px;transition:background-color 0.3s;">Cerrar</button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Función para mostrar errores (usada en onError de PayPal)
    function mostrarError(mensaje) {
        const errorHTML = `
            <div class="error-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:2000;">
                <div style="background:white;padding:30px;border-radius:10px;max-width:500px;width:90%;text-align:center;">
                    <h3 style="color:#dc3545;margin-bottom:20px;">Error en el pago</h3>
                    <p style="margin-bottom:20px;">${mensaje}</p>
                    <button onclick="document.querySelector('.error-modal').remove()" style="padding:10px 20px;background:#dc3545;color:white;border:none;border-radius:5px;cursor:pointer;">Cerrar</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', errorHTML);
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

    // Función para obtener el CSRF token
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
});