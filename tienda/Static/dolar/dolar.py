import bcchapi
import pandas as pd
from datetime import datetime, timedelta
import json
import os

def obtener_dolar():
    try:
        # Crear directorio si no existe
        ruta_dolar = os.path.join("Ferrema", "tienda", "Static", "dolar")
        os.makedirs(ruta_dolar, exist_ok=True)
        
        # Ruta completa del archivo json
        json_path = os.path.join(ruta_dolar, "dolar.json")
        
        # Verificar si el archivo existe y es de hoy
        if os.path.exists(json_path):
            with open(json_path, "r") as f:
                data = json.load(f)
                fecha_guardada = datetime.strptime(data["fecha"], "%Y-%m-%d").date()
                if fecha_guardada == datetime.now().date():
                    print(f"Valor del dólar ya está actualizado: ${data['valor']} CLP")
                    return data["valor"]

        # Obtener nuevo valor si no existe o está desactualizado
        siete = bcchapi.Siete("carl.medinav@duocuc.cl", "Medina04") 
        datos = siete.cuadro(
            series=["F073.TCO.PRE.Z.D"],
            nombres=["Dólar Observado"],
            desde=(datetime.now() - timedelta(days=2)).strftime("%Y-%m-%d"),
            hasta=datetime.now().strftime("%Y-%m-%d"),
            frecuencia="d",
            observado={"Dólar Observado": "last"}
        )
        
        df = pd.DataFrame(datos)
        valor = df.iloc[0]["Dólar Observado"]

        # Guardar los datos en el archivo JSON
        with open(json_path, "w") as f:
            json.dump({
                "valor": valor,
                "fecha": datetime.now().strftime("%Y-%m-%d")
            }, f)

        print(f"Nuevo valor del dólar obtenido: ${valor} CLP")
        return valor

    except FileNotFoundError as e:
        print(f"Error: No se encontró el archivo o directorio. {e}")
        return None
    except json.JSONDecodeError as e:
        print(f"Error al leer el archivo JSON. {e}")
        return None
    except bcchapi.BCCHAPIError as e:
        print(f"Error al conectar con la API del BCCH: {e}")
        return None
    except Exception as e:
        print(f"Error inesperado: {e}")
        return None

if __name__ == "__main__":
    valor = obtener_dolar()
    if valor:
        print(f"Dólar hoy: ${valor:.2f} CLP")
    else:
        print("No se pudo obtener el dato.")
        try:
            # Intentar leer el último valor disponible
            json_path = os.path.join("Ferrema", "tienda", "Static", "dolar", "dolar.json")
            with open(json_path, "r") as f:
                data = json.load(f)
                print(f"Último valor disponible (${data['valor']:.2f} CLP del {data['fecha']})")
        except FileNotFoundError:
            print("No se encontró el archivo `dolar.json`. No hay datos históricos disponibles.")
        except json.JSONDecodeError:
            print("Hubo un error al leer el archivo `dolar.json`. El archivo podría estar corrupto.")
        except Exception as e:
            print(f"Error inesperado al intentar leer el archivo histórico: {e}")