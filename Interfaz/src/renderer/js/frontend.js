let luzActualPorcentaje = 0;

let registrosLuz = []; 

dashboard.btnGuardarLuz.addEventListener('click', () => {
  const numFoco = dashboard.focoInput.value;
  const nombreFoco = `Foco ${numFoco}`;
  const valorGuardado = parseFloat(luzActualPorcentaje);
  
  if (registrosLuz.find(r => r.nombre === nombreFoco)) {
      alert("Ya existe un registro con ese nombre. Por favor, cambia el número del foco.");
      return;
  }

  registrosLuz.push({
    nombre: nombreFoco,
    valor: valorGuardado
  });
  
  const li = document.createElement('li');
  li.id = `registro-${nombreFoco.replace(/\s+/g, '-')}`; 
  const timestamp = new Date().toLocaleTimeString();
  
  li.innerHTML = `<strong>${nombreFoco}:</strong> ${valorGuardado.toFixed(1)}% <span style="color:#555; font-size:10px; float:right;">${timestamp}</span>`;
  dashboard.listaFocos.prepend(li);
  
  const option = document.createElement('option');
  option.value = nombreFoco;
  option.textContent = nombreFoco;
  dashboard.selectBorrar.appendChild(option);
  
  dashboard.focoInput.value = parseInt(numFoco) + 1;
});

dashboard.btnBorrarRegistro.addEventListener('click', () => {
  const registroSeleccionado = dashboard.selectBorrar.value;
  
  if (!registroSeleccionado) {
      alert("Por favor, selecciona un registro del menú desplegable para borrarlo.");
      return;
  }

  registrosLuz = registrosLuz.filter(r => r.nombre !== registroSeleccionado);

  const liABorrar = document.getElementById(`registro-${registroSeleccionado.replace(/\s+/g, '-')}`);
  if (liABorrar) liABorrar.remove();

  const optionABorrar = dashboard.selectBorrar.querySelector(`option[value="${registroSeleccionado}"]`);
  if (optionABorrar) optionABorrar.remove();

  if (dashboard.lblElemento && dashboard.lblElemento.textContent === registroSeleccionado) {
      dashboard.lblElemento.textContent = "Evaluando...";
      dashboard.lblElemento.style.color = "#777";
  }
  
  dashboard.selectBorrar.value = "";
});

