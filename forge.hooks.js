const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);

module.exports = {
  packageAfterCopy: async (forgeConfig, buildPath, electronVersion, platform, arch, callback) => {
    console.log('Copying binary files...');
    
    const binaries = ['yt-dlp.exe', 'ffmpeg.exe', 'ffplay.exe', 'ffprobe.exe'];
    const resourcesPath = path.join(buildPath, 'resources');
    
    // Crear directorio de recursos si no existe
    if (!fs.existsSync(resourcesPath)) {
      fs.mkdirSync(resourcesPath, { recursive: true });
    }
    
    // Copiar cada binario
    for (const binary of binaries) {
      const source = path.join(process.cwd(), binary);
      const target = path.join(resourcesPath, binary);
      
      if (fs.existsSync(source)) {
        try {
          await copyFile(source, target);
          console.log(`✅ Copiado: ${binary}`);
        } catch (err) {
          console.error(`❌ Error al copiar ${binary}:`, err);
        }
      } else {
        console.warn(`⚠️ No se encontró: ${binary}`);
      }
    }
    
    callback();
  }
};
