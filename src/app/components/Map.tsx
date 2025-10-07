"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const factoryIcon = L.divIcon({
  html: `
    <div style="
      display:flex;
      justify-content:center;
      align-items:center;
      width:40px;
      height:40px;
      border-radius:50%;
      background:#1d1d3a;
      animation: pulse-bulking 1s infinite;
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="white" viewBox="0 0 24 24">
        <path d="M5 11.5H7V16H9V11.5H11V16H13V11.5H15V16H17V9.5H19V16H21V7.5H19V3H17V7.5H15V3H13V7.5H11V3H9V7.5H7V3H5V7.5Z"/>
      </svg>
    </div>
  `,
  className: "",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function Map() {
  return (
    <MapContainer
      center={[18.735204, 73.8519138]}
      zoom={13}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Esri & OpenStreetMap contributors"
      />
      <Marker position={[18.735204, 73.8519138]} icon={factoryIcon}>
        <Popup>
          <div style={{ padding: "0 1rem", minWidth: "340px" }}>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 500,
                marginBottom: "1rem",
                color: "#19324C",
              }}
            >
              Manufacturing Unit
            </div>
            <div
              style={{ fontSize: "1.14rem", color: "#19324C", lineHeight: 1.5 }}
            >
              <strong>TAYPRO MANUFACTURING HUB</strong>
              <br />
              Plot No 87, Survey No 286/2, near Saint Gobain, Chakan, Pune,
              <br />
              Maharashtra, India-410501
            </div>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
