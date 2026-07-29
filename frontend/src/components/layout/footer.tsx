import Link from "next/link";
import { Instagram, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { KolosLogo } from "@/components/KolosLogo";
import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings | null }) {
  const hasContacts =
    settings?.contact_email || settings?.contact_phone || settings?.contact_address;
  const hasSocial =
    settings?.social_instagram || settings?.social_telegram || settings?.social_whatsapp || settings?.social_vk;

  return (
    <footer className="bg-charcoal text-on-inverse mt-20 pb-[var(--bottom-nav-h)]">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <KolosLogo size={24} className="text-on-inverse" />
              <span className="text-xl font-bold tracking-[0.2em]">KOLOS</span>
            </Link>
            <p className="text-sm text-on-inverse/50 mt-3 max-w-xs">
              Премиальная академия барберинга: стрижки, бритьё, уход за бородой.
            </p>
          </div>

          {hasContacts && (
            <div>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide">Контакты</h3>
              <ul className="space-y-2 text-sm text-on-inverse/60">
                {settings?.contact_email && (
                  <li className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0" />
                    <a href={`mailto:${settings.contact_email}`} className="hover:text-on-inverse">
                      {settings.contact_email}
                    </a>
                  </li>
                )}
                {settings?.contact_phone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <a href={`tel:${settings.contact_phone.replace(/[^+\d]/g, "")}`} className="hover:text-on-inverse">
                      {settings.contact_phone}
                    </a>
                  </li>
                )}
                {settings?.contact_address && (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    {settings.contact_address}
                  </li>
                )}
              </ul>
            </div>
          )}

          {hasSocial && (
            <div>
              <h3 className="text-sm font-semibold mb-3 uppercase tracking-wide">Мы в соцсетях</h3>
              <div className="flex gap-3">
                {settings?.social_instagram && (
                  <a
                    href={settings.social_instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-on-inverse/15 hover:bg-on-inverse/10"
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-on-inverse/15 hover:bg-on-inverse/10"
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-on-inverse/15 hover:bg-on-inverse/10"
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-on-inverse/15 hover:bg-on-inverse/10"
                    aria-label="VK"
                  >
                    <span className="text-xs font-bold">VK</span>
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-6 border-t border-on-inverse/10 text-xs text-on-inverse/40">
          {settings?.footer_text || `© ${new Date().getFullYear()} KOLOS. Все права защищены.`}
        </div>
      </div>
    </footer>
  );
}
