function iniciarSesionTrabajador() {
    const trabajadorId = document.getElementById('trabajador_id').value.trim();
    const trabajadorEmail = document.getElementById('trabajador_email').value.trim();
    const trabajadorPassword = document.getElementById('trabajador_password').value.trim();
    const mensajeDiv = document.getElementById('mensaje'); // Mantener el mismo ID para el div de mensajes

    mensajeDiv.textContent = ''; // Limpiar mensajes anteriores

    if (!trabajadorId || !trabajadorEmail || !trabajadorPassword) {
        mensajeDiv.textContent = 'Por favor, ingresa tu ID, email y contraseña.';
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

    // Validación de prefijo de ID (se mantiene del código anterior)
    const idPrefix = trabajadorId.substring(0, 2).toUpperCase(); 
    if (idPrefix !== 'BO' && idPrefix !== 'CO' && idPrefix !== 'VE') {
        mensajeDiv.textContent = 'El ID de trabajador debe comenzar con BO (Bodeguero), CO (Contador) o VE (Vendedor).';
        mensajeDiv.style.color = 'red';
        return;
    }

    const data = {
        id: trabajadorId,          // Renombrado a 'id' para consistencia con admin
        email: trabajadorEmail,    // Nuevo campo
        contraseña: trabajadorPassword // Nuevo campo
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
                    // En este caso, el servidor Node.js debería enviar una URL específica
                    window.location.href = '/index/'; 
                }
            }, 3000); // 3000 milisegundos = 3 segundos
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