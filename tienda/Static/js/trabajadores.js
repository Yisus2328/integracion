
function iniciarSesionTrabajador() {
    
    const trabajadorEmail = document.getElementById('trabajador_email').value.trim();
    const trabajadorPassword = document.getElementById('trabajador_password').value.trim();
    const mensajeDiv = document.getElementById('mensaje');

    mensajeDiv.textContent = ''; // Limpiar mensajes anteriores

    // Validación: Solo email y contraseña son requeridos
    if (!trabajadorEmail || !trabajadorPassword) {
        mensajeDiv.textContent = 'Por favor, ingresa tu email y contraseña.';
        mensajeDiv.style.color = 'red';
        return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trabajadorEmail)) {
        mensajeDiv.textContent = 'Por favor, ingresa un formato de email válido.';
        mensajeDiv.style.color = 'red';
        return;
    }


    const data = {
        // Ya no enviamos 'id' en el body de la petición
        email: trabajadorEmail,
        contraseña: trabajadorPassword
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

            setTimeout(() => {
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    // Fallback por si la API no envía redirect_url
                    window.location.href = '/index/'; // O a una página por defecto de trabajador
                }
            }, 3000);
        } else {
            mensajeDiv.textContent = data.message || 'Error: Credenciales de trabajador incorrectas.';
            mensajeDiv.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error en la solicitud Fetch:', error);
        mensajeDiv.textContent = 'Error al intentar conectar con el servidor: ' + error.message;
        mensajeDiv.style.color = 'red';
    });
}