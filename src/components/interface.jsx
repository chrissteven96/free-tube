import { useState, useEffect } from "react";
import styles from "./interface.module.css";
import { FaPaste,FaDownload,FaRegFolderOpen, FaFacebook, FaTiktok, FaUser, FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { TbProgressDown } from "react-icons/tb";
import { FaCheckCircle, FaYoutube, FaClock } from "react-icons/fa";





function Interface() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [quality, setQuality] = useState("best");
  const [downloadOpen, setDownloadOpen] = useState(false);
  const [videoHistory, setVideoHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

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
          
          // Agregar al historial - usar información del backend si está disponible
          if (data.videoInfo) {
            console.log('Usando videoInfo del backend:', data.videoInfo);
            addToHistory(data.videoInfo);
          } else if (url) {
            console.log('Extrayendo información desde URL:', url);
            addToHistoryFromUrl(url);
          }
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

  const handleOpenExternal = (url) => (event) => {
    event.preventDefault();
    try {
      if (window.electron && typeof window.electron.openExternal === 'function') {
        window.electron.openExternal(url);
      } else {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error al abrir enlace externo:', error);
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

  const addToHistory = (videoInfo) => {
    const newVideo = {
      id: Date.now(),
      title: videoInfo.title || 'Video sin título',
      thumbnail: videoInfo.thumbnail || '',
      url: videoInfo.url || url,
      quality: quality,
      downloadDate: new Date().toLocaleString()
    };
    
    setVideoHistory(prev => [newVideo, ...prev].slice(0, 20)); // Mantener máximo 20 videos
  };

  const addToHistoryFromUrl = (videoUrl) => {
    console.log('Agregando al historial desde URL:', videoUrl);
    
    // Extraer ID del video de YouTube
    const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : '';
    
    console.log('Video ID extraído:', videoId);
    
    const newVideo = {
      id: Date.now(),
      title: `Video de YouTube - ${videoId}`,
      thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '',
      url: videoUrl,
      quality: quality,
      downloadDate: new Date().toLocaleString()
    };
    
    console.log('Nuevo video para historial:', newVideo);
    
    setVideoHistory(prev => {
      const updated = [newVideo, ...prev].slice(0, 20);
      console.log('Historial actualizado:', updated);
      return updated;
    });
  };

  const handlePrevVideo = () => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextVideo = () => {
    setCurrentIndex(prev => Math.min(videoHistory.length - 1, prev + 1));
  };

  return (
    <div className={styles.container}>
      <div className={styles.heads}>
        <div className={styles.logoContainer}>
      <img src="https://i.imgur.com/Q91Z2RI.png" alt="" className={styles.logo}/>
      </div>

      <h1>Free <span className={styles.span1}>Tube</span>  <span className={styles.span2}> by ChristoTech</span> </h1>

      </div>

      <div className={styles.socialNet}>

        <abbr title="YouTube">
          <a href="https://www.youtube.com/@christotech96" onClick={handleOpenExternal('https://www.youtube.com/@christotech96')}>
            <FaYoutube className={styles.icono} />
          </a>
        </abbr>

        <abbr title="Facebook">
          <a href="https://www.facebook.com/ChristoTech96/" onClick={handleOpenExternal('https://www.facebook.com/ChristoTech96/')}>
            <FaFacebook className={styles.icono} />
          </a>
        </abbr>

        <abbr title="Tiktok">
          <a href="https://www.tiktok.com/@christotech96" onClick={handleOpenExternal('https://www.tiktok.com/@christotech96')}>
            <FaTiktok className={styles.icono} />
          </a>
        </abbr>

        <abbr title="Mi página Web">
          <a href="https://personal-portfolio-ten-flame.vercel.app/" onClick={handleOpenExternal('https://personal-portfolio-ten-flame.vercel.app/')}>
            <FaUser className={styles.icono} />
          </a>
        </abbr>

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

        {url && <FaCheckCircle className={styles.check} /> }
        

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
          {isDownloading ? (
            <>
            Descargando <TbProgressDown />
            </>
          ) : (
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
        <p className={`${styles.status} ${typeof status === 'string' && status.includes('❌') ? styles.error : ''}`}>
          {status === '✅ Descarga completada correctamente' ? (
            <>
              <FaCheckCircle className={styles.check} /> Descarga completada correctamente
            </>
          ) : status.startsWith('⏳') ? (
            <>
              <FaClock className={styles.check} /> Iniciando descarga...
            </>
          ) : (
            status
          )}
        </p>
      )}

      {videoHistory.length > 0 && (
        <div className={styles.history}>
          <h3 className={styles.historyTitle}>Historial de Descargas</h3>
          <div className={styles.carouselContainer}>
            <button 
              className={styles.carouselButton}
              onClick={handlePrevVideo}
              disabled={currentIndex === 0}
            >
              <FaChevronLeft />
            </button>
            
            <div className={styles.carouselContent}>
              {videoHistory.slice(currentIndex, currentIndex + 2).map((video, index) => (
                <div key={video.id} className={styles.videoCard}>
                  {video.thumbnail ? (
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className={styles.videoThumbnail}
                    />
                  ) : (
                    <div className={styles.videoThumbnailPlaceholder}>
                      <FaYoutube />
                    </div>
                  )}
                  <div className={styles.videoInfo}>
                    <h4 className={styles.videoTitle}>{video.title}</h4>
                    {/* <p className={styles.videoDetails}>
                      Calidad: {video.quality} | {video.downloadDate}
                    </p> */}
                    <p className={styles.videoDetails}>
                     Fecha: {video.downloadDate}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              className={styles.carouselButton}
              onClick={handleNextVideo}
              disabled={currentIndex >= videoHistory.length - 2}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>
      )}


    </div>


  );
}

export default Interface;
