import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Blog (internal) | Taypro",
  description: "Internal blog composer. Not for public consumption.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AddBlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
