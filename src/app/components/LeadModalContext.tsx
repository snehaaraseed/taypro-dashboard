"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { trackLeadModalOpen } from "@/lib/analytics/track-event";
import type { LeadModalOpenOptions } from "./lead-modal-options";

export type { LeadModalOpenOptions } from "./lead-modal-options";

interface LeadModalState extends LeadModalOpenOptions {
  isOpen: boolean;
}

interface LeadModalContextValue {
  state: LeadModalState;
  openLeadModal: (opts?: LeadModalOpenOptions) => void;
  closeLeadModal: () => void;
}

export const LeadModalContext = createContext<LeadModalContextValue | null>(null);

export function LeadModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LeadModalState>({ isOpen: false });

  const openLeadModal = useCallback((opts?: LeadModalOpenOptions) => {
    trackLeadModalOpen({ source: opts?.source, topic: opts?.topic });
    setState({
      isOpen: true,
      topic: opts?.topic,
      source: opts?.source,
      title: opts?.title,
      subtitle: opts?.subtitle,
      leadIntent: opts?.leadIntent,
      formPrompt: opts?.formPrompt,
      showMessageField: opts?.showMessageField,
      showCompanyField: opts?.showCompanyField,
      messageLabel: opts?.messageLabel,
      messagePlaceholder: opts?.messagePlaceholder,
      submitLabel: opts?.submitLabel,
      thankYouTitle: opts?.thankYouTitle,
      thankYouMessage: opts?.thankYouMessage,
      analyticsFormType: opts?.analyticsFormType,
    });
  }, []);

  const closeLeadModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = useMemo(
    () => ({ state, openLeadModal, closeLeadModal }),
    [state, openLeadModal, closeLeadModal]
  );

  return (
    <LeadModalContext.Provider value={value}>
      {children}
    </LeadModalContext.Provider>
  );
}

export function useLeadModal(): LeadModalContextValue {
  const ctx = useContext(LeadModalContext);
  if (!ctx) {
    throw new Error("useLeadModal must be used inside <LeadModalProvider>");
  }
  return ctx;
}
