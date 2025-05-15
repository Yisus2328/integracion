//Funcion para agregar productos
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
        document.getElementById('mensaje-agregar').textContent = result.mensaje || (response.statusText);

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

//Funcion para actualizar productos

async function actualizarProducto() {
    const idActualizar = document.getElementById('id_actualizar').value;

    if (!idActualizar) {
        document.getElementById('mensajeAgregar').textContent = 'Por favor, ingresa el ID del producto a actualizar.';
        return;
    }

    const formData = new FormData(document.getElementById('actualizarProductoForm'));
    const productoData = {};
    formData.forEach((value, key) => {
        // Solo incluimos los campos que tienen un valor
        const originalKey = key.replace('_actualizar', ''); // Removemos el sufijo "_actualizar"
        if (value) {
            productoData[originalKey] = value;
        }
    });

    const apiUrl = `http://127.0.0.1:8001/producto/${idActualizar}`; // URL de tu API FastAPI para actualizar

    try {
        const response = await fetch(apiUrl, {
            method: 'PUT', // Usamos el método PUT para actualizar
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value,
            },
            body: JSON.stringify(productoData),
        });

        const result = await response.json();
        document.getElementById('mensajeAgregar').textContent = result.mensaje || result.detail || response.statusText;

        if (response.ok) {
            document.getElementById('actualizarProductoForm').reset(); // Limpiar el formulario en caso de éxito
        } else {
            console.error('Error al actualizar producto:', result.detail || response.statusText);
        }

    } catch (error) {
        console.error('Error de conexión:', error);
        document.getElementById('mensajeAgregar').textContent = 'Error de conexión con la API al intentar actualizar.';
    }
}

//Funcion para listar y cargar todos los productos

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
    });
}

//Funcion para buscar productos

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

//Funcion para eliminar productos

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


function inicializarProductos() {

    const botonesEliminar = document.querySelectorAll('.boton-eliminar-producto');
    botonesEliminar.forEach(boton => {
    boton.addEventListener('click', function() {
    const id = this.dataset.id;
    eliminarProducto(id);
    });
    });


    if (document.getElementById('productos-tbody')) {
        cargarProductos();
    }
}

window.onload = inicializarProductos;