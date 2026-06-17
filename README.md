
## Archivos del Proyecto 

En la carpeta `src/renderer/`, es tu zona de trabajo
1. `index.html`: Archivo principal para poner lo visual
2. `style/style.css`: Aqui colocas tus estilos
3. `js/frontend.js`: **Este es tu archivo principal**. Aqui capturas todo lo que modifica el DOM

> **Nota Importante:** No necesitas modificar `Lecturas.js`, `main.js` ni `preload.js`. 


## Herramientas Disponibles (`Lecturas`)

En tu archivo `frontend.js` tienes acceso automático a un objeto global llamado `Lecturas`. Este objeto tiene todo lo necesario:

### 1. Funciones de Control (Asíncronas)
Como estas funciones tardan un breve momento en comunicarse con el hardware, debes usar `await` al llamarlas dentro de funciones `async`:

* `await Lecturas.obtenerPuertos()`: Devuelve una lista (Array) de los puertos disponibles en la computadora.
* `await Lecturas.conectar(puerto, baudios)`: Conecta la app al puerto seleccionado (ej. `"COM3"`, `115200`). Devuelve `{ success: true }` si todo salio bien.
* `await Lecturas.desconectar()`: Cierra la conexion actual.

### 2. Eventos en Tiempo Real (Callbacks)
Estas funciones se ejecutan **automáticamente** cada vez que pasa algo en el microcontrolador.

* `Lecturas.onDatosRecibidos = (datos) => { ... }`: Se ejecuta cada vez que el microcontrolador envia un nuevo dato. **Este vaz a usar mucho**
* `Lecturas.onEstadoCambiado = (estado) => { ... }`: Se ejecuta cuando la app se conecta (`'Conectado'`) o se desconecta (`'Desconectado'`). Ideal para habilitar/deshabilitar botones.
* `Lecturas.onError = (error) => { ... }`: Se ejecuta si ocurre un problema inesperado con el puerto físico.

---

## Como capturar Datos de los Sensores (Temperatura, Luz, etc.)

Cuando el microcontrolador envía lecturas, el evento `Lecturas.onDatosRecibidos(datos)` te entregará un **objeto JSON**. 

### Ejemplo de como guardar y mostrar los datos:
let temperaturaActual = 0;
let luzActual = 0;

Lecturas.onDatosRecibidos = (datos) => {
  console.log("Llegó un paquete de datos:", datos);

  // 1. Guardar los valores en variables propias
  if (datos.temperatura !== undefined) {
    temperaturaActual = datos.temperatura;
  }
  if (datos.luz !== undefined) {
    luzActual = datos.luz;
  }

  const txtTemp = document.getElementById('txtTemp');
  const txtLuz = document.getElementById('txtLuz');

  if (txtTemp) txtTemp.textContent = `${temperaturaActual} °C`;
  if (txtLuz) txtLuz.textContent = `${luzActual} %`;

};# Proyecto_EXPOESCOM
