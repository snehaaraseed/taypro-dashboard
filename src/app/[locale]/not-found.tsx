import type { Metadata } from "next";
import NotFoundClient from "@/app/components/NotFoundClient";

// Static metadata (404 is noindex). Localized visible copy is rendered by
// <NotFoundClient/> via the intl provider context. Keeping this file free of
// dynamic APIs (headers/getLocale/getTranslations) is what allows the whole
// [locale] segment to be statically rendered and edge-cached.
export const metadata: Metadata = {
  title: "Page not found | Taypro",
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return <NotFoundClient />;
}
