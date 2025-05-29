function iniciarSesionAdmin() {
    const adminId = document.getElementById('admin_id').value.trim();
    const adminEmail = document.getElementById('admin_email').value.trim();
    const adminPassword = document.getElementById('admin_password').value.trim();
    const mensajeDiv = document.getElementById('adminMensaje');

    mensajeDiv.textContent = ''; // Limpia mensajes anteriores

    // Validación básica de campos vacíos
    if (!adminId || !adminEmail || !adminPassword) {
        mensajeDiv.textContent = 'Por favor, ingresa tu ID, email y contraseña.';
        mensajeDiv.style.color = 'red';
        return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
        mensajeDiv.textContent = 'Por favor, ingresa un formato de email válido.';
        mensajeDiv.style.color = 'red';
        return;
    }

    // Datos a enviar a la API
    const data = {
        id: adminId,
        email: adminEmail,
        contraseña: adminPassword
    };

    // URL de tu API de login de administrador
    const apiUrl = 'http://localhost:3301/login/admin';

    // Realiza la solicitud Fetch
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        // Manejo de errores HTTP (respuestas no-OK)
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.message || 'Error desconocido en el servidor.');
            });
        }
        return response.json(); // Parsea la respuesta JSON
    })
    .then(data => {
        // Si el login fue exitoso en la API
        if (data.success) {
            // Verifica el estado del administrador
            // *** CORRECCIÓN AQUÍ: 'No_verificado' (con guion bajo) ***
            if (data.admin && data.admin.estado === "No_verificado") {
                // Muestra el mensaje específico para el cambio de contraseña
                mensajeDiv.textContent = 'Admin no verificado, lo redirigiremos para cambiar su contraseña.';
                mensajeDiv.style.color = 'orange'; 

                // Esta sección ahora SÍ se ejecutará
                if (data.admin && data.admin.id_admin && data.admin.email) {
                    sessionStorage.setItem('adminIdCambio', data.admin.id_admin);
                    sessionStorage.setItem('adminEmailCambio', data.admin.email);
                    // Puedes añadir un console.log aquí para confirmar
                    console.log('Datos de admin guardados en sessionStorage:', data.admin.id_admin, data.admin.email);
                } else {
                    console.error('Error: data.admin o sus propiedades id_admin/email son undefined o null en la respuesta de la API.');
                }
                
                // Redirección después de un breve retraso para que el usuario vea el mensaje
                setTimeout(() => {
                    window.location.href = '/admin_cambio'; 
                }, 3000); 
            } else {
                // Comportamiento normal si el estado es 'Verificado' o no es 'No_verificado'
                mensajeDiv.textContent = data.message || 'Inicio de sesión de administrador exitoso.';
                mensajeDiv.style.color = 'green';

                setTimeout(() => {
                    if (data.redirect_url) {
                        window.location.href = data.redirect_url; 
                    } else {
                        // Asegúrate de que esta ruta sea correcta: /panel_ad.html/ o /panel_ad/
                        window.location.href = '/panel_ad.html/'; 
                    }
                }, 3000);
            }

        } else {
            // Si el login no fue exitoso (credenciales incorrectas, etc.)
            mensajeDiv.textContent = data.message || 'Credenciales de administrador incorrectas.';
            mensajeDiv.style.color = 'red';
        }
    })
    .catch(error => {
        // Manejo de errores de red o errores lanzados en los .then()
        console.error('Error en la solicitud Fetch:', error);
        mensajeDiv.textContent = 'Error al intentar conectar con el servidor: ' + error.message;
        mensajeDiv.style.color = 'red';
    });
}