document.addEventListener('DOMContentLoaded', () => {
    const adminId = sessionStorage.getItem('adminIdCambio');
    const adminEmail = sessionStorage.getItem('adminEmailCambio');

    console.log('DOMContentLoaded - adminId de sessionStorage:', adminId);
    console.log('DOMContentLoaded - adminEmail de sessionStorage:', adminEmail);

    const mensajeDiv = document.getElementById('mensaje');
    const infoMensajeDiv = document.getElementById('infoMensaje');

    if (!adminId || !adminEmail) {
        infoMensajeDiv.textContent = 'Error: No se pudo obtener la información del administrador. Intente iniciar sesión nuevamente.';
        infoMensajeDiv.classList.add('error');
        // Redirigir al login si no hay información de admin
        setTimeout(() => {
            // Asegúrate de que esta ruta sea la correcta para tu página de login de administrador
            window.location.href = '/login_admin'; 
        }, 60000);
        return;
    } else {
        infoMensajeDiv.textContent = 'Por favor, ingresa una nueva contraseña para verificar tu cuenta.';
        infoMensajeDiv.classList.add('info');
    }
});


function cambiarContrasenaAdmin() {
    const adminId = sessionStorage.getItem('adminIdCambio');
    const adminEmail = sessionStorage.getItem('adminEmailCambio');

    console.log('cambiarContrasenaAdmin - adminId de sessionStorage:', adminId);
    console.log('cambiarContrasenaAdmin - adminEmail de sessionStorage:', adminEmail);

    const newPassword = document.getElementById('new_password').value.trim();
    const confirmPassword = document.getElementById('confirm_password').value.trim();
    const mensajeDiv = document.getElementById('mensaje');

    mensajeDiv.textContent = ''; // Limpiar mensajes anteriores
    mensajeDiv.className = ''; // Limpiar clases de estilo

    // 1. Validaciones del lado del cliente
    if (!newPassword || !confirmPassword) {
        mensajeDiv.textContent = 'Por favor, ingresa y confirma tu nueva contraseña.';
        mensajeDiv.classList.add('error');
        return;
    }

    if (newPassword !== confirmPassword) {
        mensajeDiv.textContent = 'Las contraseñas no coinciden.';
        mensajeDiv.classList.add('error');
        return;
    }

    if (newPassword.length < 6) { // Ejemplo: mínimo 6 caracteres
        mensajeDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        mensajeDiv.classList.add('error');
        return;
    }

    // Preparar los datos para enviar a la API
    const data = {
        id: adminId,
        email: adminEmail,
        newPassword: newPassword
    };

    console.log('Datos enviados a la API:', data);

    // URL de tu nuevo endpoint de la API
    const apiUrl = 'http://localhost:3301/admin/cambiar-contrasena'; 

    // Realizar la solicitud Fetch
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
                throw new Error(errorData.message || 'Error desconocido en el servidor al cambiar la contraseña.');
            });
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            mensajeDiv.textContent = data.message || 'Contraseña cambiada y cuenta verificada exitosamente.';
            mensajeDiv.classList.add('success');
            
            // Limpiar sessionStorage después de un cambio exitoso
            sessionStorage.removeItem('adminIdCambio');
            sessionStorage.removeItem('adminEmailCambio');

            // Redirigir al panel de administrador después del éxito
            setTimeout(() => {
                window.location.href = '/panel_ad/'; // Redirige al dashboard de admin
            }, 3000); // 3 segundos para que el usuario vea el mensaje
        } else {
            mensajeDiv.textContent = data.message || 'Error al cambiar la contraseña.';
            mensajeDiv.classList.add('error');
        }
    })
    .catch(error => {
        console.error('Error en la solicitud Fetch:', error);
        mensajeDiv.textContent = 'Error al intentar conectar con el servidor: ' + error.message;
        mensajeDiv.classList.add('error');
    });
}