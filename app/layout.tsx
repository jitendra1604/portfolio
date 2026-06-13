import "./globals.css";
import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import Loader from "./components/Loader";
import Header from "./components/Header";
import RefinedAgencyCursor from "./components/AgencyCursor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3004";
const title = "Jeet — Senior Full Stack Developer";
const description =
  "Portfolio of Jeet, a senior full stack developer building production-grade products with architecture depth — system design, AI-assisted delivery, and shipped outcomes.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — Jeet",
  },
  description,
  applicationName: "Jeet Portfolio",
  authors: [{ name: "Jeet" }],
  creator: "Jeet",
  keywords: [
    "Full Stack Developer",
    "Software Engineer",
    "Next.js",
    "React",
    "System Design",
    "Portfolio",
  ],
  icons: {
    icon: "/jeet-logo.png",
    shortcut: "/jeet-logo.png",
    apple: "/jeet-logo.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Jeet — Portfolio",
    title,
    description,
    locale: "en_US",
    images: [
      {
        url: "/profile.png",
        width: 1200,
        height: 630,
        alt: "Jeet — Senior Full Stack Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/profile.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <Suspense fallback={<Loader />}>
          <RefinedAgencyCursor />
          <Header />
          <main className="pt-16">{children}</main>
        </Suspense>
      </body>
    </html>
  );
}
