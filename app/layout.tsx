import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import Loader from "./components/Loader";
import Header from "./components/Header";
import CustomCursor from "./components/CustomCursor";
import RefinedAgencyCursor from "./components/AgencyCursor";


export const metadata: Metadata = {
  title: "GSAP Next App",
  description: "High-performance animations with GSAP and Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<Loader />}>
         <RefinedAgencyCursor />
         <CustomCursor />
         <Header />
        <main className="pt-16">{children}</main>
        </Suspense>
      </body>
    </html>
  );
}