const { contextBridge, ipcRenderer } = require('electron');

// Expose a minimal, safe API to the renderer
contextBridge.exposeInMainWorld('datrena', {
  isElectron: true,
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
  // Future: invoke('rithmic:connect', creds) etc.
  invoke: (channel, payload) => ipcRenderer.invoke(channel, payload),
});
