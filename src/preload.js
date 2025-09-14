const { contextBridge, ipcRenderer } = require('electron');

// Almacenar referencias a los listeners
const listeners = new Map();

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    const validChannels = ['download-video'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  openDownloadFolder: () => {
    ipcRenderer.send('open-download-folder');
  },
  
  receive: (channel, func) => {
    const validChannels = ['download-status'];
    if (validChannels.includes(channel)) {
      // Crear un wrapper seguro para el listener
      const listener = (event, ...args) => func(...args);
      
      // Almacenar el listener para poder eliminarlo después
      if (!listeners.has(channel)) {
        listeners.set(channel, new Map());
      }
      listeners.get(channel).set(func, listener);
      
      // Agregar el listener
      ipcRenderer.on(channel, listener);
      
      // Devolver una función para eliminar este listener específico
      return () => {
        ipcRenderer.removeListener(channel, listener);
        const channelListeners = listeners.get(channel);
        if (channelListeners) {
          channelListeners.delete(func);
        }
      };
    }
    return () => {}; // Retornar función vacía si el canal no es válido
  },
  
  removeListener: (channel, func) => {
    const channelListeners = listeners.get(channel);
    if (channelListeners) {
      const listener = channelListeners.get(func);
      if (listener) {
        ipcRenderer.removeListener(channel, listener);
        channelListeners.delete(func);
      }
    }
  }
});

