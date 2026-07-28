"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BookOpen, User, LogIn, LayoutDashboard } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  const items = [
    { href: "/", label: "Главная", icon: Home, exact: true },
    { href: "/courses", label: "Курсы", icon: BookOpen, exact: false },
    isAuthenticated
      ? { href: "/cabinet", label: "Кабинет", icon: User, exact: false }
      : { href: "/auth/login", label: "Войти", icon: LogIn, exact: false },
    ...(user?.role === "admin"
      ? [{ href: "/admin", label: "Админ", icon: LayoutDashboard, exact: false }]
      : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-border">
      <div className="flex items-center justify-around h-16 pb-[env(safe-area-inset-bottom)]">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-3 py-1 text-[11px] transition-colors"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full transition-colors",
                  active ? "bg-inverse text-on-inverse" : "text-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <span className={active ? "text-text" : "text-muted"}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
