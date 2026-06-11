"use client";

import dynamic from "next/dynamic";
import { LeadModalProvider, useLeadModal } from "./LeadModalContext";

const LeadModal = dynamic(() => import("./LeadModal"), { ssr: false });

function LeadModalWhenOpen() {
  const { state } = useLeadModal();
  if (!state.isOpen) return null;
  return <LeadModal />;
}

/**
 * Mounts the global lead-capture modal and provides the context that any
 * client component can use via `useLeadModal()` / `<OpenLeadModalButton>`.
 *
 * Modal chunk loads only on first open to keep homepage TBT low.
 */
export default function LeadModalRoot({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LeadModalProvider>
      {children}
      <LeadModalWhenOpen />
    </LeadModalProvider>
  );
}
