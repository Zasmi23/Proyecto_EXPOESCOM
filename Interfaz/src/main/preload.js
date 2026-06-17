const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('serialAPI', {
  
  getPorts: () => ipcRenderer.invoke('get-ports'),
  connectPort: (path, baudRate) => ipcRenderer.invoke('connect-port', path, baudRate),
  disconnectPort: () => ipcRenderer.invoke('disconnect-port'),


  onSerialData: (callback) => ipcRenderer.on('serial-data', (_event, data) => callback(data)),
  onPortStatus: (callback) => ipcRenderer.on('port-status', (_event, status) => callback(status)),
  onPortError: (callback) => ipcRenderer.on('port-error', (_event, error) => callback(error))
  
});