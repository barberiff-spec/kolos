import Link from "next/link";
import { Tag } from "lucide-react";

export function PromoBanner({ text }: { text?: string }) {
  return (
    <section className="bg-charcoal text-on-inverse mt-10 md:mt-14">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-on-inverse/20">
            <Tag className="h-4 w-4" />
          </div>
          <div>
            <p className="font-semibold">{text || "Промокод KOLOS10 — скидка 10%"}</p>
            <p className="text-sm text-on-inverse/60">Введите на странице курса перед оплатой</p>
          </div>
        </div>
        <Link
          href="/courses"
          className="group inline-flex items-center gap-3 rounded-full bg-on-inverse py-2 pl-5 pr-2 text-inverse shadow-inverse hover:brightness-95 transition-[filter,transform] hover:-translate-y-0.5"
        >
          <span className="text-sm font-medium">Выбрать курс</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-inverse text-on-inverse">
            <Tag className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </section>
  );
}
