//login admin

function iniciarSesionAdmin() {
    const adminId = document.getElementById('admin_id').value.trim();
    const adminEmail = document.getElementById('admin_email').value.trim();
    const adminPassword = document.getElementById('admin_password').value.trim();
    const mensajeDiv = document.getElementById('adminMensaje');

    mensajeDiv.textContent = ''; 

    if (!adminId || !adminEmail || !adminPassword) {
        mensajeDiv.textContent = 'Por favor, ingresa tu ID, email y contraseña.';
        mensajeDiv.style.color = 'red';
        return;
    }

    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
        mensajeDiv.textContent = 'Por favor, ingresa un formato de email válido.';
        mensajeDiv.style.color = 'red';
        return;
    }

    const data = {
        id: adminId,
        email: adminEmail,
        contraseña: adminPassword // Nota: Si en tu DB la columna se llama 'contraseña', usa ese nombre
    };

    
    const apiUrl = 'http://localhost:3301/login/admin'; 

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
                
                throw new Error(errorData.message || 'Error desconocido en el servidor.');
            });
        }
        return response.json(); 
    })
    .then(data => {
        if (data.success) {
            mensajeDiv.textContent = data.message || 'Inicio de sesión de administrador exitoso.';
            mensajeDiv.style.color = 'green';

            
            setTimeout(() => {
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    
                    window.location.href = '/panel_ad/'; // O la URL de tu dashboard de admin
                }
            }, 3000); 

        } else {
            mensajeDiv.textContent = data.message || 'Credenciales de administrador incorrectas.';
            mensajeDiv.style.color = 'red';
        }
    })
    .catch(error => {
        console.error('Error en la solicitud Fetch:', error);
        mensajeDiv.textContent = 'Error al intentar conectar con el servidor: ' + error.message;
        mensajeDiv.style.color = 'red';
    });
}