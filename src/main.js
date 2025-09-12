import { app, BrowserWindow, ipcMain } from 'electron';

import path from 'node:path';
import started from 'electron-squirrel-startup';

// import { exec } from 'child_process';


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// ipcMain.on('download-video', (event, url) => {
//   exec(`yt-dlp --no-playlist -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" --merge-output-format mp4 -o "%(title)s.%(ext)s" ${url}`, (error, stdout, stderr) => {
//     if (error) {
//       event.reply('download-status', { success: false, message: stderr });
//     } else {
//       event.reply('download-status', { success: true, message: '✅ Descarga completa' });
//     }
//   });
// });

ipcMain.on('download-video', (event, url) => {
  const { spawn } = require('child_process');

  // Estos son los argumentos que quieres pasarle a yt-dlp
  const args = [
    '--no-playlist',
    '-f',
    'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',
    '--merge-output-format',
    'mp4',
    '-o',
    '%(title)s.%(ext)s',
    url
  ];

  console.log('Ejecutando comando: yt-dlp', args.join(' '));

  // Usamos spawn para ejecutar yt-dlp con los argumentos en un array
  const downloadProcess = spawn('yt-dlp', args);

  downloadProcess.stdout.on('data', (data) => {
    console.log(`Salida de yt-dlp: ${data}`);
  });

  downloadProcess.stderr.on('data', (data) => {
    console.error(`Error de yt-dlp: ${data}`);
  });

  downloadProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(`Proceso de yt-dlp finalizado con código ${code}`);
      event.reply('download-status', {
        success: false,
        message: `❌ Error en la descarga. Código: ${code}`
      });
      return;
    }

    console.log('Descarga completada');
    event.reply('download-status', {
      success: true,
      message: '✅ Descarga completada correctamente'
    });
  });
});


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
