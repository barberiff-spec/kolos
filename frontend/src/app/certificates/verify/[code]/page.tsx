"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Award, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import api from "@/lib/api";
import type { Certificate } from "@/lib/types";

export default function CertificateVerifyResultPage() {
  const params = useParams();
  const code = decodeURIComponent(String(params.code));
  const [cert, setCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api
      .get<Certificate>(`/certificates/verify/${encodeURIComponent(code)}`)
      .then((res) => setCert(res.data))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-copper-500 border-t-transparent" />
      </div>
    );
  }

  if (notFound || !cert) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-lg">
        <Card className="text-center border-red-500/20">
          <CardContent className="p-10 space-y-4">
            <XCircle className="h-14 w-14 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold">Сертификат не найден</h1>
            <p className="text-muted-foreground text-sm">
              Проверьте номер или обратитесь к выпускнику KOLOS
            </p>
            <Link href="/certificates/verify">
              <Button variant="secondary">Проверить другой номер</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Card className="border-green-500/20 overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-copper-700 via-copper-500 to-copper-300" />
        <CardContent className="p-10 text-center space-y-5">
          <CheckCircle2 className="h-14 w-14 text-green-400 mx-auto" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-copper-500 mb-2">KOLOS Barber Academy</p>
            <h1 className="text-2xl font-bold font-[family-name:var(--font-playfair)]">Сертификат подлинный</h1>
          </div>
          <Award className="h-10 w-10 text-copper-500 mx-auto" />
          <div className="space-y-1">
            <p className="text-lg font-semibold">{cert.user_name}</p>
            <p className="text-muted-foreground">{cert.course_title}</p>
          </div>
          <code className="inline-block rounded-xl bg-copper-500/10 border border-copper-500/20 px-4 py-2 font-mono text-copper-300">
            {cert.certificate_code}
          </code>
          <p className="text-xs text-muted-foreground">
            Выдан {new Date(cert.issued_at).toLocaleDateString("ru-RU")}
          </p>
          <Link href="/courses">
            <Button className="mt-2">Пройти обучение в KOLOS</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
