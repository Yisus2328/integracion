document.addEventListener('DOMContentLoaded', function() {
    const pedidosPagadosTableBody = document.getElementById('pedidosPagadosTableBody');
    const pedidosEnPreparacionTableBody = document.getElementById('pedidosEnPreparacionTableBody');
    const pedidosPreparadosTableBody = document.getElementById('pedidosPreparadosTableBody');

    const noPedidosPagadosMessage = document.getElementById('noPedidosPagadosMessage');
    const noPedidosEnPreparacionMessage = document.getElementById('noPedidosEnPreparacionMessage');
    const noPedidosPreparadosMessage = document.getElementById('noPedidosPreparadosMessage');

    const mensajeDiv = document.getElementById('mensaje');
    const loadingSpinner = document.getElementById('loadingSpinner');

    const API_URL_BASE = 'http://localhost:3301'; // URL de tu API de Node.js

    async function showMessage(msg, type) {
        mensajeDiv.textContent = msg;
        mensajeDiv.className = '';
        mensajeDiv.classList.add('message', `mensaje-${type}`);
        mensajeDiv.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 3000));
        mensajeDiv.style.display = 'none';
        mensajeDiv.textContent = '';
    }

    // Función para renderizar una tabla específica
    function renderTable(tableBody, pedidos, noPedidosMessageElement, estado) {
        tableBody.innerHTML = ''; // Limpiar la tabla
        if (pedidos.length === 0) {
            noPedidosMessageElement.style.display = 'block';
        } else {
            noPedidosMessageElement.style.display = 'none';
            pedidos.forEach(pedido => {
                const row = document.createElement('tr');
                row.id = `pedido-${pedido.id_pedido}`;

                let actionButtonHtml = '';
                // Lógica de botones basada en el estado
                switch (estado) {
                    case 'Pagado':
                        actionButtonHtml = `<button class="action-button btn-en-preparacion" data-id="${pedido.id_pedido}" data-next-state="En Preparacion">Poner en Preparación</button>`;
                        break;
                    case 'En Preparacion':
                        actionButtonHtml = `<button class="action-button btn-preparado" data-id="${pedido.id_pedido}" data-next-state="Preparado">Marcar como Preparado</button>`;
                        break;
                    case 'Preparado':
                        actionButtonHtml = `<span>Listo para Despacho</span>`; // No hay más acciones para el bodeguero aquí
                        break;
                }

                row.innerHTML = `
                    <td>${pedido.id_pedido}</td>
                    <td>${pedido.rut}</td>
                    <td>${new Date(pedido.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                    <td><span class="estado-${pedido.estado.toLowerCase().replace(/ /g, '_')}">${pedido.estado}</span></td>
                    <td>${actionButtonHtml}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    }

    // Función principal para cargar todos los pedidos por sus estados
    async function fetchAllPedidosByStates() {
        // Mostrar spinners/mensajes de carga y ocultar mensajes de "no hay pedidos"


        noPedidosPagadosMessage.style.display = 'none';
        noPedidosEnPreparacionMessage.style.display = 'none';
        noPedidosPreparadosMessage.style.display = 'none';
        loadingSpinner.style.display = 'inline-block'; // Asegura que el spinner esté visible

        try {
            // Realizar las tres llamadas a la API en paralelo
            const [responsePagados, responseEnPreparacion, responsePreparados] = await Promise.all([
                fetch(`${API_URL_BASE}/pedidos/pagados`),
                fetch(`${API_URL_BASE}/pedidos/en-preparacion`),
                fetch(`${API_URL_BASE}/pedidos/preparados`)
            ]);

            const dataPagados = await responsePagados.json();
            const dataEnPreparacion = await responseEnPreparacion.json();
            const dataPreparados = await responsePreparados.json();

            loadingSpinner.style.display = 'none'; // Ocultar spinner una vez que todos los datos son recibidos

            // Renderizar cada tabla con sus datos correspondientes
            if (dataPagados.success) {
                renderTable(pedidosPagadosTableBody, dataPagados.pedidos, noPedidosPagadosMessage, 'Pagado');
            } else {
                pedidosPagadosTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar: ${dataPagados.message || 'Desconocido'}</td></tr>`;
                showMessage(`Error al cargar pedidos pagados: ${dataPagados.message}`, 'error');
            }

            if (dataEnPreparacion.success) {
                renderTable(pedidosEnPreparacionTableBody, dataEnPreparacion.pedidos, noPedidosEnPreparacionMessage, 'En Preparacion');
            } else {
                pedidosEnPreparacionTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar: ${dataEnPreparacion.message || 'Desconocido'}</td></tr>`;
                showMessage(`Error al cargar pedidos en preparación: ${dataEnPreparacion.message}`, 'error');
            }

            if (dataPreparados.success) {
                renderTable(pedidosPreparadosTableBody, dataPreparados.pedidos, noPedidosPreparadosMessage, 'Preparado');
            } else {
                pedidosPreparadosTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar: ${dataPreparados.message || 'Desconocido'}</td></tr>`;
                showMessage(`Error al cargar pedidos preparados: ${dataPreparados.message}`, 'error');
            }

            // Re-adjuntar event listeners a todos los botones de acción después de renderizar
            document.querySelectorAll('.action-button').forEach(button => {
                button.removeEventListener('click', handleUpdateEstadoPedido); // Evitar duplicados
                button.addEventListener('click', handleUpdateEstadoPedido);
            });

        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            // Mostrar mensaje de error en todas las tablas si algo falla gravemente
            pedidosPagadosTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar: ${error.message}</td></tr>`;
            pedidosEnPreparacionTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar: ${error.message}</td></tr>`;
            pedidosPreparadosTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar: ${error.message}</td></tr>`;
            loadingSpinner.style.display = 'none'; // Ocultar spinner en caso de error
            showMessage(`Error al cargar pedidos: ${error.message}`, 'error');
        }
    }

    async function handleUpdateEstadoPedido(event) {
        const button = event.target;
        const pedidoId = button.dataset.id;
        const nextState = button.dataset.nextState;
        const originalText = button.textContent;
        const originalClass = button.className;

        button.disabled = true;
        button.textContent = 'Actualizando...';
        button.classList.add('updating');

        try {
            const response = await fetch(`${API_URL_BASE}/pedidos/${pedidoId}/actualizar_estado_bodeguero`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ nuevo_estado: nextState })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al actualizar el estado del pedido.');
            }

            const data = await response.json();
            if (data.success) {
                await showMessage(data.message, 'success');
                // Después de una actualización exitosa, recargar todas las tablas
                fetchAllPedidosByStates();
            } else {
                showMessage(data.message || `No se pudo actualizar el pedido ${pedidoId}.`, 'error');
            }
        } catch (error) {
            console.error('Error al actualizar pedido:', error);
            showMessage(`Error: ${error.message}`, 'error');
        } finally {
            button.disabled = false;
            button.textContent = originalText;
            button.className = originalClass;
            button.classList.remove('updating');
        }
    }

    // Cargar los pedidos al iniciar la página
    fetchAllPedidosByStates();
});