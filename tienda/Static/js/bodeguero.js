document.addEventListener('DOMContentLoaded', function() {
    const pedidosTableBody = document.getElementById('pedidosTableBody');
    const mensajeDiv = document.getElementById('mensaje');
    const noPedidosMessage = document.getElementById('noPedidosMessage');
    const loadingSpinner = document.getElementById('loadingSpinner');

    const API_URL_BASE = 'http://localhost:3301'; 

    async function showMessage(msg, type) {
        mensajeDiv.textContent = msg;
        mensajeDiv.className = ''; 
        mensajeDiv.classList.add('message', `mensaje-${type}`); 
        mensajeDiv.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 3000)); 
        mensajeDiv.style.display = 'none';
        mensajeDiv.textContent = '';
    }

    async function fetchPedidosPagados() {
        pedidosTableBody.innerHTML = '<tr><td colspan="7">Cargando pedidos...</td></tr>';
        noPedidosMessage.style.display = 'none';
        loadingSpinner.style.display = 'inline-block'; 

        try {
            const response = await fetch(`${API_URL_BASE}/pedidos/pagados`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener los pedidos.');
            }
            const data = await response.json();
            
            loadingSpinner.style.display = 'none'; 

            if (data.success && data.pedidos.length > 0) {
                renderPedidos(data.pedidos);
                pedidosTableBody.classList.remove('empty-state');
            } else {
                pedidosTableBody.innerHTML = ''; 
                noPedidosMessage.style.display = 'block';
                pedidosTableBody.classList.add('empty-state');
            }
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
            pedidosTableBody.innerHTML = `<tr><td colspan="7" style="color:red;">Error al cargar pedidos: ${error.message}</td></tr>`;
            loadingSpinner.style.display = 'none'; 
            showMessage(`Error al cargar pedidos: ${error.message}`, 'error');
        }
    }

    function renderPedidos(pedidos) {
        pedidosTableBody.innerHTML = ''; // Limpiar contenido anterior
        pedidos.forEach(pedido => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.id_pedido}</td>
                <td>${pedido.rut}</td> 
                <td>${new Date(pedido.fecha).toLocaleDateString()}</td>
                <td><span class="estado-${pedido.estado.toLowerCase()}">${pedido.estado}</span></td>
                <td>
                    ${pedido.estado.toLowerCase() === 'pagado' ?
                        `<button class="btn-procesar" data-id="${pedido.id_pedido}">Marcar como Procesado</button>` :
                        `<span>${pedido.estado.toLowerCase() === 'procesado' ? 'Ya Procesado' : ''}</span>`
                    }
                </td>
            `;
            pedidosTableBody.appendChild(row);
        });

        
        document.querySelectorAll('.btn-procesar').forEach(button => {
            button.addEventListener('click', handleProcesarPedido);
        });
    }

    async function handleProcesarPedido(event) {
        const button = event.target;
        const pedidoId = button.dataset.id;
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Procesando...';

        try {
            const response = await fetch(`${API_URL_BASE}/pedidos/${pedidoId}/procesar`, {
                method: 'PUT', 
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: 'procesado' }) 
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al procesar el pedido.');
            }

            const data = await response.json();
            if (data.success) {
                await showMessage(data.message || `Pedido ${pedidoId} marcado como Procesado.`, 'success');
                
                fetchPedidosPagados();
            } else {
                showMessage(data.message || `No se pudo procesar el pedido ${pedidoId}.`, 'error');
            }
        } catch (error) {
            console.error('Error al procesar pedido:', error);
            showMessage(`Error: ${error.message}`, 'error');
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    // Cargar los pedidos al iniciar la página
    fetchPedidosPagados();
});