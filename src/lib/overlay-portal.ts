/** Dedicated top-layer mount so lead UI stays above page content and receives clicks. */
let overlayRoot: HTMLElement | null = null;

export function getOverlayPortalRoot(): HTMLElement {
  if (typeof document === "undefined") {
    throw new Error("getOverlayPortalRoot requires document");
  }

  if (overlayRoot?.isConnected) return overlayRoot;

  overlayRoot = document.getElementById("taypro-overlay-root");
  if (!overlayRoot) {
    overlayRoot = document.createElement("div");
    overlayRoot.id = "taypro-overlay-root";
    document.body.appendChild(overlayRoot);
  }

  return overlayRoot;
}
