import { useState } from "react";
import styles from "./interface.module.css";

function Interface() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");

  const handleDownload = () => {
    window.electron.send("download-video", url);
  };

  window.electron.receive("download-status", (data) => {
    setStatus(data.message);
  });

  return (
    <div className={styles.container}>
      <h1>Descargador de Videos</h1>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Pega el enlace" autoComplete="off" />
      <button onClick={handleDownload}>Descargar</button>
      <p>{status}</p>
    </div>
  );
}

export default Interface;
