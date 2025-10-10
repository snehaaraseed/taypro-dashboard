// import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { Blinker } from "next/font/google";

import "./globals.css";
const blinker = Blinker({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "600", "700", "800", "900"],
});
// export const metadata: Metadata = {
//   title: "TAYPRO - Solar Panel Cleaning Solutions",
//   description:
//     "Automatic Solar Panel Cleaning Robots for efficient maintenance",
// };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/tayproasset/taypro-favicon.png" sizes="any" />
      </head>
      <body className={blinker.className}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
