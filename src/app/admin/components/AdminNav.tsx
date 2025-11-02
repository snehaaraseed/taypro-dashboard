"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function AdminNav() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold text-[#052638]">
              Admin Panel
            </h1>
            <div className="flex gap-4">
              <Link
                href="/admin/blogs"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname?.startsWith("/admin/blogs")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-[#052638] hover:bg-gray-100"
                }`}
              >
                Blogs
              </Link>
              <Link
                href="/admin/projects"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname?.startsWith("/admin/projects")
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-[#052638] hover:bg-gray-100"
                }`}
              >
                Projects
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

