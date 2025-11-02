"use client";

import { usePathname } from "next/navigation";
import AdminNav from "./AdminNav";

export default function AdminNavWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const isMainAdminPage = pathname === "/admin";

  // Don't show nav on login page or main admin page (they handle their own layout)
  if (isLoginPage || isMainAdminPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

