"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KolosLogo } from "@/components/KolosLogo";
import { useAuthStore } from "@/store/auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/cabinet";
  const mode = searchParams.get("mode");
  const { login, register } = useAuthStore();
  const [isRegister, setIsRegister] = useState(mode === "register" || redirect.includes("/course/"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", password: "", fullName: "" });

  useEffect(() => {
    if (mode === "register" || redirect.includes("/course/")) {
      setIsRegister(true);
    }
  }, [mode, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isRegister) {
        await register(form.email, form.password, form.fullName);
      } else {
        await login(form.email, form.password);
      }
      router.push(redirect);
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Ошибка авторизации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <KolosLogo size={29} className="text-accent mx-auto mb-4" />
            <CardTitle>{isRegister ? "Регистрация" : "Вход в KOLOS"}</CardTitle>
            <CardDescription>
              {isRegister
                ? redirect.includes("/course/")
                  ? "Создайте аккаунт — и сразу перейдёте к оплате курса"
                  : "Создайте аккаунт барбера"
                : "Войдите в академию KOLOS"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Загрузка..." : isRegister ? "Зарегистрироваться" : "Войти"}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
              </button>
            </div>

            {!isRegister && process.env.NEXT_PUBLIC_SHOW_DEMO === "true" && (
              <div className="mt-6 rounded-xl bg-text/5 p-4 text-xs text-muted space-y-1">
                <p className="font-medium text-text">Демо-аккаунты:</p>
                <p>Admin: admin@kolos.bar / admin123</p>
                <p>Student: student@kolos.bar / student123</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100dvh-4rem)] flex items-center justify-center text-muted">
          Загрузка…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
