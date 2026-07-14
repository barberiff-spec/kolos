import { Award, CreditCard, ShieldCheck, Zap } from "lucide-react";

const items = [
  { icon: ShieldCheck, text: "Безопасная оплата через ЮKassa" },
  { icon: CreditCard, text: "Карта, СБП, SberPay, ЮMoney" },
  { icon: Zap, text: "Доступ сразу после оплаты" },
  { icon: Award, text: "Именной сертификат KOLOS" },
];

export function CheckoutTrust() {
  return (
    <div className="rounded-xl border border-accent/10 bg-text/[0.02] p-4 space-y-3">
      {items.map((item) => (
        <div key={item.text} className="flex items-center gap-3 text-xs text-muted">
          <item.icon className="h-4 w-4 shrink-0 text-accent" />
          <span>{item.text}</span>
        </div>
      ))}
    </div>
  );
}
