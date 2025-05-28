

document.addEventListener('DOMContentLoaded', function() {
    const botonesMarcarPagado = document.querySelectorAll('.btn-marcar-pagado');


    const csrfTokenElement = document.querySelector('input[name="csrfmiddlewaretoken"]');
    const csrfToken = csrfTokenElement ? csrfTokenElement.value : '';

    if (!csrfToken) {
        console.error("Error: CSRF token no encontrado. Asegúrate de incluir '{% csrf_token %}' en tu template.");
        alert("Error de seguridad: CSRF token no encontrado. Recarga la página.");
        return; 
    }


    botonesMarcarPagado.forEach(button => {
        button.addEventListener('click', function() {
            const pedidoId = this.dataset.pedidoId;
            if (confirm(`¿Estás seguro de que quieres marcar el pedido ${pedidoId} como Pagado?`)) {
                fetch(`/api/pedidos/${pedidoId}/marcar-pagado/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken, 
                        'Content-Type': 'application/json' 
                    },
                    body: JSON.stringify({}) 
                })
                .then(response => {
                    if (!response.ok) { 
                        return response.json().then(err => { throw err; }); 
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === 'success') {
                        alert(data.message);
                        // Eliminar el pedido de la vista o actualizar su estado en el HTML
                        const pedidoCard = document.getElementById(`pedido-${pedidoId}`);
                        if (pedidoCard) {
                            pedidoCard.remove(); // Elimina la tarjeta del pedido
                            // Si no quedan pedidos, muestra el mensaje de "no hay pedidos"
                            if (document.querySelectorAll('.pedido-card').length === 0) {
                                const pedidosContainer = document.querySelector('.pedidos-container');
                                if (pedidosContainer) { // Asegurarse de que el contenedor existe
                                    pedidosContainer.innerHTML = '<div class="no-pedidos"><p>No hay pedidos en estado "En Revisión" actualmente.</p></div>';
                                }
                            }
                        }
                    } else {
                        alert('Error: ' + data.message);
                    }
                })
                .catch(error => {
                    console.error('Error al enviar la solicitud:', error);
                    let errorMessage = 'Ocurrió un error de red o del servidor.';
                    if (error.message) {
                        // Si el error viene del JSON que lanzamos, puede tener un 'message'
                        errorMessage = error.message;
                    } else if (error.errores && error.errores.length > 0) {
                        // Si Django devuelve una lista de errores
                        errorMessage = error.errores.join('\n');
                    }
                    alert('Error: ' + errorMessage);
                });
            }
        });
    });
});