"use client";

import { LeadModalProvider } from "./LeadModalContext";
import LeadModal from "./LeadModal";

/**
 * Mounts the global lead-capture modal and provides the context that any
 * client component can use via `useLeadModal()` / `<OpenLeadModalButton>`.
 *
 * Wraps the entire app once from the root layout.
 */
export default function LeadModalRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LeadModalProvider>
      {children}
      <LeadModal />
    </LeadModalProvider>
  );
}
