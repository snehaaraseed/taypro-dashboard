"use client";

import { useEffect, type CSSProperties } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const TAYPRO_LOCATIONS = [
  {
    id: "headquarters",
    position: [18.634847, 73.799194] as [number, number],
    title: "Corporate headquarters",
    label: "TAYPRO HEADQUARTERS",
    address:
      "T3-906, Kohinoor World Towers, Pimpri Colony, Pune, Maharashtra, India 411019",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=T3-906+Kohinoor+World+Towers+Pimpri+Colony+Pune+411019",
    icon: "headquarters" as const,
  },
  {
    id: "manufacturing",
    position: [18.735204, 73.8519138] as [number, number],
    title: "Manufacturing unit",
    label: "TAYPRO MANUFACTURING HUB",
    address:
      "Plot No 87, Survey No 286/2, near Saint Gobain, Chakan, Pune, Maharashtra, India 410501",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=18.735204,73.8519138",
    icon: "manufacturing" as const,
  },
] as const;

const mapsLinkStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  marginTop: "0.75rem",
  fontSize: "0.9rem",
  fontWeight: 600,
  color: "#5a7f00",
  textDecoration: "none",
};

function GoogleMapsLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={mapsLinkStyle}
      onMouseOver={(e) => {
        e.currentTarget.style.textDecoration = "underline";
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.textDecoration = "none";
      }}
    >
      {label}
      <span aria-hidden>↗</span>
    </a>
  );
}

function markerIcon(kind: "headquarters" | "manufacturing") {
  const isHq = kind === "headquarters";
  const background = isHq ? "#5a7f00" : "#1d1d3a";
  const svg = isHq
    ? `<path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M6 8H4a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>`
    : `<path d="M5 11.5H7V16H9V11.5H11V16H13V11.5H15V16H17V9.5H19V16H21V7.5H19V3H17V7.5H15V3H13V7.5H11V3H9V7.5H7V3H5V7.5Z"/>`;

  return L.divIcon({
    html: `
    <div style="
      display:flex;
      justify-content:center;
      align-items:center;
      width:40px;
      height:40px;
      border-radius:50%;
      background:${background};
      animation: pulse-bulking 1s infinite;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
    ">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        ${svg}
      </svg>
    </div>
  `,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}

const headquartersIcon = markerIcon("headquarters");
const manufacturingIcon = markerIcon("manufacturing");

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 14);
      return;
    }
    map.fitBounds(L.latLngBounds(positions), {
      padding: [56, 56],
      maxZoom: 11,
    });
  }, [map, positions]);

  return null;
}

export default function Map() {
  const positions = TAYPRO_LOCATIONS.map((loc) => loc.position);

  return (
    <MapContainer
      center={positions[0]}
      zoom={11}
      scrollWheelZoom={false}
      style={{ width: "100%", height: "100%" }}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="&copy; Esri & OpenStreetMap contributors"
      />
      <FitBounds positions={positions} />
      {TAYPRO_LOCATIONS.map((loc) => (
        <Marker
          key={loc.id}
          position={loc.position}
          icon={loc.icon === "headquarters" ? headquartersIcon : manufacturingIcon}
        >
          <Tooltip
            direction="top"
            offset={[0, -42]}
            interactive
            opacity={0.95}
          >
            <span style={{ fontWeight: 600 }}>{loc.title}</span>
            <br />
            <GoogleMapsLink href={loc.mapsUrl} label="Open in Google Maps" />
          </Tooltip>
          <Popup>
            <div style={{ padding: "0 1rem", minWidth: "280px" }}>
              <div
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  color: "#19324C",
                }}
              >
                {loc.title}
              </div>
              <div
                style={{ fontSize: "0.95rem", color: "#19324C", lineHeight: 1.5 }}
              >
                <strong>{loc.label}</strong>
                <br />
                {loc.address}
              </div>
              <GoogleMapsLink href={loc.mapsUrl} label="Open in Google Maps" />
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
