"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trackPurchase } from "@/lib/analytics";

function SuccessContent() {
  const searchParams = useSearchParams();
  const courseId = searchParams.get("course_id");
  const amount = searchParams.get("amount");

  useEffect(() => {
    if (courseId && amount) {
      trackPurchase(Number(courseId), Number(amount));
    }
  }, [courseId, amount]);

  return (
    <div className="container mx-auto px-4 py-20 max-w-md">
      <Card className="border-accent/20 text-center">
        <CardContent className="p-10 space-y-6">
          <CheckCircle2 className="h-16 w-16 text-accent mx-auto" />
          <h1 className="text-2xl font-bold uppercase tracking-tight">Оплата успешна!</h1>
          <p className="text-muted">Доступ к курсу открыт. Можете начать обучение прямо сейчас.</p>
          <div className="flex flex-col gap-3">
            {courseId && (
              <Link href={`/learn/${courseId}`}>
                <Button className="w-full">Начать обучение</Button>
              </Link>
            )}
            <Link href="/cabinet">
              <Button variant="secondary" className="w-full">Личный кабинет</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-20 text-center text-muted">
          Загрузка…
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
