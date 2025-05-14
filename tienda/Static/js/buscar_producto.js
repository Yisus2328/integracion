async function buscarProductoPorId() {
    const idBuscar = document.getElementById('id_buscar').value;
    const resultadoDiv = document.getElementById('resultado-busqueda');
    resultadoDiv.innerHTML = ''; // Limpiar resultados anteriores

    if (!idBuscar) {
        resultadoDiv.textContent = 'Por favor, ingresa el ID del producto a buscar.';
        return;
    }

    const apiUrl = `http://127.0.0.1:8001/producto/${idBuscar}`; // URL de tu API FastAPI para buscar por ID

    try {
        const response = await fetch(apiUrl);

        if (response.ok) {
            const producto = await response.json();
            let detalles = `<h3>Producto Encontrado:</h3>`;
            for (const key in producto) {
                if (producto.hasOwnProperty(key)) {
                    detalles += `<p><strong>${key}:</strong> ${producto[key]}</p>`;
                }
            }
            resultadoDiv.innerHTML = detalles;
        } else if (response.status === 404) {
            resultadoDiv.textContent = `No se encontró ningún producto con el ID: ${idBuscar}`;
        } else {
            const error = await response.json();
            resultadoDiv.textContent = `Error al buscar el producto: ${error.detail || response.statusText}`;
            console.error('Error al buscar producto:', error);
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        resultadoDiv.textContent = 'Error de conexión con la API al intentar buscar.';
    }
}