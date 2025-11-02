import AdminNavWrapper from "./components/AdminNavWrapper";

// Auth check is now handled by middleware.ts
// This layout just provides the admin UI structure
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminNavWrapper>{children}</AdminNavWrapper>;
}

