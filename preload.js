// Preload script for Electron
const { contextBridge, ipcRenderer } = require('electron');

// Wait for the DOM to load
window.addEventListener('DOMContentLoaded', () => {
  // Set up a bridge for communicating between renderer process and main process
  contextBridge.exposeInMainWorld('electronAPI', {
    // Expose app version to the renderer
    getVersion: () => process.env.npm_package_version || '1.0.0',
    
    // Optional: Add methods for saving/loading game data to local filesystem
    saveGameData: (data) => ipcRenderer.invoke('save-game-data', data),
    loadGameData: () => ipcRenderer.invoke('load-game-data')
  });

  // Fix paths for ES modules in Electron
  const baseElement = document.createElement('base');
  baseElement.href = window.location.href;
  document.head.appendChild(baseElement);

  // Set a flag to inform the game it's running in Electron
  window.isElectronApp = true;

  // Allow for correct audio context initialization in Electron
  document.addEventListener('click', function initAudio() {
    // Create a temporary audio context to get permission
    const tempAudioContext = new (window.AudioContext || window.webkitAudioContext)();
    tempAudioContext.resume().then(() => {
      console.log('Audio context initialized in Electron');
      // We only need this once
      document.removeEventListener('click', initAudio);
    });
  }, { once: false });

  // Make the preloader disappear after a short delay to ensure everything is loaded
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => {
        preloader.style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
      }, 500);
    }
  }, 1500);
});