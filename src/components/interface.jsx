import { useState, useEffect } from "react";
import styles from "./interface.module.css";
import { FaPaste,FaDownload,FaRegFolderOpen  } from "react-icons/fa6";



function Interface() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [quality, setQuality] = useState("best");
  const [downloadOpen, setDownloadOpen] = useState(false);

  // Configurar el listener una sola vez al montar el componente
  useEffect(() => {
    const handleStatus = (data) => {
      console.log('Estado recibido:', data);
      
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
      
      if (data.success === true || data.success === false) {
        // Solo mostrar mensaje final, ignorar mensajes intermedios o warnings
        if (data.success) {
          setStatus('✅ Descarga completada correctamente');
          setProgress(100);
        } else {
          setStatus('❌ Error en la descarga. Intenta de nuevo.');
        }
        setIsDownloading(false);
      }
    };


    // Configurar el listener
    const cleanup = window.electron.receive("download-status", handleStatus);
    
    // Limpiar al desmontar
    return () => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  const handleDownload = () => {
    if (!url) {
      setStatus("❌ Por favor ingresa una URL");
      return;
    }
    
    setIsDownloading(true);
    setProgress(0);
    setStatus("⏳ Iniciando descarga...");
    
    try {
      console.log('Enviando descarga con calidad:', quality);
      window.electron.send("download-video", { url, quality });
    } catch (error) {
      console.error('Error al iniciar la descarga:', error);
      setStatus("❌ Error al iniciar la descarga");
      setIsDownloading(false);
    }
  };

  const handleQualityChange = (event) => {
    const newQuality = event.target.value;
    setQuality(newQuality);
    console.log('Calidad seleccionada:', newQuality);
  };

  const handlePaste = async () => {
    try {
      const pastedText = await navigator.clipboard.readText();
      setUrl(pastedText);
      console.log('URL pegada:', pastedText);
      // setStatus('✅ URL pegada correctamente');
    } catch (error) {
      console.error('Error al leer el portapapeles:', error);
      setStatus('❌ No se pudo acceder al portapapeles');
    }
  };

  const handleOpenFolder = () => {
    try {
      window.electron.openDownloadFolder();
      console.log('Solicitando abrir carpeta de descargas...');
    } catch (error) {
      console.error('Error al abrir la carpeta:', error);
      setStatus('❌ No se pudo abrir la carpeta de descargas');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.heads}>
        <div className={styles.logoContainer}>
      <img src="./assets/christotechColor.png" alt="" className={styles.logo}/>
      </div>

      <h1>Free <span className={styles.span1}>Tube</span>  <span className={styles.span2}> by ChristoTech</span> </h1>

      </div>
      
      
      <div className={styles.inputGroup}>
      <button onClick={handlePaste} disabled={isDownloading} className={styles.buttonPaste}  >Pegar <FaPaste /></button>
        <input 
           
          type="text"
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="Pega el enlace de YouTube" 
          autoComplete="off"
          disabled={isDownloading}
        />

        {url && <p className={styles.success}>✅</p>}
        

</div>
<div className={styles.selectGroup}>
        <select value={quality} name="quality" id="quality" onChange={handleQualityChange} disabled={isDownloading} className={styles.select}>
          <option value="best">Mejor (4k)</option>
          <option value="1080">1080p</option>
          <option value="720">720p</option>
          <option value="480">480p</option>
          <option value="worst">Peor (360p)</option>
          <option value="audio">Solo audio (MP3)</option>
        </select>
        
        <button 
          onClick={handleDownload}
          disabled={isDownloading || !url.trim()}
          className={isDownloading ? styles.downloading : ''}
        >
          {isDownloading ? 'Descargando...' : (
            <>
              Descargar <FaDownload />
            </>
          )}
        </button>
        <button   onClick={handleOpenFolder} disabled={isDownloading} className={styles.openFolderButton}>
          Abrir carpeta <FaRegFolderOpen />
        </button>
      </div>
      
      {isDownloading && (
        <div className={styles.progressContainer}>
          <div 
            className={styles.progressBar}
            style={{ width: `${progress}%` }}
          ></div>
          <div className={styles.progressText}>
            {progress.toFixed(0)}%
          </div>
        </div>
      )}
      
      {status && (
        <p className={`${styles.status} ${status.includes('❌') ? styles.error : ''}`}>
          {status}
        </p>
      )}
    </div>
  );
}

export default Interface;
