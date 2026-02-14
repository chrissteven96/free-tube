import { app, BrowserWindow, ipcMain, shell } from 'electron';

import path from 'node:path';
import started from 'electron-squirrel-startup';

// import { exec } from 'child_process';


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Ruta del icono basada en la ruta de la app (funciona en dev y empaquetado)
  const iconPath = path.join(app.getAppPath(), 'assets', 'icon.ico');

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    icon: iconPath,
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
  // mainWindow.webContents.openDevTools();
};

// Abrir URLs externas en el navegador por defecto
ipcMain.on('open-external-url', (event, url) => {
  if (!url) return;
  try {
    shell.openExternal(url);
  } catch (err) {
    console.error('Error abriendo URL externa:', url, err);
  }
});

// ipcMain.on('download-video', (event, url) => {
//   exec(`yt-dlp --no-playlist -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]" --merge-output-format mp4 -o "%(title)s.%(ext)s" ${url}`, (error, stdout, stderr) => {
//     if (error) {
//       event.reply('download-status', { success: false, message: stderr });
//     } else {
//       event.reply('download-status', { success: true, message: '✅ Descarga completa' });
//     }
//   });
// });

// Función para obtener metadatos del video
const getVideoInfo = (url) => {
  return new Promise((resolve, reject) => {
    const { spawn } = require('child_process');
    
    const infoProcess = spawn('yt-dlp', [
      '--no-playlist',
      '--dump-json',
      '--no-download',
      url
    ]);
    
    let dataString = '';
    
    infoProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });
    
    infoProcess.stderr.on('data', (data) => {
      console.error('Error obteniendo info:', data.toString());
    });
    
    infoProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const videoData = JSON.parse(dataString);
          const videoInfo = {
            title: videoData.title || 'Video sin título',
            thumbnail: videoData.thumbnail || '',
            url: url,
            duration: videoData.duration || 0,
            uploader: videoData.uploader || 'Desconocido'
          };
          resolve(videoInfo);
        } catch (err) {
          console.error('Error parseando JSON:', err);
          reject(err);
        }
      } else {
        reject(new Error(`Código de salida: ${code}`));
      }
    });
    
    infoProcess.on('error', (err) => {
      reject(err);
    });
  });
};

