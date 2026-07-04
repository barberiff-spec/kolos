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
      <p className="text-xs text-muted-foreground uppercase tracking-wider">Способ оплаты</p>
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
                  ? "border-copper-500/50 bg-copper-500/10 shadow-lg shadow-copper-900/20"
                  : "border-white/10 bg-white/[0.02] hover:border-copper-500/20"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg",
                isSelected ? "bg-copper-500/20 text-copper-400" : "bg-white/5 text-muted-foreground"
              )}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{method.title}</p>
                <p className="text-xs text-muted-foreground">{method.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
