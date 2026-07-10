import Link from "next/link";
import { Instagram, Mail, MapPin, MessageCircle, Phone, Scissors, Send } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const hasContacts =
    settings?.contact_email || settings?.contact_phone || settings?.contact_address;
  const hasSocial =
    settings?.social_instagram || settings?.social_telegram || settings?.social_whatsapp || settings?.social_vk;

  return (
    <footer className="border-t border-copper-500/10 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-copper-600 to-copper-800 shadow-lg shadow-copper-900/50">
                <Scissors className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-[0.2em] gradient-text">KOLOS</span>
            </Link>
            <p className="text-sm text-muted-foreground mt-3 max-w-xs">
              Премиальная академия барберинга: стрижки, бритьё, уход за бородой.
            </p>
          </div>

          {hasContacts && (
            <div>
              <h3 className="text-sm font-semibold text-copper-400 mb-3 uppercase tracking-wide">Контакты</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {settings?.contact_email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-copper-500" />
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-foreground">
                      {settings.contact_email}
                    </a>
                  </li>
                )}
                {settings?.contact_phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0 text-copper-500" />
                    <a href={`tel:${settings.contact_phone.replace(/[^+\d]/g, "")}`} className="hover:text-foreground">
                      {settings.contact_phone}
                    </a>
                  </li>
                )}
                {settings?.contact_address && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-copper-500" />
                    {settings.contact_address}
                  </li>
                )}
              </ul>
            </div>
          )}

          {hasSocial && (
            <div>
              <h3 className="text-sm font-semibold text-copper-400 mb-3 uppercase tracking-wide">Мы в соцсетях</h3>
              <div className="flex gap-3">
                {settings?.social_instagram && (
                  <a
                    href={settings.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {settings?.social_telegram && (
                  <a
                    href={settings.social_telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5"
                    aria-label="Telegram"
                  >
                    <Send className="h-4 w-4" />
                  </a>
                )}
                {settings?.social_whatsapp && (
                  <a
                    href={settings.social_whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
                {settings?.social_vk && (
                  <a
                    href={settings.social_vk}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 hover:bg-white/5"
                    aria-label="VK"
                  >
                    <span className="text-xs font-bold">VK</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 text-xs text-muted-foreground">
          {settings?.footer_text || `© ${new Date().getFullYear()} KOLOS. Все права защищены.`}
        </div>
      </div>
    </footer>
  );
}
