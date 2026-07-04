"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Award, BookOpen, LayoutDashboard, LogIn, LogOut, Menu, Scissors, User, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth";
import { cn } from "@/lib/utils";

const links = [
  { href: "/courses", label: "Курсы", icon: BookOpen },
  { href: "/cabinet", label: "Кабинет", icon: User, auth: true },
  { href: "/certificates", label: "Сертификаты", icon: Award, auth: true },
  { href: "/admin", label: "Админ", icon: LayoutDashboard, admin: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleLinks = links.filter((link) => {
    if (link.auth && !isAuthenticated) return false;
    if (link.admin && user?.role !== "admin") return false;
    return true;
  });

  return (
    <header className="sticky top-0 z-50 border-b border-copper-500/10 glass">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-copper-600 to-copper-800 shadow-lg shadow-copper-900/50 group-hover:scale-105 transition-transform copper-glow">
            <Scissors className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-bold tracking-[0.2em] gradient-text">KOLOS</span>
            <span className="text-[10px] text-muted-foreground tracking-widest uppercase">Академия барберов</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all duration-300",
                pathname.startsWith(link.href)
                  ? "bg-copper-500/10 text-copper-300 border border-copper-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">{user?.full_name}</span>
              <Button variant="ghost" size="sm" onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
                Выйти
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login?mode=register">
                <Button variant="ghost" size="sm">
                  Регистрация
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="sm">
                  <LogIn className="h-4 w-4" />
                  Войти
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-copper-500/10 p-4 space-y-2"
        >
          {visibleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm hover:bg-white/5"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </header>
  );
}
