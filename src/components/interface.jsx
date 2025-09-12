import { useState, useEffect } from "react";
import styles from "./interface.module.css";

function Interface() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  // Configurar el listener una sola vez al montar el componente
  useEffect(() => {
    const handleStatus = (data) => {
      console.log('Estado recibido:', data);
      
      if (data.message) {
        setStatus(data.message);
      }
      
      if (data.progress !== undefined) {
        setProgress(data.progress);
      }
      
      if (data.success === true || data.success === false) {
        setIsDownloading(false);
        if (data.success) setProgress(100);
      } else if (data.message && data.message.includes('Descargando')) {
        setIsDownloading(true);
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
      window.electron.send("download-video", url);
    } catch (error) {
      console.error('Error al iniciar la descarga:', error);
      setStatus("❌ Error al iniciar la descarga");
      setIsDownloading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Descargador de Videos</h1>
      
      <div className={styles.inputGroup}>
        <input 
          type="text"
          value={url} 
          onChange={(e) => setUrl(e.target.value)} 
          placeholder="Pega el enlace de YouTube" 
          autoComplete="off"
          disabled={isDownloading}
        />
        
        <button 
          onClick={handleDownload}
          disabled={isDownloading || !url.trim()}
          className={isDownloading ? styles.downloading : ''}
        >
          {isDownloading ? 'Descargando...' : 'Descargar'}
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
