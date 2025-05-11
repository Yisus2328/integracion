import bcchapi
import pandas as pd
from datetime import datetime
import json
import os

def obtener_dolar():
    try:
        siete = bcchapi.Siete("carl.medinav@duocuc.cl", "Medina04")
        datos = siete.cuadro(
            series=["F073.TCO.PRE.Z.D"],
            nombres=["Dólar Observado"],
            desde=datetime.now().strftime("%Y-%m-%d"),
            hasta=datetime.now().strftime("%Y-%m-%d"),
            frecuencia="D",
            observado={"Dólar Observado": "last"}
        )
        df = pd.DataFrame(datos)
        valor = df.iloc[0]["Dólar Observado"]

        # Ruta al archivo JSON dentro de los archivos estáticos (ajusta según tu estructura)
        static_dir = 'tineda/static/dolar'  # Ajusta 'tu_app' si es diferente
        os.makedirs(static_dir, exist_ok=True)
        json_file_path = os.path.join(static_dir, "dolar.json")

        # Guardar en un archivo JSON
        with open(json_file_path, "w") as f:
            json.dump({
                "valor": valor,
                "fecha": datetime.now().strftime("%Y-%m-%d")
            }, f)

        return valor

    except Exception as e:
        print(f"Error: {e}")
        return None

if __name__ == "__main__":
    valor = obtener_dolar()
    print(f"Dólar hoy: ${valor:.2f} CLP" if valor else "No se pudo obtener el dato.")