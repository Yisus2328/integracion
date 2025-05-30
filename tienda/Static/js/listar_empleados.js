document.addEventListener('DOMContentLoaded', function() {
    const empleadosTableBody = document.querySelector('#empleadosTable tbody');
    const empleadosTable = document.getElementById('empleadosTable');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');

    // URL de tu endpoint de Django para listar todos los empleados
    // Asegúrate de que esta URL sea correcta y accesible
    const API_URL = '/api/empleados_todos_manual/'; 

    fetch(API_URL)
        .then(response => {
            // Verifica si la respuesta es exitosa (código 2xx)
            if (!response.ok) {
                // Si la respuesta no es OK (ej. 404, 500), parsea el JSON de error si está disponible
                // o lanza un error genérico.
                return response.json().then(errorData => {
                    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
                });
            }
            // Si es exitosa, parsea el JSON
            return response.json();
        })
        .then(data => {
            // Oculta el mensaje de carga y muestra la tabla
            loadingMessage.style.display = 'none';
            empleadosTable.style.display = 'table';

            // Verifica si la data tiene la estructura esperada (ej. { success: true, empleados: [...] })
            if (data.success && Array.isArray(data.empleados)) {
                if (data.empleados.length === 0) {
                    empleadosTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No hay empleados registrados.</td></tr>';
                } else {
                    data.empleados.forEach(empleado => {
                        const row = empleadosTableBody.insertRow();
                        row.insertCell().textContent = empleado.id;
                        row.insertCell().textContent = empleado.rut;
                        row.insertCell().textContent = empleado.nombre;
                        row.insertCell().textContent = empleado.email;
                        row.insertCell().textContent = empleado.id_sucursal;
                        row.insertCell().textContent = empleado.nombre_sucursal || 'N/A'; // Manejar si nombre_sucursal no existe
                        row.insertCell().textContent = empleado.tipo;
                    });
                }
            } else {
                // Si la estructura no es la esperada, muestra un mensaje de error
                errorMessage.textContent = data.message || 'La estructura de los datos recibidos no es la esperada.';
                errorMessage.style.display = 'block';
                empleadosTable.style.display = 'none'; // Oculta la tabla si hay un error de datos
            }
        })
        .catch(error => {
            // Manejo de errores de red o de la API
            console.error('Error al obtener empleados:', error);
            loadingMessage.style.display = 'none';
            errorMessage.textContent = error.message || 'Hubo un problema al conectar con el servidor. Intenta de nuevo más tarde.';
            errorMessage.style.display = 'block';
            empleadosTable.style.display = 'none'; // Asegúrate de que la tabla esté oculta en caso de error
        });
});