import Link from "next/link";
import { Tag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="container mx-auto px-4 -mt-8 mb-4">
      <div className="premium-card flex flex-col sm:flex-row items-center justify-between gap-4 border-copper-500/30 bg-gradient-to-r from-copper-950/40 to-transparent">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-copper-500/20">
            <Tag className="h-5 w-5 text-copper-400" />
          </div>
          <div>
            <p className="font-semibold text-copper-100">Промокод KOLOS10 — скидка 10%</p>
            <p className="text-sm text-muted-foreground">Введите на странице курса перед оплатой</p>
          </div>
        </div>
        <Link href="/courses">
          <Button>Выбрать курс</Button>
        </Link>
      </div>
    </section>
  );
}
