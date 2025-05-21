function iniciarSesionTrabajador() {
    const idTrabajador = document.getElementById('id_trabajador').value.trim();
    const rutTrabajador = document.getElementById('rut_trabajador').value.trim();
    const mensajeDiv = document.getElementById('mensaje');

    mensajeDiv.textContent = '';

    if (!idTrabajador || !rutTrabajador) {
        mensajeDiv.textContent = 'Por favor, ingresa tu ID y RUT.';
        mensajeDiv.style.color = 'red';
        return;
    }

    const idPrefix = idTrabajador.substring(0, 2).toUpperCase(); 

    if (idPrefix !== 'BO' && idPrefix !== 'CO' && idPrefix !== 'VE') {
        mensajeDiv.textContent = 'El ID de trabajador debe comenzar con BO (Bodeguero), CO (Contador) o VE (Vendedor).';
        mensajeDiv.style.color = 'red';
        return;
    }

    const data = {
        id_trabajador: idTrabajador,
        rut_trabajador: rutTrabajador
    };

    const apiUrl = 'http://localhost:3301/login/trabajadores';

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
                throw new Error(errorData.message || 'Error desconocido en el servidor');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            mensajeDiv.textContent = data.message || 'Inicio de sesión exitoso.';
            mensajeDiv.style.color = 'green';

            // --- ¡ESTE ES EL ÚNICO BLOQUE DE REDIRECCIÓN NECESARIO! ---
            setTimeout(() => {
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    window.location.href = '/index/';
                }
            }, 3000); // 3000 milisegundos = 3 segundos
        } else {
            mensajeDiv.textContent = data.message || 'Error: ID de trabajador o RUT incorrecto.';
            mensajeDiv.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error en la solicitud Fetch:', error);
        mensajeDiv.textContent = 'Error al intentar conectar con el servidor: ' + error.message;
        mensajeDiv.style.color = 'red';
    });
}