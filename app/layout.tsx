import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { Suspense } from "react";
import Loader from "./components/Loader";
import Header from "./components/Header";
import RefinedAgencyCursor from "./components/AgencyCursor";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import JsonLd from "./components/JsonLd";
import ChatLiveLauncher from "./components/chat-live/ChatLiveLauncher";
import { siteIdentity, siteUrl } from "@/lib/site";

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

const title = "Jeet (Jitendra Suthar) — Senior Full Stack Developer";
const description =
  "Portfolio of Jitendra Suthar (Jeet), a senior full stack developer building production-grade products with architecture depth — system design, AI-assisted delivery, and shipped outcomes.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s — Jeet",
  },
  description,
  applicationName: "Jeet Portfolio",
  authors: [{ name: "Jitendra Suthar" }],
  creator: "Jitendra Suthar",
  keywords: [
    "Jeet",
    "Jitendra Suthar",
    "Full Stack Developer",
    "Senior Full Stack Developer",
    "Next.js Developer",
    "React Developer",
    "Node.js Developer",
    "AWS ECS Fargate",
    "System Design",
    "Software Engineer Portfolio",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>
        <JsonLd data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Person", name: siteIdentity.fullName, alternateName: siteIdentity.name, jobTitle: siteIdentity.jobTitle, url: siteUrl, sameAs: [siteIdentity.linkedin, siteIdentity.github] },
            { "@type": "WebSite", name: "Jeet Portfolio", url: siteUrl, author: { "@type": "Person", name: siteIdentity.fullName, alternateName: siteIdentity.name } },
          ],
        }} />
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-ink px-4 py-2 text-sm font-medium text-background transition-transform focus-visible:translate-y-0"
        >
          Skip to content
        </a>
        <Suspense fallback={<Loader />}>
          <Analytics />
          <SpeedInsights />
          <RefinedAgencyCursor />
          <Header />
          <main id="main-content" className="pt-16">{children}</main>
          <ChatLiveLauncher />
        </Suspense>
      </body>
    </html>
  );
}
