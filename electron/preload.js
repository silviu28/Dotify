const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getPrefs: () => ipcRenderer.invoke('prefs:get'),
  setPrefs: (prefs) => ipcRenderer.invoke('prefs:set', prefs),
});