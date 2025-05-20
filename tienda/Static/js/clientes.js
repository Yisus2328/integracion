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


async function iniciarSesion() {
    const form = document.getElementById('loginForm');
    const formData = new FormData(form);
    const loginData = {};
    formData.forEach((value, key) => {
        loginData[key] = value;
    });

    const apiUrl = 'http://localhost:3301/login'; // Asegúrate de que el puerto sea correcto

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });

        const result = await response.json();
        const mensajeDiv = document.getElementById('mensaje');

        if (response.ok) {
            mensajeDiv.className = 'exito';
            mensajeDiv.textContent = result.message || 'Inicio de sesión exitoso.';
            console.log('Inicio de sesión exitoso:', result);
            
            // Espera 3 segundos (3000 milisegundos) y luego redirige
            setTimeout(() => {
                window.location.href = '/'; // Redirige tras el éxito
            }, 3000); 

        } else {
            mensajeDiv.className = 'error';
            mensajeDiv.textContent = result.error || 'Error al iniciar sesión. Credenciales inválidas.';
            console.error('Error al iniciar sesión:', result);
        }

    } catch (error) {
        const mensajeDiv = document.getElementById('mensaje');
        mensajeDiv.className = 'error';
        mensajeDiv.textContent = 'Error de conexión con la API.';
        console.error('Error de conexión:', error);
    }
}
