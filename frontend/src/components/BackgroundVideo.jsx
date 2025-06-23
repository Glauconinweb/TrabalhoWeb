import React from "react";
import "./BackgroundVideo.css"; // CSS separado para organização

const BackgroundVideo = () => {
  return (
    <div className="video-container">
      <video autoPlay muted loop className="background-video">
        <source src="/videos/Tobi.mp4" type="video/mp4" />
        Seu navegador não suporta vídeo em HTML5.
      </video>
    </div>
  );
};

export default BackgroundVideo;
