"use client";

import { useState, useEffect } from "react";
import { Youtube, Play } from "lucide-react";

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
  className?: string;
  thumbnailUrl?: string;
}

export default function YouTubeEmbed({
  videoId,
  title = "YouTube Video",
  className = "",
  thumbnailUrl,
}: YouTubeEmbedProps) {
  const [hasConsent, setHasConsent] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  useEffect(() => {
    // Check for cookie consent
    const checkConsent = () => {
      if (typeof window !== "undefined") {
        const consent = localStorage.getItem("cookie-consent");
        const preferences = localStorage.getItem("cookie-preferences");
        
        if (consent === "true") {
          // If consent given, check if marketing/analytics are enabled
          // YouTube embeds may set cookies, so we check for any consent
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

  const handleLoadVideo = () => {
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

  // Generate thumbnail URL if not provided
  const defaultThumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const embedUrl = `https://www.youtube.com/embed/${videoId}?si=69CgiggHsM73CRl_&loading=lazy`;

  if (!hasConsent && showPlaceholder) {
    return (
      <div
        className={`relative aspect-video bg-gray-900 rounded-lg overflow-hidden ${className}`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${thumbnailUrl || defaultThumbnail})`,
          }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center p-6">
            <div className="text-center mb-6">
              <Youtube className="w-16 h-16 text-white mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                Consent Required
              </h3>
              <p className="text-white text-sm max-w-md">
                This video is hosted on YouTube. To view it, please accept cookies
                in your browser settings. YouTube may set cookies for functionality
                and analytics.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleLoadVideo}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <Play className="w-5 h-5" />
                Load Video
              </button>
              <button
                onClick={handleManageConsent}
                className="px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg font-medium transition-colors"
              >
                Manage Cookies
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`aspect-video w-full ${className}`}>
      <iframe
        src={embedUrl}
        title={title}
        className="w-full h-full rounded-lg"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        loading="lazy"
      ></iframe>
    </div>
  );
}

