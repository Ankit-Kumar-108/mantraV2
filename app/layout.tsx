import type { Metadata } from "next";
import { Montserrat, Geist_Mono } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AURA – Modern Music Streaming Platform",
  description: "A high-fidelity, immersive music streaming experience combining premium aesthetics with deep discovery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${geistMono.variable} h-full antialiased`}
      data-theme="sonic-deep"
    >
      <body className="min-h-full flex flex-col bg-[#121414] text-white overflow-hidden select-none">
        {/* Retro-Futurist Grid overlays */}
        <div className="cyber-grid-overlay" />
        <div className="cyber-scanlines-overlay" />
        
        {children}
      </body>
    </html>
  );
}
