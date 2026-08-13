const { app, BrowserWindow, ipcMain } = require('electron');
const Store = require('electron-store').default;
const path = require('path');

const store = new Store({
  defaults: {
    prefs: {

    }
  }
});

const isDev = !app.isPackaged;

function createWindow() {
  const mainWindow = new BrowserWindow({
    autoHideMenuBar: !isDev,
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'Dotify',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '..', 'public', 'LogoDotifyFavIcon.png'),
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4200');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(
      path.join(__dirname, '..', 'dist', 'Dotify', 'browser', 'index.html'),
    );
  }
}

ipcMain.handle('prefs:get', () => {
  return store.get('prefs');
});

ipcMain.handle('prefs:set', (event, prefs) => {
  store.set('prefs', prefs);
  return true;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});