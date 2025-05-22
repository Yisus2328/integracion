function agregarEmpleado() {
    
    const idEmpleado = document.getElementById('id_empleado').value.trim(); 
    const rut = document.getElementById('rut_empleado').value.trim();
    const nombre = document.getElementById('nombre_empleado').value.trim();
    const email = document.getElementById('email_empleado').value.trim();
    const contraseña = document.getElementById('contraseña_empleado').value.trim();
    const idSucursal = document.getElementById('id_sucursal_empleado').value.trim();
    const mensajeDiv = document.getElementById('mensajeEmpleado');

    mensajeDiv.textContent = ''; 
    mensajeDiv.style.color = ''; 

    
    if (!idEmpleado || !rut || !nombre || !email || !contraseña || !idSucursal) {
        mensajeDiv.textContent = 'Todos los campos obligatorios (incluyendo ID Empleado) deben ser completados.';
        mensajeDiv.style.color = 'red';
        return;
    }

    
    const idEmpleadoRegex = /^(CO|BO|VE)\d{3}$/; 
    if (!idEmpleadoRegex.test(idEmpleado.toUpperCase())) { 
        mensajeDiv.textContent = 'Formato de ID Empleado inválido. Ej: CO001, BO001, VE001';
        mensajeDiv.style.color = 'red';
        return;
    }

    
    const rutRegex = /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/;
    if (!rutRegex.test(rut)) {
        mensajeDiv.textContent = 'Formato de RUT inválido. Ej: 12.345.678-9';
        mensajeDiv.style.color = 'red';
        return;
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mensajeDiv.textContent = 'Por favor, ingresa un formato de email válido.';
        mensajeDiv.style.color = 'red';
        return;
    }

    
    const sucursalRegex = /^[A-Z]{3}\d{3}$/; 
    if (!sucursalRegex.test(idSucursal.toUpperCase())) { 
        mensajeDiv.textContent = 'Formato de ID Sucursal inválido. Ej: SUC001';
        mensajeDiv.style.color = 'red';
        return;
    }

    
    const data = {
        id: idEmpleado, 
        rut: rut,
        nombre: nombre,
        email: email,
        contraseña: contraseña, 
        id_sucursal: idSucursal
    };

    const apiUrl = 'http://localhost:3301/empleados/agregar';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || `Error del servidor: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            mensajeDiv.textContent = data.message || 'Empleado agregado exitosamente.';
            mensajeDiv.style.color = 'green';
            
            document.getElementById('agregarEmpleadoForm').reset();
            
        } else {
            mensajeDiv.textContent = data.message || 'Error al agregar empleado.';
            mensajeDiv.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error en la solicitud Fetch:', error);
        mensajeDiv.textContent = 'Error al conectar con el servidor: ' + error.message;
        mensajeDiv.style.color = 'red';
    });
}