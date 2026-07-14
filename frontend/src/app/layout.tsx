import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { PremiumBackground } from "@/components/layout/premium-background";
import { Splash } from "@/components/layout/splash";
import { AuthProvider } from "@/components/providers/auth-provider";
import { serverFetch } from "@/lib/server-api";
import type { SiteSettings } from "@/lib/types";

const DEFAULT_TITLE = "KOLOS — Академия барберов";
const DEFAULT_DESCRIPTION =
  "Премиальная платформа онлайн-обучения для барберов. Стрижки, бритьё с горячими полотенцами, борода, инструменты.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await serverFetch<SiteSettings>("/settings");
  return {
    title: settings?.meta_title || DEFAULT_TITLE,
    description: settings?.meta_description || DEFAULT_DESCRIPTION,
    icons: {
      icon: [
        { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0F1219", // --bg
  width: "device-width",
  initialScale: 1,
  // Lets content extend under the iPhone notch/home indicator instead of
  // leaving a hard white/black bar; paired with safe-area padding in CSS.
  viewportFit: "cover",
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await serverFetch<SiteSettings>("/settings");

  return (
    <html lang="ru" className="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: SW_CLEANUP }} />
      </head>
      <body className="font-sans antialiased">
        <Splash />
        <PremiumBackground />
        <AuthProvider>
          <Navbar />
          <main className="relative min-h-[calc(100dvh-4rem)]">{children}</main>
          <Footer settings={settings} />
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
