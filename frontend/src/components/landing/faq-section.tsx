"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FAQ } from "@/lib/types";

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<number | null>(faqs[0]?.id ?? null);

  if (!faqs.length) return null;

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3 font-[family-name:var(--font-playfair)]">Частые вопросы</h2>
        <p className="text-muted-foreground">Всё, что нужно знать перед стартом</p>
      </div>
      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((faq) => {
          const open = openId === faq.id;
          return (
            <div key={faq.id} className="premium-card p-0 overflow-hidden border-copper-500/10">
              <button
                className="w-full flex items-center justify-between p-5 text-left"
                onClick={() => setOpenId(open ? null : faq.id)}
              >
                <span className="font-medium pr-4">{faq.question}</span>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 text-copper-500 shrink-0 transition-transform",
                    open && "rotate-180"
                  )}
                />
              </button>
              {open && (
                <p className="px-5 pb-5 text-muted-foreground leading-relaxed">{faq.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
