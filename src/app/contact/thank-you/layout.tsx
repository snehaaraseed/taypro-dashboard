import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You | Taypro – We Appreciate Your Interest",
  description:
    "Thank you for reaching out to Taypro. Our team will get back to you shortly with details on our solar panel cleaning solutions that deliver high efficiency, maximum ROI, and sustainable energy performance.",
  keywords:
    "thank you taypro, taypro contact success, solar cleaning robots, taypro solar solutions, solar maintenance robots, sustainable solar cleaning",
  openGraph: {
    title: "Thank You | Taypro – We Appreciate Your Interest",
    description:
      "Thank you for contacting Taypro. We’ll connect with you soon to discuss how our solar cleaning robots can enhance your solar plant performance and savings.",
    url: "https://taypro.in/contact/thank-you",
    type: "website",
  },
};

export default function ThankyouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
