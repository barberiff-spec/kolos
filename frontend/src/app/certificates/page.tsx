"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Award, Copy, CheckCircle2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Certificate } from "@/lib/types";

export default function CertificatesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    api.get<Certificate[]>("/certificates/me").then((r) => setCerts(r.data));
  }, [isAuthenticated, isLoading, router]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-copper-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-playfair)]">Мои сертификаты</h1>
        <p className="text-muted-foreground mb-4">Выдаются после 100% прохождения курса</p>
        <Link href="/certificates/verify" className="text-sm text-copper-400 hover:underline inline-flex items-center gap-1 mb-10">
          Проверить сертификат по номеру
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {certs.length > 0 ? (
        <div className="space-y-6">
          {certs.map((cert, i) => (
            <div key={cert.id}>
              <Card className="border-copper-500/20 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-copper-700 via-copper-500 to-copper-300" />
                <CardContent className="p-8 text-center space-y-4">
                  <Award className="h-12 w-12 text-copper-500 mx-auto" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-copper-500 mb-2">KOLOS Barber Academy</p>
                    <h2 className="text-xl font-bold font-[family-name:var(--font-playfair)]">{cert.course_title}</h2>
                    <p className="text-muted-foreground mt-1">{user?.full_name}</p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-xl bg-copper-500/10 border border-copper-500/20 px-4 py-2">
                    <code className="font-mono text-copper-300">{cert.certificate_code}</code>
                    <button onClick={() => copyCode(cert.certificate_code)} className="text-muted-foreground hover:text-copper-400">
                      {copied === cert.certificate_code ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Выдан {new Date(cert.issued_at).toLocaleDateString("ru-RU")}
                  </p>
                  <Link
                    href={`/certificates/verify/${cert.certificate_code}`}
                    className="text-xs text-copper-400 hover:underline inline-block"
                  >
                    Ссылка для проверки работодателем
                  </Link>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardContent>
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Пока нет сертификатов</p>
            <p className="text-sm text-muted-foreground mb-6">Завершите все уроки курса, чтобы получить сертификат KOLOS</p>
            <Link href="/cabinet">
              <Button>Мои курсы</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
