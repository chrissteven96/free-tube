import { useState } from "react";

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
    <div style={{ padding: 20 }}>
      <h1>Descargador de Videos</h1>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Pega el enlace" />
      <button onClick={handleDownload}>Descargar</button>
      <p>{status}</p>
    </div>
  );
}

export default Interface;
