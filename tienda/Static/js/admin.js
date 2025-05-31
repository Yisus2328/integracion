function iniciarSesionAdmin() {
    // Ya no necesitamos obtener el ID del DOM
    // const adminId = document.getElementById('admin_id').value.trim();

    const adminEmail = document.getElementById('admin_email').value.trim();
    const adminPassword = document.getElementById('admin_password').value.trim();
    const mensajeDiv = document.getElementById('mensaje');

    mensajeDiv.textContent = ''; // Limpiar mensajes anteriores

    // Validación: solo email y contraseña son requeridos
    if (!adminEmail || !adminPassword) {
        mensajeDiv.textContent = 'Por favor, ingresa tu email y contraseña.';
        mensajeDiv.style.color = 'red';
        return;
    }

    // Validación de formato de email (mantener)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
        mensajeDiv.textContent = 'Por favor, ingresa un formato de email válido.';
        mensajeDiv.style.color = 'red';
        return;
    }

    const data = {
        // Ya no enviamos 'id' en el body de la petición
        email: adminEmail,
        contraseña: adminPassword
    };

    const apiUrl = 'http://localhost:3301/login/admin'; // Asegúrate que esta URL es correcta

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
                    // Si la API indica una redirección a admin_cambio (primer login de admin)
                    if (data.redirect_url === '/admin_cambio') {
                        if (data.admin && data.admin.email) {
                            sessionStorage.setItem('adminEmailCambio', data.admin.email);
                            // No guardamos 'adminIdCambio' ya que no lo necesitamos más en ese flujo
                        } else {
                            console.warn('API no proporcionó el email del admin para el cambio de contraseña.');
                        }
                    }
                    window.location.href = data.redirect_url;
                } else {
                    // Fallback por si la API no envía redirect_url
                    window.location.href = '/panel_ad/'; // URL por defecto para admin
                }
            }, 3000); // Espera 3 segundos antes de redirigir
        } else {
            mensajeDiv.textContent = data.message || 'Error: Credenciales de administrador incorrectas.';
            mensajeDiv.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error en la solicitud Fetch:', error);
        mensajeDiv.textContent = 'Error al intentar conectar con el servidor: ' + error.message;
        mensajeDiv.style.color = 'red';
    });
}