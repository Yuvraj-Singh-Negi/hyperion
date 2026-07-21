import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hyperion — Autonomous AI War Room",
  description:
    "Hyperion orchestrates autonomous AI agents that detect, analyze, simulate and neutralize enterprise crises before humans finish the first meeting.",
  openGraph: {
    title: "Hyperion — Autonomous AI War Room",
    description:
      "Enterprise-grade autonomous threat detection and mitigation platform.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-obsidian text-pearl font-sans">
        {children}
      </body>
    </html>
  );
}
