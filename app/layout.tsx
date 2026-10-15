import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";
import AppShell from "@/components/AppShell";
import ConfettiLayer from "@/components/ConfettiLayer";

const display = Baloo_2({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-display", display: "swap" });
const body = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "Persuado",
  description: "Essay and debate training for 10 to 13 year olds.",
  appleWebApp: { capable: true, title: "Persuado", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#FFF1E8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-GB" className={`${display.variable} ${body.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
        <ConfettiLayer />
      </body>
    </html>
  );
}