ipcMain.on('download-video', (event, { url, quality }) => {
  console.log('Recibida solicitud de descarga:');
  console.log('URL:', url);
  console.log('Calidad:', quality);
  const { spawn } = require('child_process');
  const path = require('path');
  const fs = require('fs');
  const { app } = require('electron');

  // Obtener la ruta de la carpeta de descargas del sistema
  const userDownloadsPath = app.getPath('videos');
  const downloadDir = path.join(userDownloadsPath, 'freetube');
  

  // Crear el directorio freetube si no existe
  if (!fs.existsSync(downloadDir)) {
    try {
      fs.mkdirSync(downloadDir, { recursive: true });
      console.log(`Directorio de descargas creado en: ${downloadDir}`);
    } catch (err) {
      console.error('Error al crear el directorio de descargas:', err);
      // Si falla, usar la carpeta de descargas directamente
      return event.reply('download-status', {
        success: false,
        message: '❌ No se pudo crear el directorio freetube en Descargas. Verifica los permisos.'
      });
    }
  }

  // Removed auto-opening folder here to prevent it from opening on every download
   
  // Configuración básica de yt-dlp

  // Configurar el formato según la calidad seleccionada
  console.log('Calidad seleccionada:', quality);
  const isAudioOnly = quality === 'audio';
  let format = '';
  const resolution = quality.toString();

  if (isAudioOnly) {
    // Solo audio: dejar que yt-dlp escoja el mejor audio disponible
    format = 'bestaudio/best';
  } else if (quality === 'best') {
    format = 'bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4][vcodec^=avc1]';
  } else if (quality === 'worst') {
    format = 'worstvideo[ext=mp4][vcodec^=avc1]+worstaudio[ext=m4a]/worst[ext=mp4][vcodec^=avc1]';
  } else if (['1080', '720', '480'].includes(resolution)) {
    format = `bestvideo[height<=${resolution}][ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[height<=${resolution}][ext=mp4][vcodec^=avc1]`;
  } else {
    // Por defecto, mejor calidad de video
    format = 'bestvideo[ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]/best[ext=mp4][vcodec^=avc1]';
  }

  console.log(`Descargando en calidad: ${resolution}`);
  console.log(`Formato seleccionado: ${format}`);

  const args = [
    '--no-playlist',
    '-f', format,
    '--newline',
    '--progress',
    '--embed-metadata',
    '--restrict-filenames',
    '--audio-quality', '0',
    '--output', path.join(downloadDir, '%(title)s.%(ext)s'),
    '--no-mtime',
    url
  ];

  if (isAudioOnly) {
    // Extraer solo audio en MP3
    args.push('--extract-audio', '--audio-format', 'mp3');
  } else {
    // Modo video: fusionar en MP4 y embeber miniatura
    args.splice(3, 0, '--merge-output-format', 'mp4');
    args.splice(7, 0, '--embed-thumbnail');
  }

  console.log('Ejecutando yt-dlp con argumentos:', args.join(' '));

  
  // Notificar inicio de la descarga
  event.reply('download-status', {
    message: '⏳ Preparando la descarga...',
    progress: 0
  });

  const downloadProcess = spawn('yt-dlp', args);

  // Manejar salida estándar
  downloadProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log('yt-dlp:', output);
    console.log('URL recibida:', url);
    console.log('Calidad recibida:', resolution);
    
    // Buscar progreso en la salida
    const progressMatch = output.match(/\[download\]\s+(\d+\.?\d*)%/);
    if (progressMatch && progressMatch[1]) {
      const progress = parseFloat(progressMatch[1]);
      event.reply('download-status', {
        progress: progress
      });
    }
  });



  // Manejar errores
  downloadProcess.stderr.on('data', (data) => {
    const error = data.toString();
    console.error('Error:', error);
    // Mantener los mensajes de error solo en la consola para no mostrarlos al usuario
  });

  // Manejar cierre del proceso
  downloadProcess.on('close', (code) => {
    console.log(`Proceso finalizado con código ${code}`);
    
    if (code === 0) {
      // Obtener metadatos del video para el historial
      getVideoInfo(url).then(videoInfo => {
        event.reply('download-status', {
          success: true,
          progress: 100,
          message: '✅ Descarga completada correctamente',
          videoInfo: videoInfo
        });
      }).catch(err => {
        console.log('Error obteniendo metadatos:', err);
        // Enviar respuesta sin metadatos si falla
        event.reply('download-status', {
          success: true,
          progress: 100,
          message: '✅ Descarga completada correctamente'
        });
      });
    } else {
      event.reply('download-status', {
        success: false,
        message: `❌ Error en la descarga (código ${code}). Intenta de nuevo.`
      });
    }
  });

  // Manejar errores del proceso
  downloadProcess.on('error', (err) => {
    console.error('Error al ejecutar yt-dlp:', err);
    event.reply('download-status', {
      success: false,
      message: `❌ Error al ejecutar yt-dlp: ${err.message}`
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
// Handle opening the download folder
ipcMain.on('open-download-folder', () => {
  try {
    const userDownloadsPath = app.getPath('videos');
    console.log('Ruta de videos del sistema:', userDownloadsPath);
    
    const downloadDir = path.join(userDownloadsPath, 'freetube');
    console.log('Intentando abrir carpeta:', downloadDir);
    
    // Verificar si el directorio existe
    const fs = require('fs');
    if (!fs.existsSync(downloadDir)) {
      console.log('La carpeta no existe, intentando crearla...');
      try {
        fs.mkdirSync(downloadDir, { recursive: true });
        console.log('Carpeta creada exitosamente');
      } catch (mkdirErr) {
        console.error('Error al crear la carpeta:', mkdirErr);
        return;
      }
    }
    
    // Verificar permisos
    try {
      fs.accessSync(downloadDir, fs.constants.R_OK | fs.constants.W_OK);
      console.log('Tiene permisos de lectura/escritura en la carpeta');
    } catch (accessErr) {
      console.error('Error de permisos en la carpeta:', accessErr);
      return;
    }
    
    // Intentar abrir la carpeta
    shell.openPath(downloadDir).then(() => {
      console.log('Carpeta abierta exitosamente');
    }).catch(err => {
      console.error('Error al abrir la carpeta:', err);
    });
    
  } catch (error) {
    console.error('Error inesperado al abrir la carpeta:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
