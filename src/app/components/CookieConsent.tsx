"use client";

import { useState, useEffect, useId } from "react";
import { X, Settings, Cookie } from "lucide-react";

type CookiePreferences = {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
};

const COOKIE_CONSENT_KEY = "cookie-consent";
const COOKIE_PREFERENCES_KEY = "cookie-preferences";
/** Keep banner out of Lighthouse / real-user LCP window. */
const BANNER_MIN_DELAY_MS = 12000;

function scheduleAfterDelay(callback: () => void, delayMs: number): () => void {
  const timer = window.setTimeout(callback, delayMs);
  return () => clearTimeout(timer);
}

export default function CookieConsent() {
  const fieldBaseId = useId();
  const [showBanner, setShowBanner] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, cannot be disabled
    analytics: false,
    marketing: false,
  });

  const applyCookiePreferences = (prefs: CookiePreferences) => {
    if (typeof window !== "undefined") {
      (window as Window & { cookieConsent?: CookiePreferences }).cookieConsent =
        prefs;
      window.dispatchEvent(
        new CustomEvent("cookieConsentUpdated", { detail: prefs })
      );
    }
  };

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (consent) {
      setHasConsent(true);
      const savedPrefs = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPrefs) {
        try {
          const prefs = JSON.parse(savedPrefs);
          setPreferences(prefs);
          applyCookiePreferences(prefs);
        } catch (e) {
          console.error("Error loading cookie preferences:", e);
        }
      }
      return;
    }

    // Fixed delay, requestIdleCallback can fire during the LCP measurement window.
    const scheduleBanner = () =>
      scheduleAfterDelay(() => setShowBanner(true), BANNER_MIN_DELAY_MS);

    if (document.readyState === "complete") {
      return scheduleBanner();
    }

    window.addEventListener("load", scheduleBanner, { once: true });
    return () => window.removeEventListener("load", scheduleBanner);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(prefs));
    setPreferences(prefs);
    setHasConsent(true);
    applyCookiePreferences(prefs);
  };

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    savePreferences(preferences);
    setShowSettings(false);
    setShowBanner(false);
  };

  useEffect(() => {
    if (!showBanner) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleRejectAll();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showBanner]);

  if (!showBanner) {
    if (!hasConsent) return null;

    return (
      <button
        onClick={() => {
          setShowBanner(true);
          setShowSettings(true);
        }}
        className="fixed bottom-4 right-4 z-50 bg-[#052638] text-white p-3 rounded-full shadow-lg hover:bg-[#0c3d56] transition-colors"
        aria-label="Cookie Settings"
        title="Cookie Settings"
      >
        <Cookie className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      {showBanner && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-[#052638] shadow-2xl"
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-modal="true"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {!showSettings ? (
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Cookie className="w-5 h-5 text-[#052638]" />
                    <h2
                      id="cookie-consent-title"
                      className="text-lg font-semibold text-[#052638]"
                    >
                      Cookie Consent
                    </h2>
                    </div>
                    <button
                      type="button"
                      onClick={handleRejectAll}
                      className="shrink-0 rounded-md p-2 text-[#052638] hover:bg-gray-100 hover:text-[#A8C117] transition-colors lg:hidden"
                      aria-label="Close and reject non-essential cookies"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[#052638] text-sm lg:text-base line-clamp-3 lg:line-clamp-none">
                    We use cookies to enhance your browsing experience, analyze
                    site traffic, and personalize content. By clicking "Accept
                    All", you consent to our use of cookies. You can customize
                    your preferences or reject non-essential cookies.{" "}
                    <a
                      href="/cookie-policy"
                      className="brand-inline-link"
                    >
                      Read our cookie policy
                    </a>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                  <button
                    onClick={handleRejectAll}
                    className="px-6 py-2 border-2 border-[#052638] text-[#052638] rounded hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-2 border-2 border-[#052638] text-[#052638] rounded hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Customize
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-2 bg-[#052638] text-white rounded hover:bg-[#0c3d56] transition-colors font-medium"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-4xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-[#052638]">
                    Cookie Preferences
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="text-[#052638] hover:text-[#A8C117] transition-colors"
                    aria-label="Close settings"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3
                          id={`${fieldBaseId}-necessary-label`}
                          className="font-semibold text-[#052638]"
                        >
                          Necessary Cookies
                        </h3>
                        <p className="text-sm text-gray-600">
                          Essential for the website to function properly. These
                          cannot be disabled.
                        </p>
                      </div>
                      <input
                        id={`${fieldBaseId}-necessary`}
                        type="checkbox"
                        checked={preferences.necessary}
                        disabled
                        aria-labelledby={`${fieldBaseId}-necessary-label`}
                        className="w-5 h-5 text-[#A8C117] rounded border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3
                          id={`${fieldBaseId}-analytics-label`}
                          className="font-semibold text-[#052638]"
                        >
                          Analytics Cookies
                        </h3>
                        <p className="text-sm text-gray-600">
                          Help us understand how visitors interact with our
                          website by collecting anonymous information.
                        </p>
                      </div>
                      <input
                        id={`${fieldBaseId}-analytics`}
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            analytics: e.target.checked,
                          })
                        }
                        aria-labelledby={`${fieldBaseId}-analytics-label`}
                        className="w-5 h-5 text-[#A8C117] rounded border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3
                          id={`${fieldBaseId}-marketing-label`}
                          className="font-semibold text-[#052638]"
                        >
                          Marketing Cookies
                        </h3>
                        <p className="text-sm text-gray-600">
                          Used to track visitors across websites for marketing
                          purposes (currently not used, but option available for
                          future use).
                        </p>
                      </div>
                      <input
                        id={`${fieldBaseId}-marketing`}
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) =>
                          setPreferences({
                            ...preferences,
                            marketing: e.target.checked,
                          })
                        }
                        aria-labelledby={`${fieldBaseId}-marketing-label`}
                        className="w-5 h-5 text-[#A8C117] rounded border-gray-300"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-6 py-2 border-2 border-[#052638] text-[#052638] rounded hover:bg-gray-50 transition-colors font-medium"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className="px-6 py-2 border-2 border-[#052638] text-[#052638] rounded hover:bg-gray-50 transition-colors font-medium"
                  >
                    Reject All
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="px-6 py-2 bg-[#052638] text-white rounded hover:bg-[#0c3d56] transition-colors font-medium flex-1 sm:flex-initial"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

