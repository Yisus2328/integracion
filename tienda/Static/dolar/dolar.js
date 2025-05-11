// Contenido de {% static 'dolar/dolar.js' %}

document.addEventListener('DOMContentLoaded', function () {
    fetch('/static/dolar/dolar.json') // Cambia la ruta aquí
        .then(response => response.json())
        .then(data => {
            const valorDolar = parseFloat(data.valor);
            document.getElementById('valor-dolar').textContent = `$${valorDolar.toFixed(2)}`;
            document.getElementById('fecha-actualizacion').textContent = new Date(data.fecha).toLocaleDateString('es-CL');

            document.querySelectorAll('.producto').forEach(producto => {
                const precioUSD = parseFloat(
                    producto.querySelector('.precio-usd').textContent.replace('USD ', '')
                );
                const precioCLP = Math.round(precioUSD * valorDolar);
                producto.querySelector('.valor-convertido').textContent =
                    precioCLP.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            });
        })
        .catch(error => {
            console.error("Error al obtener el valor del dólar:", error);
        });
});