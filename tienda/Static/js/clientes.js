async function agregarCliente() {
    const form = document.getElementById('agregarClienteForm');
    const formData = new FormData(form);
    const clienteData = {};
    formData.forEach((value, key) => {
        clienteData[key] = value;
    });

    const apiUrl = 'http://localhost:3301/clientes/'; // Reemplaza con la URL de tu API de Express
    const csrfToken = formData.get('csrfmiddlewaretoken');

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(clienteData)
        });

        const result = await response.json();
        const mensajeDiv = document.getElementById('mensaje');

        if (response.ok) {
            mensajeDiv.className = 'exito';
            mensajeDiv.textContent = result.message || 'Cuenta creada exitosamente, redirigiendo al login.';
            form.reset(); 
            
            setTimeout(() => {
                window.location.href = '/index'; 
            }, 6000); 


        } else {
            mensajeDiv.className = 'error';
            mensajeDiv.textContent = result.error || 'Error al agregar el cliente.';
            console.error('Error al agregar cliente:', result);
        }

    } catch (error) {
        const mensajeDiv = document.getElementById('mensaje');
        mensajeDiv.className = 'error';
        mensajeDiv.textContent = 'Error de conexión con la API.';
        console.error('Error de conexión:', error);
    }
}


async function iniciarSesionCliente() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const mensajeDiv = document.getElementById('mensaje');

    mensajeDiv.textContent = ''; 
    mensajeDiv.className = ''; 

    if (!email || !password) {
        mensajeDiv.textContent = 'Por favor, ingresa tu email y contraseña.';
        mensajeDiv.className = 'error';
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        mensajeDiv.textContent = 'Por favor, ingresa un formato de email válido.';
        mensajeDiv.className = 'error';
        return;
    }

    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const djangoLoginUrl = '/login_cliente_django/'; 

        const response = await fetch(djangoLoginUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken, 
            },
            body: JSON.stringify({ email: email, password: password }) 
        });

        const result = await response.json(); 

        if (response.ok && result.success) { 
            mensajeDiv.textContent = result.message || 'Inicio de sesión exitoso.';
            mensajeDiv.className = 'exito';
            console.log('Inicio de sesión exitoso:', result);

            setTimeout(() => {
                window.location.href = result.redirect_url || '/'; 
            }, 1500); 

        } else { 
            mensajeDiv.textContent = result.message || 'Error al iniciar sesión. Credenciales inválidas.';
            mensajeDiv.className = 'error';
            console.error('Error al iniciar sesión:', result);
        }

    } catch (error) { 
        mensajeDiv.textContent = 'Error de conexión con el servidor.';
        mensajeDiv.className = 'error';
        console.error('Error de conexión:', error);
    }
}


//AL MOMENTO DE AGREGAR NUEVO CLIENTE SE DEBE EJECUTAR EL SIGUIENTE COMANDO
//py manage.py import_clientes