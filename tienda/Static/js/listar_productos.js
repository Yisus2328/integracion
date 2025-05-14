async function cargarProductos() {
    const apiUrl = 'http://127.0.0.1:8001/producto/'; // URL de tu API FastAPI para listar todos los productos

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productos = await response.json();
        mostrarProductos(productos);

    } catch (error) {
        console.error('Error al cargar productos:', error);
        document.getElementById('productos-tbody').innerHTML = '<tr><td colspan="3">Error al cargar los productos.</td></tr>';
    }
}

function mostrarProductos(productos) {
    const tbody = document.getElementById('productos-tbody');
    tbody.innerHTML = ''; // Limpiar la tabla antes de mostrar los productos

    productos.forEach(producto => {
        const row = tbody.insertRow();

        const idCell = row.insertCell();
        idCell.textContent = producto.id_producto;

        const nombreCell = row.insertCell();
        nombreCell.textContent = producto.nombre;

        const accionesCell = row.insertCell();
        // Aquí puedes añadir botones para "Eliminar" o "Editar" asociados a cada producto
        const eliminarBoton = document.createElement('button');
        eliminarBoton.textContent = 'Eliminar';
        eliminarBoton.onclick = () => eliminarProducto(producto.id_producto); // Asumiendo que tienes una función eliminarProducto

        accionesCell.appendChild(eliminarBoton);
    });
}

// Llama a la función para cargar los productos cuando la página se cargue
window.onload = cargarProductos;

// (Opcional) Si tienes la función eliminarProducto en otro archivo, asegúrate de que esté cargado en tu HTML
// <script src="{% static 'js/eliminar_producto.js' %}"></script>