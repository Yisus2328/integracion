document.addEventListener('DOMContentLoaded', function() {

    const pedidosProcesadosTableBody = document.getElementById('pedidosProcesadosTableBody');
    const noPedidosProcesadosMessage = document.getElementById('noPedidosProcesadosMessage');
    const loadingSpinnerProcesados = document.getElementById('loadingSpinnerProcesados');


    const pedidosEnviadosTableBody = document.getElementById('pedidosEnviadosTableBody');
    const noPedidosEnviadosMessage = document.getElementById('noPedidosEnviadosMessage');
    const loadingSpinnerEnviados = document.getElementById('loadingSpinnerEnviados');

    const mensajeDiv = document.getElementById('mensaje'); 

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

    // --- Funciones para Pedidos PROCESADOS ---
    async function fetchPedidosProcesados() {
        pedidosProcesadosTableBody.innerHTML = '<tr><td colspan="6">Cargando pedidos procesados...</td></tr>';
        noPedidosProcesadosMessage.style.display = 'none';
        loadingSpinnerProcesados.style.display = 'inline-block';

        try {
            const response = await fetch(`${API_URL_BASE}/pedidos/procesados`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener los pedidos procesados.');
            }
            const data = await response.json();
            
            loadingSpinnerProcesados.style.display = 'none';

            if (data.success && data.pedidos.length > 0) {
                renderPedidosProcesados(data.pedidos);
                pedidosProcesadosTableBody.classList.remove('empty-state');
            } else {
                pedidosProcesadosTableBody.innerHTML = '';
                noPedidosProcesadosMessage.style.display = 'block';
                pedidosProcesadosTableBody.classList.add('empty-state');
            }
        } catch (error) {
            console.error('Error al cargar pedidos procesados:', error);
            pedidosProcesadosTableBody.innerHTML = `<tr><td colspan="6" style="color:red;">Error al cargar pedidos: ${error.message}</td></tr>`;
            loadingSpinnerProcesados.style.display = 'none';
            showMessage(`Error al cargar pedidos procesados: ${error.message}`, 'error');
        }
    }

    function renderPedidosProcesados(pedidos) {
        pedidosProcesadosTableBody.innerHTML = '';
        pedidos.forEach(pedido => {
            const totalUsd = parseFloat(pedido.total_usd_detalle); 
            const formattedTotalUsd = isNaN(totalUsd) ? '0.00' : totalUsd.toFixed(2);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.id_pedido}</td>
                <td>${pedido.rut}</td>
                <td>${new Date(pedido.fecha).toLocaleDateString()}</td>
                <td><span class="estado-${pedido.estado.toLowerCase()}">${pedido.estado}</span></td>
                <td>
                    ${pedido.estado.toLowerCase() === 'procesado' ?
                        `<button class="btn-enviar" data-id="${pedido.id_pedido}">Marcar como Enviado</button>` :
                        `<span>${pedido.estado.toLowerCase() === 'enviado' ? 'Ya Enviado' : ''}</span>`
                    }
                </td>
            `;
            pedidosProcesadosTableBody.appendChild(row);
        });

        document.querySelectorAll('#pedidosProcesadosTableBody .btn-enviar').forEach(button => {
            button.addEventListener('click', handleEnviarPedido);
        });
    }

    async function handleEnviarPedido(event) {
        const button = event.target;
        const pedidoId = button.dataset.id;
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Enviando...';

        try {
            const response = await fetch(`${API_URL_BASE}/pedidos/${pedidoId}/enviar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ estado: 'enviado' })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al enviar el pedido.');
            }

            const data = await response.json();
            if (data.success) {
                await showMessage(data.message || `Pedido ${pedidoId} marcado como Enviado.`, 'success');
                fetchPedidosProcesados(); 
                fetchPedidosEnviados(); 
            } else {
                showMessage(data.message || `No se pudo enviar el pedido ${pedidoId}.`, 'error');
            }
        } catch (error) {
            console.error('Error al enviar pedido:', error);
            showMessage(`Error: ${error.message}`, 'error');
        } finally {
            button.disabled = false;
            button.textContent = originalText;
        }
    }

    // --- Funciones para Pedidos ENVIADOS ---
    async function fetchPedidosEnviados() {
        pedidosEnviadosTableBody.innerHTML = '<tr><td colspan="5">Cargando pedidos enviados...</td></tr>';
        noPedidosEnviadosMessage.style.display = 'none';
        loadingSpinnerEnviados.style.display = 'inline-block';

        try {
            const response = await fetch(`${API_URL_BASE}/pedidos/enviados`); 
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error al obtener los pedidos enviados.');
            }
            const data = await response.json();
            
            loadingSpinnerEnviados.style.display = 'none';

            if (data.success && data.pedidos.length > 0) {
                renderPedidosEnviados(data.pedidos);
                pedidosEnviadosTableBody.classList.remove('empty-state');
            } else {
                pedidosEnviadosTableBody.innerHTML = '';
                noPedidosEnviadosMessage.style.display = 'block';
                pedidosEnviadosTableBody.classList.add('empty-state');
            }
        } catch (error) {
            console.error('Error al cargar pedidos enviados:', error);
            pedidosEnviadosTableBody.innerHTML = `<tr><td colspan="5" style="color:red;">Error al cargar pedidos: ${error.message}</td></tr>`;
            loadingSpinnerEnviados.style.display = 'none';
            showMessage(`Error al cargar pedidos enviados: ${error.message}`, 'error');
        }
    }

    function renderPedidosEnviados(pedidos) {
        pedidosEnviadosTableBody.innerHTML = '';
        pedidos.forEach(pedido => {
            const totalUsd = parseFloat(pedido.total_usd_detalle); 
            const formattedTotalUsd = isNaN(totalUsd) ? '0.00' : totalUsd.toFixed(2);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${pedido.id_pedido}</td>
                <td>${pedido.rut}</td>
                <td>${new Date(pedido.fecha).toLocaleDateString()}</td>
                <td><span class="estado-${pedido.estado.toLowerCase()}">${pedido.estado}</span></td>
            `;
            pedidosEnviadosTableBody.appendChild(row);
        });
    }

    // Cargar AMBOS tipos de pedidos al iniciar la página
    fetchPedidosProcesados();
    fetchPedidosEnviados();
});