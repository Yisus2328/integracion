// tu_app/static/js/mi_cuenta.js

document.addEventListener('DOMContentLoaded', function() {
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');

    // Función para obtener el token CSRF desde la cookie
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith(name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrfToken = getCookie('csrftoken');

    function showMessage(element, message, type = 'info') {
        element.textContent = message;
        element.className = `message message-${type}`;
        element.style.display = 'block';
    }

    function hideMessage(element) {
        element.style.display = 'none';
    }

    hideMessage(loadingMessage);
    hideMessage(errorMessage);
    hideMessage(noOrdersMessage);

    async function loadClientAndOrderData() {
        showMessage(loadingMessage, 'Cargando tus datos y pedidos...');
        hideMessage(errorMessage);

        try {
            const response = await fetch('/api/get_cliente_data/'); 
            const data = await response.json();

            if (response.ok && data.success) {
                // --- Cargar Datos del Cliente ---
                const cliente = data.cliente;
                document.getElementById('clienteRut').textContent = cliente.rut || 'N/A';
                document.getElementById('clienteNombre').textContent = cliente.nombre || 'N/A';
                document.getElementById('clienteEmail').textContent = cliente.email || 'N/A';
                document.getElementById('clienteTelefono').textContent = cliente.telefono || 'N/A';
                document.getElementById('clienteDireccion').textContent = cliente.direccion || 'N/A';

            
                
                // --- Cargar Pedidos del Cliente ---
                const pedidos = data.pedidos;
                if (pedidos && pedidos.length > 0) {
                    ordersTableBody.innerHTML = ''; // Limpiar cualquier contenido previo
                    pedidos.forEach(pedido => {
                        const row = ordersTableBody.insertRow();
                        row.dataset.pedidoId = pedido.id_pedido; // Para fácil referencia

                        row.insertCell(0).textContent = pedido.id_pedido;
                        row.insertCell(1).textContent = pedido.fecha;
                        row.insertCell(2).textContent = pedido.estado;
                        row.insertCell(3).textContent = pedido.tipo_entrega;
                        row.insertCell(4).textContent = pedido.direccion_entrega;
                        row.insertCell(5).textContent = (pedido.total !== undefined && pedido.total !== null)
    ? `$${Number(pedido.total).toFixed(2)}`
    : 'N/A'; 

                        const accionesCell = row.insertCell(6); // EL ÍNDICE HA CAMBIADO
                        if (pedido.estado === 'Rechazado') {
                            const resubirButton = document.createElement('button');
                            resubirButton.textContent = 'Resubir Comprobante';
                            resubirButton.className = 'btn-resubir';
                            resubirButton.dataset.pedidoId = pedido.id_pedido;
                            accionesCell.appendChild(resubirButton);

                            const form = document.createElement('form');
                            form.id = `form-resubir-${pedido.id_pedido}`;
                            form.className = 'form-resubir';
                            form.style.display = 'none'; // Inicialmente oculto
                            form.enctype = 'multipart/form-data'; // Importante para la subida de archivos

                            form.innerHTML = `
                                <input type="hidden" name="pedido_id" value="${pedido.id_pedido}">
                                <input type="file" name="comprobante_transferencia" accept="image/*" required>
                                <button type="submit" class="btn-subir">Subir</button>
                                <button type="button" class="btn-cancelar">Cancelar</button>
                                <div class="upload-message" id="upload-message-${pedido.id_pedido}"></div>
                            `;
                            accionesCell.appendChild(form);

                            // Añadir event listeners a los nuevos elementos creados
                            resubirButton.addEventListener('click', function() {
                                form.style.display = 'block';
                                resubirButton.style.display = 'none';
                            });

                            form.querySelector('.btn-cancelar').addEventListener('click', function() {
                                form.style.display = 'none';
                                resubirButton.style.display = 'inline-block';
                                form.querySelector('input[type="file"]').value = ''; // Limpiar el input de archivo
                                form.querySelector('.upload-message').textContent = ''; // Limpiar mensaje
                                form.querySelector('.upload-message').className = 'upload-message'; // Resetear clase
                            });

                            form.addEventListener('submit', async function(event) {
                                event.preventDefault();
                                
                                const currentUploadMessage = document.getElementById(`upload-message-${pedido.id_pedido}`);
                                currentUploadMessage.textContent = 'Subiendo...';
                                currentUploadMessage.className = 'upload-message';
                                currentUploadMessage.style.display = 'block';

                                const formData = new FormData(this);

                                try {
                                    // Envía a la URL de la vista mi_cuenta (que maneja el POST)
                                    const response = await fetch('/mi-cuenta/', { 
                                        method: 'POST',
                                        headers: {
                                            'X-CSRFToken': csrfToken,
                                        },
                                        body: formData
                                    });

                                    const data = await response.json();

                                    if (response.ok && data.status === 'ok') {
                                        currentUploadMessage.textContent = data.message;
                                        currentUploadMessage.classList.add('success');
                                        // Actualizar el estado en la tabla directamente
                                        row.cells[2].textContent = 'En Revisión'; // Columna de estado
                                        // Ocultar el formulario y el botón "Resubir"
                                        form.style.display = 'none';
                                        resubirButton.style.display = 'none';
                                    } else {
                                        currentUploadMessage.textContent = 'Error: ' + (data.message || 'Error desconocido.');
                                        currentUploadMessage.classList.add('error');
                                    }
                                } catch (error) {
                                    console.error('Error al subir el comprobante:', error);
                                    currentUploadMessage.textContent = 'Error de conexión o del servidor.';
                                    currentUploadMessage.classList.add('error');
                                }
                            });
                        } else {
                            accionesCell.textContent = '-'; // No hay acciones si no está rechazado
                        }
                    });
                    hideMessage(noOrdersMessage);
                } else {
                    showMessage(noOrdersMessage, 'No tienes pedidos registrados.', 'info');
                    ordersTableBody.innerHTML = '';
                }
                
                hideMessage(loadingMessage);
            } else {
                showMessage(errorMessage, data.message || 'Error desconocido al cargar tus datos.', 'error');
                hideMessage(loadingMessage);
            }
        } catch (error) {
            console.error('Error al cargar datos y pedidos del cliente:', error);
            showMessage(errorMessage, 'Error de conexión al cargar tus datos y pedidos.', 'error');
            hideMessage(loadingMessage);
        }
    }

    loadClientAndOrderData();
});