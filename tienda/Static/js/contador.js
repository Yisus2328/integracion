// tu_app/static/js/contador.js

document.addEventListener('DOMContentLoaded', function() {

    function getCsrfTokenFromDom() {
        const csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
        if (csrfTokenElement) {
            return csrfTokenElement.value;
        }

        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.startsWith('csrftoken' + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring('csrftoken'.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    const csrfToken = getCsrfTokenFromDom();

    if (!csrfToken) {
        console.error("Error: CSRF token no encontrado. Asegúrate de incluir '{% csrf_token %}' en tu template o de que el cookie 'csrftoken' esté presente.");
        alert("Error de seguridad: CSRF token no encontrado. Recarga la página.");
        return;
    }

    // --- Selectores de botones ---
    const botonesMarcarPagado = document.querySelectorAll('.btn-pagado'); // Usamos .btn-pagado como en mi ejemplo de HTML
    const botonesMarcarRechazado = document.querySelectorAll('.btn-rechazado'); // Nuevo selector para el botón de rechazar

    // --- Event Listeners para Marcar como Pagado ---
    botonesMarcarPagado.forEach(button => {
        button.addEventListener('click', function() {
            const pedidoId = this.dataset.pedidoId;
            if (confirm(`¿Estás seguro de que quieres marcar el pedido ${pedidoId} como Pagado?`)) {
                enviarEstadoPedido(pedidoId, 'pagado');
            }
        });
    });

    // --- Event Listeners para Marcar como Rechazado (NUEVO) ---
    botonesMarcarRechazado.forEach(button => {
        button.addEventListener('click', function() {
            const pedidoId = this.dataset.pedidoId;
            if (confirm(`¿Estás seguro de que quieres marcar el pedido ${pedidoId} como RECHAZADO? Esta acción no se puede deshacer.`)) {
                enviarEstadoPedido(pedidoId, 'rechazado');
            }
        });
    });

    // --- Función Unificada para Enviar el Estado del Pedido ---
    async function enviarEstadoPedido(pedidoId, accion) {
        let url;
        let bodyContent;
        let contentType;

        if (accion === 'pagado') {
            // Para 'pagado', el pedido_id va en la URL, el cuerpo puede ser vacío con Content-Type: application/json
            url = `/api/pedidos/${pedidoId}/marcar-pagado/`;
            bodyContent = JSON.stringify({}); // Tu backend espera JSON aunque esté vacío
            contentType = 'application/json';
        } else if (accion === 'rechazado') {
            // Para 'rechazado', el pedido_id va en el cuerpo POST como formulario estándar
            url = '/api/pedidos/marcar-rechazado/';
            bodyContent = `pedido_id=${encodeURIComponent(pedidoId)}`; // Codifica para URL-encoded
            contentType = 'application/x-www-form-urlencoded';
        } else {
            console.error('Acción desconocida:', accion);
            return;
        }

        const pedidoCard = document.getElementById(`pedido-${pedidoId}`);
        const messageElement = pedidoCard ? pedidoCard.querySelector('.status-message') : null; // Asumiendo que el mensaje está dentro de la tarjeta

        if (messageElement) {
            messageElement.style.display = 'none';
            messageElement.className = 'status-message'; // Resetear clases
            messageElement.textContent = '';
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': contentType,
                    'X-CSRFToken': csrfToken
                },
                body: bodyContent
            });

            // Verificar si la respuesta fue OK (2xx)
            if (!response.ok) {
                // Si la respuesta no es OK, intenta parsear el error JSON
                const errorData = await response.json().catch(() => ({ message: 'Error desconocido del servidor.' }));
                throw errorData; // Lanza el objeto de error para el bloque catch
            }

            const data = await response.json(); // La respuesta exitosa también es JSON

            if (data.status === 'success' || data.status === 'ok') { // Tu backend devuelve 'success' para pagado y 'ok' para rechazado
                if (messageElement) {
                    messageElement.textContent = data.message;
                    messageElement.classList.add('success');
                    messageElement.style.display = 'block';
                }
                
                if (pedidoCard) {
                    pedidoCard.remove(); 
                    if (document.querySelectorAll('.pedido-card').length === 0) {
                        const container = document.querySelector('.container'); 
                        if (container) {
                            container.innerHTML += '<p class="no-pedidos">No hay pedidos en revisión en este momento.</p>';
                        }
                    }
                }
            } else { 
                if (messageElement) {
                    messageElement.textContent = 'Error: ' + data.message;
                    messageElement.classList.add('error');
                    messageElement.style.display = 'block';
                }
                console.error('Error del servidor (status en JSON):', data.message);
            }
        } catch (error) {
            let errorMessage = 'Ocurrió un error de red o del servidor.';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.errores && error.errores.length > 0) { 
                errorMessage = error.errores.join('\n');
            }
            if (messageElement) {
                messageElement.textContent = 'Error: ' + errorMessage;
                messageElement.classList.add('error');
                messageElement.style.display = 'block';
            }
            console.error('Error al enviar la solicitud:', error);
        }
    }
});