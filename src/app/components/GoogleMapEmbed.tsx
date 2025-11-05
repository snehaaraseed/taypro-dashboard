"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Settings } from "lucide-react";

interface GoogleMapEmbedProps {
  latitude: number;
  longitude: number;
}

export const GoogleMapEmbed = ({
  latitude,
  longitude,
}: GoogleMapEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const mapSrc = `https://maps.google.com/maps?hl=en&q=${latitude},${longitude}&t=k&z=18&ie=UTF8&iwloc=B&output=embed`;

  useEffect(() => {
    // Check for cookie consent
    const checkConsent = () => {
      if (typeof window !== "undefined") {
        const consent = localStorage.getItem("cookie-consent");
        const preferences = localStorage.getItem("cookie-preferences");
        
        if (consent === "true") {
          // If consent given, check if marketing/analytics are enabled
          // Google Maps may set cookies, so we check for any consent
          setHasConsent(true);
        } else if ((window as any).cookieConsent) {
          // Check runtime consent state
          const prefs = (window as any).cookieConsent;
          if (prefs?.marketing || prefs?.analytics) {
            setHasConsent(true);
          }
        } else if (preferences) {
          try {
            const prefs = JSON.parse(preferences);
            if (prefs.marketing || prefs.analytics) {
              setHasConsent(true);
            }
          } catch (e) {
            // Invalid preferences
          }
        }
      }
    };

    checkConsent();

    // Listen for consent updates
    const handleConsentUpdate = () => {
      checkConsent();
    };

    window.addEventListener("cookieConsentUpdated", handleConsentUpdate);

    return () => {
      window.removeEventListener("cookieConsentUpdated", handleConsentUpdate);
    };
  }, []);

  const handleLoadMap = () => {
    setHasConsent(true);
    setShowPlaceholder(false);
  };

  const handleManageConsent = () => {
    // Trigger cookie consent banner
    const cookieButton = document.querySelector(
      '[aria-label="Cookie Settings"], button:has(svg.cookie-icon)'
    ) as HTMLButtonElement;
    if (cookieButton) {
      cookieButton.click();
    } else {
      // Fallback: show cookie policy page
      window.location.href = "/cookie-policy";
    }
  };

  if (!hasConsent && showPlaceholder) {
    return (
      <div
        style={{
          position: "relative",
          height: "415px",
          width: "100%",
          overflow: "hidden",
          backgroundColor: "#f3f4f6",
          borderRadius: "8px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            zIndex: 10,
            padding: "2rem",
            maxWidth: "400px",
          }}
        >
          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-gray-900 text-xl font-semibold mb-2">
            Consent Required
          </h3>
          <p className="text-gray-600 text-sm mb-6">
            This map is hosted on Google Maps. To view it, please accept cookies
            in your browser settings. Google Maps may set cookies for
            functionality and analytics.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleLoadMap}
              className="px-6 py-3 bg-[#052638] hover:bg-[#0c3d56] text-white rounded-lg font-medium transition-colors"
            >
              Load Map
            </button>
            <button
              onClick={handleManageConsent}
              className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 border border-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Manage Cookies
            </button>
          </div>
        </div>
      </div>
    );
  }

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
