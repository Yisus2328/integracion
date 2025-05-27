// En tu archivo static/js/mi_cuenta.js

document.addEventListener('DOMContentLoaded', function() {
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const ordersTableBody = document.getElementById('ordersTableBody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');

    function showMessage(element, message, type = 'info') {
        element.textContent = message;
        element.className = `message message-${type}`;
        element.style.display = 'block';
    }

    function hideMessage(element) {
        element.style.display = 'none';
    }

    // Ocultar mensajes al inicio
    hideMessage(loadingMessage);
    hideMessage(errorMessage);
    hideMessage(noOrdersMessage);

    // Función principal para cargar TODOS los datos del cliente y sus pedidos
    async function loadClientAndOrderData() {
        showMessage(loadingMessage, 'Cargando tus datos y pedidos...');
        hideMessage(errorMessage); // Ocultar errores previos al iniciar una nueva carga

        try {
            // Llama al único endpoint de la API
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
                        row.insertCell(0).textContent = pedido.id_pedido;
                        row.insertCell(1).textContent = pedido.fecha;
                        row.insertCell(2).textContent = pedido.estado;
                        row.insertCell(3).textContent = pedido.tipo_entrega;
                        row.insertCell(4).textContent = pedido.direccion_entrega;
                    });
                    hideMessage(noOrdersMessage); // Ocultar el mensaje "No tienes pedidos"
                } else {
                    showMessage(noOrdersMessage, 'No tienes pedidos registrados.', 'info');
                    ordersTableBody.innerHTML = ''; // Asegurarse de que la tabla esté vacía
                }
                
                hideMessage(loadingMessage); // Ocultar el mensaje de carga general
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

    // Llama a la función principal cuando la página esté lista
    loadClientAndOrderData();
});