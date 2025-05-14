async function eliminarProducto() {
    const idEliminar = document.getElementById('id_eliminar').value;

    if (!idEliminar) {
        document.getElementById('mensaje-eliminar').textContent = 'Por favor, ingresa el ID del producto a eliminar.';
        return;
    }

    const apiUrl = `http://127.0.0.1:8001/producto/${idEliminar}`; // URL de tu API FastAPI para eliminar
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

    try {
        const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': csrfToken,
            },
        });

        const result = await response.json();
        document.getElementById('mensaje-eliminar').textContent = result.mensaje || result.detail || response.statusText;

        if (response.ok) {
            document.getElementById('eliminarProductoForm').reset();
            // Aquí podrías recargar la lista de productos para que se refleje la eliminación
            // Por ejemplo: cargarProductos(); (si tienes una función para listar)
        } else {
            console.error('Error al eliminar producto:', result.detail || response.statusText);
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        document.getElementById('mensaje-eliminar').textContent = 'Error de conexión con la API al intentar eliminar.';
    }
}