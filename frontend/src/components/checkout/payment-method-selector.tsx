"use client";

import { CreditCard, Landmark, Smartphone, Wallet, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaymentMethodOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "credit-card": CreditCard,
  smartphone: Smartphone,
  landmark: Landmark,
  wallet: Wallet,
  zap: Zap,
};

interface PaymentMethodSelectorProps {
  methods: PaymentMethodOption[];
  selected: string;
  onSelect: (id: string) => void;
}

export function PaymentMethodSelector({ methods, selected, onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted uppercase tracking-wider">Способ оплаты</p>
      <div className="grid grid-cols-1 gap-2">
        {methods.map((method) => {
          const Icon = ICONS[method.icon] || CreditCard;
          const isSelected = selected === method.id;
          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onSelect(method.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                isSelected
                  ? "border-accent/50 bg-accent/10 shadow-lg shadow-bg/20"
                  : "border-text/10 bg-text/[0.02] hover:border-accent/20"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                isSelected ? "bg-accent/20 text-accent" : "bg-text/5 text-muted"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{method.title}</p>
                <p className="text-xs text-muted">{method.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
