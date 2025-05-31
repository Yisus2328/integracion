document.addEventListener('DOMContentLoaded', () => {

    const adminEmail = sessionStorage.getItem('adminEmailCambio');

    console.log('DOMContentLoaded - adminEmail de sessionStorage:', adminEmail);

    const mensajeDiv = document.getElementById('mensaje');
    const infoMensajeDiv = document.getElementById('infoMensaje');

    // Ahora solo verificamos adminEmail
    if (!adminEmail) {
        infoMensajeDiv.textContent = 'Error: No se pudo obtener la información del administrador (email). Intente iniciar sesión nuevamente.';
        infoMensajeDiv.classList.add('error');
        // Redirigir al login si no hay información de admin
        setTimeout(() => {
            window.location.href = '/login_admin'; 
        }, 3000); // Reduce el tiempo de espera para redirigir
        return;
    } else {
        infoMensajeDiv.textContent = `Bienvenido, ${adminEmail}. Por favor, ingresa una nueva contraseña para verificar tu cuenta.`;
        infoMensajeDiv.classList.add('info');
    }
});


function cambiarContrasenaAdmin() {
    const adminEmail = sessionStorage.getItem('adminEmailCambio');

    console.log('cambiarContrasenaAdmin - adminEmail de sessionStorage:', adminEmail);

    const newPassword = document.getElementById('new_password').value.trim();
    const confirmPassword = document.getElementById('confirm_password').value.trim();
    const mensajeDiv = document.getElementById('mensaje');

    mensajeDiv.textContent = ''; // Limpiar mensajes anteriores
    mensajeDiv.className = ''; // Limpiar clases de estilo

    // 1. Validaciones del lado del cliente
    if (!adminEmail || !newPassword || !confirmPassword) { // Asegurarse de que el email también esté presente
        mensajeDiv.textContent = 'Error: Información incompleta. Recargue la página e intente nuevamente.';
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

    // Preparar los datos para enviar a la API: solo email y newPassword
    const data = {
        email: adminEmail,
        newPassword: newPassword
    };

    console.log('Datos enviados a la API:', data);

    const apiUrl = 'http://localhost:3301/admin/cambiar-contrasena'; 

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
            

            sessionStorage.removeItem('adminEmailCambio'); 

            // Redirigir al panel de administrador después del éxito
            setTimeout(() => {
                window.location.href = '/panel_ad/';
            }, 3000);
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