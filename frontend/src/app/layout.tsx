import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { YandexMetrika } from "@/components/analytics/yandex-metrika";
import { Navbar } from "@/components/layout/navbar";
import { PremiumBackground } from "@/components/layout/premium-background";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "KOLOS — Академия барберов",
  description: "Премиальная платформа онлайн-обучения для барберов. Стрижки, бритьё с горячими полотенцами, борода, инструменты.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "KOLOS",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <PremiumBackground />
        <AuthProvider>
          <Navbar />
          <main className="relative min-h-[calc(100vh-4rem)]">{children}</main>
        </AuthProvider>
        <YandexMetrika />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
