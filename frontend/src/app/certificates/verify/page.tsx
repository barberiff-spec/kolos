"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Award, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CertificateVerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = code.trim().toUpperCase();
    if (normalized) {
      router.push(`/certificates/verify/${encodeURIComponent(normalized)}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <Card className="border-copper-500/20">
        <CardHeader className="text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-copper-500/20 mx-auto mb-2">
            <Award className="h-6 w-6 text-copper-400" />
          </div>
          <CardTitle className="font-[family-name:var(--font-playfair)]">Проверка сертификата</CardTitle>
          <CardDescription>
            Работодатели и клиенты могут проверить подлинность сертификата KOLOS по номеру
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Номер сертификата</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="KOLOS-XXXX-XXXX"
                className="font-mono mt-1"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              <Search className="h-4 w-4" />
              Проверить
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-6">
            <Link href="/courses" className="text-copper-400 hover:underline">
              Хотите получить свой сертификат? Смотрите курсы →
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
