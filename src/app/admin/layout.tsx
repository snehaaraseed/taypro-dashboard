import type { Metadata } from "next";
import AdminNavWrapper from "./components/AdminNavWrapper";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

// Auth check is now handled by middleware.ts
// This layout just provides the admin UI structure
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminNavWrapper>{children}</AdminNavWrapper>;
}

