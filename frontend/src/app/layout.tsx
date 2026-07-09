import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { PremiumBackground } from "@/components/layout/premium-background";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = {
  title: "KOLOS — Академия барберов",
  description:
    "Премиальная платформа онлайн-обучения для барберов. Стрижки, бритьё с горячими полотенцами, борода, инструменты.",
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

const SW_CLEANUP = `
(function(){
  try {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(function(regs){
        regs.forEach(function(r){ r.unregister(); });
      });
    }
    if ('caches' in window) {
      caches.keys().then(function(keys){
        keys.forEach(function(k){ caches.delete(k); });
      });
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: SW_CLEANUP }} />
      </head>
      <body className="font-sans antialiased">
        <PremiumBackground />
        <AuthProvider>
          <Navbar />
          <main className="relative min-h-[calc(100vh-4rem)]">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
