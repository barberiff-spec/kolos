import { Award, CreditCard, ShieldCheck, Zap } from "lucide-react";

const items = [
  { icon: ShieldCheck, text: "Безопасная оплата через ЮKassa" },
  { icon: CreditCard, text: "Карта, СБП, SberPay, ЮMoney" },
  { icon: Zap, text: "Доступ сразу после оплаты" },
  { icon: Award, text: "Именной сертификат KOLOS" },
];

export function CheckoutTrust() {
  return (
    <div className="rounded-xl border border-copper-500/10 bg-white/[0.02] p-4 space-y-3">
      {items.map((item) => (
        <div key={item.text} className="flex items-center gap-3 text-xs text-muted-foreground">
          <item.icon className="h-4 w-4 shrink-0 text-copper-500" />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}
