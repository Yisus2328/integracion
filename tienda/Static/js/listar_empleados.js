document.addEventListener('DOMContentLoaded', function() {
    const empleadosTableBody = document.querySelector('#empleadosTable tbody');
    const empleadosTable = document.getElementById('empleadosTable');
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');

    // Elementos del modal de edición
    const editEmployeeModal = document.getElementById('editEmployeeModal');
    const closeButton = document.querySelector('.close-button');
    const editEmployeeForm = document.getElementById('editEmployeeForm');
    const editEmployeeId = document.getElementById('editEmployeeId');
    const editEmployeeType = document.getElementById('editEmployeeType');
    const currentEmployeeDisplay = document.getElementById('currentEmployeeDisplay');
    const editNombre = document.getElementById('editNombre');
    const editEmail = document.getElementById('editEmail');
    const editIdSucursal = document.getElementById('editIdSucursal');
    const modalMessage = document.getElementById('modalMessage');

    // URLs de la API
    const API_LIST_EMPLOYEES_URL = '/api/empleados_todos_manual/';
    const API_UPDATE_EMPLOYEE_BASE_URL = '/api/empleados/'; // Base para /empleados/<tipo>/<id>/actualizar/
    const API_DELETE_EMPLOYEE_BASE_URL = '/api/empleados/'; // Base para /empleados/<tipo>/<id>/eliminar/


    // --- Función para cargar y mostrar los empleados (Actualizada para incluir botón Eliminar) ---
    function loadEmployees() {
        loadingMessage.style.display = 'block';
        empleadosTable.style.display = 'none';
        errorMessage.style.display = 'none';
        empleadosTableBody.innerHTML = ''; // Limpiar tabla antes de cargar

        fetch(API_LIST_EMPLOYEES_URL)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(errorData => {
                        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
                    });
                }
                return response.json();
            })
            .then(data => {
                loadingMessage.style.display = 'none';
                empleadosTable.style.display = 'table';

                if (data.success && Array.isArray(data.empleados)) {
                    if (data.empleados.length === 0) {
                        empleadosTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No hay empleados registrados.</td></tr>';
                    } else {
                        data.empleados.forEach(empleado => {
                            const row = empleadosTableBody.insertRow();
                            row.insertCell().textContent = empleado.id;
                            row.insertCell().textContent = empleado.rut;
                            row.insertCell().textContent = empleado.nombre;
                            row.insertCell().textContent = empleado.email;
                            row.insertCell().textContent = empleado.id_sucursal;
                            row.insertCell().textContent = empleado.nombre_sucursal || 'N/A';
                            row.insertCell().textContent = empleado.tipo;

                            // Celda de acciones con botones de editar y eliminar
                            const actionsCell = row.insertCell();
                            actionsCell.className = 'action-buttons';

                            // Botón Editar
                            const editButton = document.createElement('button');
                            editButton.innerHTML = '<i class="fas fa-edit"></i> Editar';
                            editButton.onclick = () => openEditModal(empleado);
                            actionsCell.appendChild(editButton);

                            // Botón Eliminar
                            const deleteButton = document.createElement('button');
                            deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
                            deleteButton.className = 'delete-button'; // Clase para estilo
                            deleteButton.onclick = () => confirmDelete(empleado); // Llama a la función de confirmación
                            actionsCell.appendChild(deleteButton);
                        });
                    }
                } else {
                    errorMessage.textContent = data.message || 'La estructura de los datos recibidos no es la esperada.';
                    errorMessage.style.display = 'block';
                    empleadosTable.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error al obtener empleados:', error);
                loadingMessage.style.display = 'none';
                errorMessage.textContent = error.message || 'Hubo un problema al conectar con el servidor. Intenta de nuevo más tarde.';
                errorMessage.style.display = 'block';
                empleadosTable.style.display = 'none';
            });
    }

    // --- Funciones para el Modal de Edición (sin cambios) ---
    function openEditModal(empleado) {
        editEmployeeId.value = empleado.id;
        editEmployeeType.value = empleado.tipo;
        currentEmployeeDisplay.value = `${empleado.rut} - ${empleado.nombre}`;
        editNombre.value = empleado.nombre;
        editEmail.value = empleado.email;
        editIdSucursal.value = empleado.id_sucursal;

        modalMessage.textContent = '';
        modalMessage.className = 'modal-message';
        editEmployeeModal.style.display = 'flex';
    }

    closeButton.onclick = function() {
        editEmployeeModal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == editEmployeeModal) {
            editEmployeeModal.style.display = 'none';
        }
    }

    editEmployeeForm.onsubmit = function(event) {
        event.preventDefault();

        const id = editEmployeeId.value;
        const type = editEmployeeType.value;
        const newNombre = editNombre.value;
        const newEmail = editEmail.value;
        const newIdSucursal = editIdSucursal.value;

        const updateURL = `${API_UPDATE_EMPLOYEE_BASE_URL}${type}/${id}/actualizar/`;

        modalMessage.textContent = 'Actualizando...';
        modalMessage.className = 'modal-message';

        fetch(updateURL, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nombre: newNombre,
                email: newEmail,
                id_sucursal: newIdSucursal
            })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(errorData => {
                    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                modalMessage.textContent = data.message;
                modalMessage.className = 'modal-message success';
                loadEmployees();
                setTimeout(() => {
                    editEmployeeModal.style.display = 'none';
                }, 1500);
            } else {
                modalMessage.textContent = data.message || 'Fallo la actualización.';
                modalMessage.className = 'modal-message error';
            }
        })
        .catch(error => {
            console.error('Error al actualizar empleado:', error);
            modalMessage.textContent = error.message || 'Error de red o servidor.';
            modalMessage.className = 'modal-message error';
        });
    };

    // --- Nueva Función para Confirmar y Eliminar Empleado ---
    function confirmDelete(empleado) {
        // Pedir confirmación al usuario
        const confirmation = confirm(`¿Estás seguro de que quieres eliminar al ${empleado.tipo} "${empleado.nombre}" (ID: ${empleado.id})? Esta acción es irreversible.`);

        if (confirmation) {
            // CAMBIO AQUÍ: Usar empleado.tipo en lugar de empleado.type
            deleteEmployee(empleado.tipo, empleado.id, empleado.nombre);
        }
    }

    async function deleteEmployee(type, id, name) { // Aquí 'type' ahora recibirá el valor correcto
        const deleteURL = `${API_DELETE_EMPLOYEE_BASE_URL}${type}/${id}/eliminar/`;

        try {
            const response = await fetch(deleteURL, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Si usas CSRF en Django para DELETE (recomendado), necesitarías obtener el token y añadirlo aquí:
                    // 'X-CSRFToken': getCookie('csrftoken'),
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                alert(data.message); // Usar alert simple para confirmación de eliminación
                loadEmployees(); // Recargar la tabla para reflejar la eliminación
            } else {
                alert(data.message || 'Fallo la eliminación.');
            }
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            alert(`Error al eliminar: ${error.message || 'Hubo un problema de red o servidor.'}`);
        }
    }

    loadEmployees();
});
eliminar