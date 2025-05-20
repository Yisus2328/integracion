document.addEventListener('DOMContentLoaded', function() {
    // Función para formatear números con separadores de miles
    function formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }

    // Función principal para actualizar precios
    function actualizarPrecios(valorDolar) {
        document.querySelectorAll('.producto').forEach(producto => {
            const precioUSD = parseFloat(
                producto.querySelector('.precio-usd').textContent.replace('USD ', '').replace(',', '')
            );
            const precioCLP = Math.round(precioUSD * valorDolar);
            producto.querySelector('.valor-convertido').textContent = `${formatNumber(precioCLP)} `;
        });
    }

    // Obtener valor del dólar con cache-busting
    fetch('/static/dolar/dolar.json?t=' + new Date().getTime()) // Corregir la ruta aquí
        .then(response => {
            if (!response.ok) throw new Error("Error en la respuesta");
            return response.json();
        })
        .then(data => {
            const hoy = new Date().toISOString().split('T')[0];
            const valorDolar = parseFloat(data.valor);
            
            // Mostrar valor y fecha
            document.getElementById('valor-dolar').textContent = `$${valorDolar.toFixed(2)}`;
            document.getElementById('fecha-actualizacion').textContent = new Date(data.fecha).toLocaleDateString('es-CL', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });

            // Verificar si está actualizado
            if (data.fecha !== hoy) {
                console.warn('Advertencia: El valor del dólar no está actualizado hoy');
                document.getElementById('dolar-warning').style.display = 'block';
            }

            // Guardar el último valor del dólar en el LocalStorage
            localStorage.setItem('lastDolar', JSON.stringify(data));

            // Actualizar precios
            actualizarPrecios(valorDolar);
        })
        .catch(error => {
            console.error("Error al obtener el dólar:", error);
            document.getElementById('dolar-error').style.display = 'block';
            
            // Intentar con el último valor (si hay error)
            try {
                const lastDolar = localStorage.getItem('lastDolar');
                if (lastDolar) {
                    const data = JSON.parse(lastDolar);
                    actualizarPrecios(data.valor);
                    document.getElementById('valor-dolar').textContent = `$${data.valor.toFixed(2)}`;
                    document.getElementById('fecha-actualizacion').textContent = new Date(data.fecha).toLocaleDateString('es-CL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                }
            } catch(e) {
                console.error("No se pudo usar valor local:", e);
            }
        });
});
