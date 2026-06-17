
const Lecturas = {
  datosActuales: null,
  estadoActual: 'Desconectado',

  onDatosRecibidos: function(datosJson) {},
  onEstadoCambiado: function(estado) {},
  onError: function(error) {},

  // funcion para obtener los puertos disponibles
  obtenerPuertos: async function() {
    return await window.serialAPI.getPorts();
  },
  //funcion para conectar el puerto con los parametros de puerto y baudios
  conectar: async function(puerto, baudios) {
    return await window.serialAPI.connectPort(puerto, baudios);
  },
  //funcion para desconectar el puerto
  desconectar: async function() {
    return await window.serialAPI.disconnectPort();
  },

  // Funcion para tener el ultimo JSON o dato crudo recibido
  obtenerDatos: function() {
    return this.datosActuales;
  }
};


window.serialAPI.onSerialData((data) => { //No tocar
  try {
    Lecturas.datosActuales = JSON.parse(data);
    Lecturas.onDatosRecibidos(Lecturas.datosActuales);
  } catch (error) {
    Lecturas.onDatosRecibidos({ textoCrudo: data });
  }
});

window.serialAPI.onPortStatus((status) => {
  Lecturas.estadoActual = status;
  Lecturas.onEstadoCambiado(status);
});

window.serialAPI.onPortError((error) => {
  Lecturas.onError(error);
});

window.Lecturas = Lecturas;