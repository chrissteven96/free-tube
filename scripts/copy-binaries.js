const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const binaries = ['yt-dlp.exe', 'ffmpeg.exe', 'ffplay.exe', 'ffprobe.exe'];
const sourceDir = __dirname;
const targetDir = path.join(process.cwd(), 'resources');

// Crear directorio de recursos si no existe
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Copiar cada binario
binaries.forEach(binary => {
  const sourcePath = path.join(process.cwd(), binary);
  const targetPath = path.join(targetDir, binary);
  
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Copiado: ${binary}`);
    } catch (err) {
      console.error(`❌ Error al copiar ${binary}:`, err.message);
    }
  } else {
    console.warn(`⚠️  No se encontró: ${binary}`);
  }
});

console.log('Proceso de copia de binarios completado.');
