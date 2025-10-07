import React, { useState } from "react";

interface GoogleMapEmbedProps {
  latitude: number;
  longitude: number;
}

export const GoogleMapEmbed = ({
  latitude,
  longitude,
}: GoogleMapEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const mapSrc = `https://maps.google.com/maps?hl=en&q=${latitude},${longitude}&t=k&z=18&ie=UTF8&iwloc=B&output=embed`;

  return (
    <div
      style={{
        position: "relative",
        height: "415px",
        width: "100%",
        overflow: "hidden",
      }}
    >
      {!isLoaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 10,
          }}
        >
          <div className="spinner"></div>
          <p>Loading Map...</p>
        </div>
      )}

      <iframe
        title="Google Satellite Map"
        width="100%"
        height="100%"
        src={mapSrc}
        onLoad={() => setIsLoaded(true)}
        allowFullScreen
        frameBorder="0"
      ></iframe>
    </div>
  );
};

export default GoogleMapEmbed;
