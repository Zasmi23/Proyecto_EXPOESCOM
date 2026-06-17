const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

let mainWindow;
let port; 

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, 
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});


ipcMain.handle('get-ports', async () => {
  try {
    const ports = await SerialPort.list();
    return ports;
  } catch (error) {
    console.error("Error obteniendo puertos:", error);
    return [];
  }
});


ipcMain.handle('connect-port', (event, portPath, baudRate) => {
  if (port && port.isOpen) {
    port.close();
  }

  try {
    port = new SerialPort({ 
      path: portPath, 
      baudRate: parseInt(baudRate) 
    });

    const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

    port.on('open', () => {
      console.log(`Conectado a ${portPath} a ${baudRate} baudios`);
      mainWindow.webContents.send('port-status', 'Conectado');
    });

    parser.on('data', (data) => {
      mainWindow.webContents.send('serial-data', data);
    });

    port.on('error', (err) => {
      console.error('Error en el puerto:', err.message);
      mainWindow.webContents.send('port-error', err.message);
    });

    port.on('close', () => {
      console.log('Puerto cerrado');
      mainWindow.webContents.send('port-status', 'Desconectado');
    });

    return { success: true };

  } catch (error) {
    return { success: false, message: error.message };
  }
});

ipcMain.handle('disconnect-port', () => {
  if (port && port.isOpen) {
    port.close();
  }
  return { success: true };
});