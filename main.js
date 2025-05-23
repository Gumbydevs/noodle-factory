// Electron main process file
const { app, BrowserWindow, Menu, globalShortcut } = require('electron');
const path = require('path');

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 1000,  
    minWidth: 900,
    minHeight: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: true
    },
    // Make sure icon path is correct and absolute
    icon: path.join(__dirname, 'public/icons/NoodleFactoryLogo.ico')
  });

  // Remove the menu bar completely
  Menu.setApplicationMenu(null);

  // Register the keyboard shortcut for DevTools
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (mainWindow) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  // Set proper Content-Security-Policy for ES modules
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["script-src 'self' 'unsafe-inline' https://html2canvas.hertzen.com"]
      }
    });
  });

  // Load the index.html file
  mainWindow.loadFile('src/index.html');

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
}

// Create window when Electron has finished initializing
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS applications keep their menu bar active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS re-create a window when dock icon is clicked and no other windows are open
  if (mainWindow === null) {
    createWindow();
  }
});

// Clean up shortcuts when app is about to quit
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});