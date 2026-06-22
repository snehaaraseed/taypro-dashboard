"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { trackLeadModalOpen } from "@/lib/analytics/track-event";

export interface LeadModalOpenOptions {
  /** Short label shown as an eyebrow chip on the modal (e.g. "Request a quote"). */
  topic?: string;
  /** Free-form analytics source string. Stored in state so analytics can read it. */
  source?: string;
  /** Override the modal heading. */
  title?: string;
  /** Override the modal sub-heading. */
  subtitle?: string;
}

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
    });
  }, []);

  const closeLeadModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const value = useMemo(
    () => ({ state, openLeadModal, closeLeadModal }),
    [state, openLeadModal, closeLeadModal],
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