Lecturas.onDatosRecibidos = (datos) => {
  const nuevaLectura = document.createElement('div');
  nuevaLectura.className = 'lectura';
  nuevaLectura.textContent = JSON.stringify(datos, null, 2);
  nuevaLectura.style.whiteSpace = "pre-wrap";
  conexion.outputBox.appendChild(nuevaLectura);
  
  while (conexion.outputBox.children.length > 5) {
    conexion.outputBox.removeChild(conexion.outputBox.firstChild);
  }
  conexion.outputBox.scrollTop = conexion.outputBox.scrollHeight;


  if (datos.temp !== undefined) {
    dashboard.valTemp.textContent = parseFloat(datos.temp).toFixed(1);
  }

  if (datos.Humedad !== undefined) {
    const humedadActual = parseFloat(datos.Humedad);
    const UMBRAL_HUMEDAD = 80; 
    
    if (humedadActual >= UMBRAL_HUMEDAD) {
      dashboard.ledElectrodo.className = "led activo";
      dashboard.statusElectrodo.textContent = "Humedad Alta";
      dashboard.statusElectrodo.style.color = "#00ff00"; 
    } else {
      dashboard.ledElectrodo.className = "led inactivo";
      dashboard.statusElectrodo.textContent = "Humedad Normal";
      dashboard.statusElectrodo.style.color = "#ff0000"; 
    }
  }

  if (datos["Cantidad de luz"] !== undefined) {
    luzActualPorcentaje = parseFloat(datos["Cantidad de luz"]);
    dashboard.valLuzPct.textContent = `${luzActualPorcentaje.toFixed(1)}%`;
    
    let coincidencia = "Desconocido"; 
    const margenError = 3.0; 
    
    for (const registro of registrosLuz) {
      const diferencia = Math.abs(luzActualPorcentaje - registro.valor);
      
      if (diferencia <= margenError) {
        coincidencia = registro.nombre;
        break; 
      }
    }
    
    if (dashboard.lblElemento) {
        dashboard.lblElemento.textContent = coincidencia;
        if (coincidencia === "Desconocido") {
            dashboard.lblElemento.style.color = "#777";
        } else {
            dashboard.lblElemento.style.color = "#feca57";
        }
    }
  }

  if (datos.voltajeLuz !== undefined) {
    const vOutLuz = parseFloat(datos.voltajeLuz);
    
    const vInLuz = vOutLuz * 3.6363; 
    
    const frecuencia = vInLuz * 1000;
    
    let resLdr = 0;
    if (frecuencia > 0) {
        resLdr = (720000000 / frecuencia) - 59300;
        if (resLdr < 0) resLdr = 0; 
    } else {
        resLdr = Infinity; 
    }
    
    esquemas.ldrV2.textContent = `${vOutLuz.toFixed(2)} V`;
    esquemas.ldrV1.textContent = `${vInLuz.toFixed(2)} V`;
    esquemas.ldrFreq.textContent = `${frecuencia.toFixed(0)} Hz`;
    
    if (resLdr === Infinity) {
        esquemas.ldrRes.textContent = `Oscuridad`;
    } else if (resLdr >= 1000) {
        esquemas.ldrRes.textContent = `${(resLdr / 1000).toFixed(2)} kΩ`;
    } else {
        esquemas.ldrRes.textContent = `${resLdr.toFixed(0)} Ω`;
    }
  }
  
  if (datos.VoltajeTemperatura !== undefined) {
    const vOutTemp = parseFloat(datos.VoltajeTemperatura);
    const vInTemp = vOutTemp + 2.73; 
    
    esquemas.tempV2.textContent = `${vOutTemp.toFixed(2)} V`; 
    esquemas.tempV1.textContent = `${vInTemp.toFixed(2)} V`; 
  }

  if (datos.voltajeHumedad !== undefined) {
    esquemas.elecV2.textContent = `${parseFloat(datos.voltajeHumedad).toFixed(2)} V`;
  }

  if (easterEggPanel.style.display === 'block') {
    
    if (datos["Cantidad de luz"] !== undefined) {
      const posYSol = 250 - (luzActualPorcentaje * 2.3); 
      sol.style.top = `${posYSol}px`;
      
      easterEggPanel.style.background = luzActualPorcentaje < 20 ? '#191970' : '#87CEEB';
    }

    if (datos.Humedad !== undefined) {
      const humedadPlanta = parseFloat(datos.Humedad);
      if (humedadPlanta > 80) {
        tierraMaceta.style.backgroundColor = '#3e2723';
      } else {
        tierraMaceta.style.backgroundColor = '#8D6E63';
      }
    }

    if (datos.temp !== undefined) {
      const tempPlanta = parseFloat(datos.temp);
      if (tempPlanta > 35.0) {
        fuegoPlanta.style.display = 'block';
      } else {
        fuegoPlanta.style.display = 'none';
      }
    }
  }
  
};

  const btnEasterEgg = document.getElementById('btnEasterEgg');
  const easterEggPanel = document.getElementById('easterEggPanel');
  const btnCerrarPlanta = document.getElementById('btnCerrarPlanta');

  btnEasterEgg.addEventListener('click', () => { easterEggPanel.style.display = 'block'; });
  btnCerrarPlanta.addEventListener('click', () => { easterEggPanel.style.display = 'none'; });

  const sol = document.getElementById('sol');
  const tierraMaceta = document.getElementById('tierraMaceta');
  const fuegoPlanta = document.getElementById('fuegoPlanta');

Lecturas.onEstadoCambiado = (estado) => {
  conexion.statusText.textContent = `Estado: ${estado}`;
  if (estado === 'Conectado') {
    conexion.statusText.style.color = '#28a745';
    conexion.btnConnect.disabled = true;
    conexion.btnDisconnect.disabled = false;
    conexion.portSelect.disabled = true;
    conexion.baudSelect.disabled = true;
  } else {
    conexion.statusText.style.color = '#dc3545';
    conexion.btnConnect.disabled = false;
    conexion.btnDisconnect.disabled = true;
    conexion.portSelect.disabled = false;
    conexion.baudSelect.disabled = false;
  }
};

Lecturas.onError = (error) => { alert(`Error en el puerto: ${error}`); };

async function cargarPuertos() {
  conexion.portSelect.innerHTML = '<option value="">Buscando puertos...</option>';
  const puertos = await Lecturas.obtenerPuertos();
  conexion.portSelect.innerHTML = '';
  if (puertos.length === 0) {
    conexion.portSelect.innerHTML = '<option value="">No se encontraron puertos</option>';
    return;
  }
  puertos.forEach(puerto => {
    const option = document.createElement('option');
    option.value = puerto.path;
    option.textContent = `${puerto.path} ${puerto.manufacturer ? `(${puerto.manufacturer})` : ''}`;
    conexion.portSelect.appendChild(option);
  });
}



conexion.btnRefresh.addEventListener('click', cargarPuertos);
conexion.btnConnect.addEventListener('click', async () => {
  const puertoSeleccionado = conexion.portSelect.value;
  const baudRate = conexion.baudSelect.value;
  if (!puertoSeleccionado) { alert("Por favor, selecciona un puerto primero."); return; }
  const result = await Lecturas.conectar(puertoSeleccionado, baudRate);
  if (!result.success) alert("Error al conectar: " + result.message);
});

conexion.btnDisconnect.addEventListener('click', async () => { await Lecturas.desconectar(); });
document.addEventListener('DOMContentLoaded', cargarPuertos);