async function enviarProducto() {
    const formData = new FormData(document.getElementById('agregarProductoForm'));
    const productoData = {};
    formData.forEach((value, key) => {
        productoData[key] = value;
    });

    try {
        const apiUrl = 'http://127.0.0.1:8001/producto/agregar_prod'; // <---- URL de tu API FastAPI

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            }, // <-- Coma eliminada
            body: JSON.stringify(productoData),
        });

        const result = await response.json();
        document.getElementById('mensaje').textContent = result.mensaje || (response.statusText);

        if (response.ok) {
            document.getElementById('agregarProductoForm').reset(); // Limpiar el formulario en caso de éxito
        } else {
            console.error('Error al agregar producto:', result.detail || response.statusText);
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        document.getElementById('mensaje').textContent = 'Error de conexión con la API';
    }
}