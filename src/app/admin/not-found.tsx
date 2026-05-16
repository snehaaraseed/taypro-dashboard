import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found | Taypro Admin",
  robots: { index: false, follow: false },
};

export default function AdminNotFoundPage() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-[#A8C117]">
        404
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-[#052638]">
        Admin page not found
      </h1>
      <p className="mt-3 max-w-md text-gray-600">
        This admin URL does not exist. The dashboard is still available.
      </p>
      <Link
        href="/admin"
        className="mt-8 inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[#A8C117] px-6 py-2.5 font-semibold text-[#052638] hover:bg-[#b3cf3d] transition"
      >
        Back to admin home
      </Link>
    </div>
  );
}
