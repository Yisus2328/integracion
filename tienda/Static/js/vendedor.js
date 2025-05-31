document.addEventListener('DOMContentLoaded', function() {
    const botonesMarcarEnviado = document.querySelectorAll('.btn-marcar-enviado');

    const csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
    const csrfToken = csrfTokenElement ? csrfTokenElement.value : '';

    if (!csrfToken) {
        console.error("Error: CSRF token no encontrado. Asegúrate de incluir '{% csrf_token %}' en tu template.");
        alert("Error de seguridad: CSRF token no encontrado. Recarga la página.");
        return;
    }

    botonesMarcarEnviado.forEach(button => {
        button.addEventListener('click', function() {
            const pedidoId = this.dataset.pedidoId;
            if (confirm(`¿Estás seguro de que quieres marcar el pedido ${pedidoId} como Enviado?`)) {
                // Deshabilitar el botón y cambiar texto
                const originalText = button.textContent;
                button.disabled = true;
                button.textContent = 'Enviando...';

                fetch(`/api/pedidos/${pedidoId}/marcar-enviado/`, { // URL a tu vista Django
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({}) // Cuerpo vacío es suficiente para POST
                })
                .then(response => {
                    // Manejo de errores de la respuesta HTTP
                    if (!response.ok) {
                        return response.json().then(err => { throw err; });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        alert(data.message);
                        // Eliminar el pedido de la vista
                        const pedidoCard = document.getElementById(`pedido-${pedidoId}`);
                        if (pedidoCard) {
                            pedidoCard.remove();
                            // Si no quedan pedidos, mostrar mensaje de "no hay pedidos"
                            if (document.querySelectorAll('.pedido-card').length === 0) {
                                const pedidosContainer = document.querySelector('.pedidos-container');
                                if (pedidosContainer) {
                                    pedidosContainer.innerHTML = '<div class="no-pedidos"><p>No hay pedidos en estado "Preparado" actualmente.</p></div>';
                                }
                            }
                        }
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error al enviar la solicitud:', error);
                    let errorMessage = error.message || 'Ocurrió un error inesperado.';
                    // Si el error viene de un JsonResponse con 'errores' (como en Django)
                    if (error.errores && Array.isArray(error.errores) && error.errores.length > 0) {
                        errorMessage = error.errores.join('\n');
                    }
                    alert('Error: ' + errorMessage);
                })
                .finally(() => {
                    // Volver a habilitar el botón y restaurar el texto original
                    button.disabled = false;
                    button.textContent = originalText;
                });
            }
        });
    });
});