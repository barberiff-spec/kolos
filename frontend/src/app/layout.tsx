import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { YandexMetrika } from "@/components/analytics/yandex-metrika";
import { Navbar } from "@/components/layout/navbar";
import { PremiumBackground } from "@/components/layout/premium-background";
import { AuthProvider } from "@/components/providers/auth-provider";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin", "cyrillic"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "KOLOS — Академия барберов",
  description: "Премиальная платформа онлайн-обучения для барберов. Стрижки, бритьё с горячими полотенцами, борода, инструменты.",
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
      </body>
    </html>
  );
}
