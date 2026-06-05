"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin page error:", error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-lg border border-red-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-semibold text-[#052638] mb-2">
          Admin page failed to load
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          {error.message ||
            "Something went wrong while loading this admin screen."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center rounded-md bg-[#A8C117] px-4 py-2 text-sm font-medium text-white hover:bg-lime-500"
          >
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.assign("/admin")}
            className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
