document.addEventListener('DOMContentLoaded', function () {
    const metodoPago = document.getElementById('metodo-pago');
    const btnTransferencia = document.getElementById('btn-transferencia');
    const comprarBtnContainer = document.getElementById('comprar-btn-container');

    function actualizarMetodoPago() {
        if (metodoPago.value === 'paypal') {
            btnTransferencia.style.display = 'none';
            comprarBtnContainer.style.display = '';
        } else {
            btnTransferencia.style.display = '';
            comprarBtnContainer.style.display = 'none';
        }
    }

    metodoPago.addEventListener('change', actualizarMetodoPago);
    actualizarMetodoPago();

    // Función auxiliar para obtener el CSRF token
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

    // Modal transferencia con formulario para subir comprobante y generar pedido
    if (btnTransferencia) {
        btnTransferencia.addEventListener('click', function () {
            const datos = `
                <div id="modal-transferencia" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:3000;display:flex;align-items:center;justify-content:center;">
                    <div style="background:#fff;padding:30px 20px;border-radius:8px;max-width:400px;width:90%;position:relative;">
                        <button onclick="document.getElementById('modal-transferencia').remove()" style="position:absolute;top:10px;right:15px;background:none;border:none;font-size:22px;cursor:pointer;">&times;</button>
                        <h3 style="margin-bottom:15px;">Datos para Transferencia</h3>
                        <p><strong>Banco:</strong> Banco de 77</p>
                        <p><strong>Cuenta:</strong> 123456789</p>
                        <p><strong>Tipo:</strong> Cuenta Corriente</p>
                        <p><strong>Nombre:</strong> Ferremas SpA</p>
                        <p><strong>RUT:</strong> 12.345.678-9</p>
                        <p><strong>Email:</strong> pagos@ferremas.cl</p>
                        <hr>
                        <form id="form-comprobante" enctype="multipart/form-data">
                            <label for="comprobante" style="font-weight:bold;">Subir comprobante de transferencia:</label><br>
                            <input type="file" id="comprobante" name="comprobante" accept="image/*,application/pdf" style="margin-top:8px;margin-bottom:16px;" required><br>
                            <button type="submit" style="background-color:#28a745;color:white;border:none;padding:10px 15px;border-radius:4px;cursor:pointer;font-weight:bold;">Enviar comprobante</button>
                        </form>
                        <div id="mensaje-comprobante" style="margin-top:10px;"></div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', datos);

            document.getElementById('form-comprobante').addEventListener('submit', function(e){
                e.preventDefault();
                const mensaje = document.getElementById('mensaje-comprobante');
                const archivo = document.getElementById('comprobante').files[0];
                if (!archivo) {
                    mensaje.innerHTML = '<span style="color:red;">Debes seleccionar un archivo.</span>';
                    return;
                }
                mensaje.innerHTML = '<span style="color:#007bff;">Verificando pago...</span>';

                // Obtener datos del carrito y método de envío
                const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
                const metodoEnvio = document.getElementById('metodo-envio').value || 'estandar';
                // Calcular total con descuento y envío igual que PayPal
                const cantidadArticulos = carrito.reduce((acc, item) => acc + item.cantidad, 0);
                let totalUsd = carrito.reduce((acc, item) => acc + item.precioUsd * item.cantidad, 0);
                if (cantidadArticulos > 4) {
                    totalUsd = totalUsd - (totalUsd * 0.10);
                }
                let costoEnvio = 0;
                if (metodoEnvio === 'estandar') costoEnvio = 5.00;
                else costoEnvio = 0;
                const totalConEnvioUsd = totalUsd + costoEnvio;

                // Generar un id de pedido temporal
                const pedidoId = 'TRF-' + Date.now();

                // 🌟🌟🌟 CAMBIO CLAVE AQUÍ: Usar FormData para enviar el archivo y los datos 🌟🌟🌟
                const formData = new FormData();
                formData.append('pedido_id', pedidoId);
                formData.append('productos_json', JSON.stringify(carrito)); // Enviar productos como JSON string
                formData.append('total', totalConEnvioUsd.toFixed(2)); // Enviar total como string
                formData.append('metodo_pago', 'transferencia');
                formData.append('metodo_envio', metodoEnvio);
                formData.append('comprobante', archivo); // Añadir el archivo

                // Opcional: Si tienes un campo de dirección de entrega en el formulario principal
                const direccionEntregaInput = document.getElementById('direccion_entrega'); // Asegúrate de que exista este ID
                if (direccionEntregaInput && metodoEnvio === 'estandar') {
                    formData.append('direccion_entrega', direccionEntregaInput.value);
                }
                // 🌟🌟🌟 FIN CAMBIO CLAVE 🌟🌟🌟

                fetch('/guardar_pedido/', {
                    method: 'POST',
                    headers: {

                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: formData, // Enviar el objeto FormData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok') {
                        mensaje.innerHTML = '<span style="color:green;">¡Comprobante enviado! Nos comunicaremos contigo tras verificar el pago.</span>';
                        localStorage.removeItem('carrito');
                        setTimeout(() => {
                            document.getElementById('modal-transferencia').remove();
                            mostrarModalConfirmacionTransferencia(pedidoId, totalConEnvioUsd, carrito, metodoEnvio, costoEnvio);
                        }, 1500);
                    } else {
                        mensaje.innerHTML = '<span style="color:red;">Error al guardar el pedido: ' + (data.errores ? data.errores.join(', ') : 'Error desconocido') + '</span>';
                    }
                })
                .catch(error => {
                    console.error('Error de red al guardar el pedido:', error);
                    mensaje.innerHTML = '<span style="color:red;">Error de red al guardar el pedido.</span>';
                });
            });
        });
    }

    // Modal de confirmación para transferencia (similar a PayPal)
    function mostrarModalConfirmacionTransferencia(pedidoId, totalUsd, productosComprados, metodoEnvio, costoEnvio) {
        const cantidadArticulos = productosComprados.reduce((acc, item) => acc + item.cantidad, 0);
        const subtotal = Math.max(0, totalUsd - costoEnvio);
        const metodoEnvioTexto = {
            'estandar': 'Estándar (5 USD)',
            'retiro': 'Retiro en tienda (Gratis)'
        }[metodoEnvio] || metodoEnvio;

        const modalHTML = `
            <div class="order-success-modal" style="position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.8);display:flex;justify-content:center;align-items:center;z-index:2000;font-family:Arial,sans-serif;">
                <div class="order-success-content" style="background:white;padding:30px;border-radius:10px;max-width:600px;width:90%;max-height:90vh;overflow-y:auto;box-shadow:0 5px 15px rgba(0,0,0,0.3);">
                    <div class="order-success-header" style="text-align:center;margin-bottom:20px;padding-bottom:15px;border-bottom:1px solid #eee;">
                        <div style="font-size:50px;color:#28a745;margin-bottom:15px;">✓</div>
                        <h2 style="color:#28a745;margin-bottom:10px;">¡Comprobante Enviado!</h2>
                        <p>Tu pedido #${pedidoId.substr(0, 12)} ha sido recibido y está en proceso de verificación.</p>
                    </div>
                    <div style="margin-bottom:20px;">
                        <h3 style="color:#333;margin-bottom:15px;font-size:18px;border-bottom:1px solid #eee;padding-bottom:5px;">Información del pago</h3>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">ID de pedido:</span>
                            <span style="color:#333;">${pedidoId}</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Estado:</span>
                            <span style="color:#333;">En proceso</span>
                        </div>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Fecha:</span>
                            <span style="color:#333;">${new Date().toLocaleString()}</span>
                        </div>
                    </div>
                    <div style="margin-bottom:20px;">
                        <h3 style="color:#333;margin-bottom:15px;font-size:18px;border-bottom:1px solid #eee;padding-bottom:5px;">Información de envío</h3>
                        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
                            <span style="font-weight:bold;color:#555;">Método:</span>
                            <span style="color:#333;">${metodoEnvioTexto}</span>
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
});