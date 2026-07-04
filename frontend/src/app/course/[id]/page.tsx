"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle2, Lock, Play, ShoppingCart, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CheckoutTrust } from "@/components/checkout/checkout-trust";
import { PaymentMethodSelector, type PaymentMethodOption } from "@/components/checkout/payment-method-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { trackPurchase } from "@/lib/analytics";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { Course, Payment, PromoValidateResponse } from "@/lib/types";

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const { isAuthenticated, user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState<{ discount: number; final_price: number } | null>(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("card");

  useEffect(() => {
    api
      .get<Course>(`/courses/${courseId}`)
      .then((res) => setCourse(res.data))
      .catch(() => setError("Курс не найден"))
      .finally(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    api
      .get<PaymentMethodOption[]>("/payments/methods")
      .then((res) => {
        setPaymentMethods(res.data);
        if (res.data.length > 0) {
          setPaymentMethod(res.data[0].id);
        }
      })
      .catch(() => {
        setPaymentMethods([
          {
            id: "mock",
            title: "Тестовая оплата",
            description: "Мгновенный доступ (режим разработки)",
            icon: "zap",
          },
        ]);
        setPaymentMethod("mock");
      });
  }, []);

  const applyPromo = async () => {
    if (!promoCode.trim()) return;
    setValidatingPromo(true);
    setError("");
    try {
      const { data } = await api.post<PromoValidateResponse>("/promos/validate", {
        code: promoCode,
        course_id: courseId,
      });
      setPromoApplied({ discount: data.discount, final_price: data.final_price });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(typeof detail === "string" ? detail : "Неверный промокод");
      setPromoApplied(null);
    } finally {
      setValidatingPromo(false);
    }
  };

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push(`/auth/login?redirect=${encodeURIComponent(`/course/${courseId}`)}&mode=register`);
      return;
    }
    setPurchasing(true);
    setError("");
    try {
      const { data } = await api.post<Payment>("/payments/checkout", {
        course_id: courseId,
        promo_code: promoApplied ? promoCode : undefined,
        payment_method: paymentMethod,
      });
      if (data.payment_url) {
        window.location.href = data.payment_url;
        return;
      }
      trackPurchase(courseId, data.amount);
      const courseRes = await api.get<Course>(`/courses/${courseId}`);
      setCourse(courseRes.data);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Ошибка оплаты";
      setError(typeof message === "string" ? message : "Ошибка оплаты");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-copper-500 border-t-transparent" />
      </div>
    );
  }

  if (!course || error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">{error || "Курс не найден"}</p>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, m) => acc + m.lessons.length, 0) || 0;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {course.image_url && (
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                <Image src={course.image_url} alt={course.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">{course.description}</p>
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Программа курса</h2>
            {course.modules?.map((module, mi) => (
              <Card key={module.id} className="p-0 overflow-hidden">
                <CardHeader className="bg-white/[0.02] border-b border-white/5 py-4">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-copper-600/20 text-copper-400 text-sm">
                      {mi + 1}
                    </span>
                    {module.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between px-6 py-4 border-b border-white/5 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        {course.is_enrolled ? (
                          lesson.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-400" />
                          ) : (
                            <Play className="h-5 w-5 text-copper-400" />
                          )
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                        <span className={course.is_enrolled ? "" : "text-muted-foreground"}>
                          {lesson.title}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{lesson.duration_minutes} мин</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div className="text-3xl font-bold gradient-text">
                {formatPrice(promoApplied ? promoApplied.final_price : course.price)}
              </div>
              {promoApplied && (
                <p className="text-sm text-green-400">
                  Скидка {formatPrice(promoApplied.discount)} применена
                </p>
              )}

              {!course.is_enrolled && isAuthenticated && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Промокод
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="KOLOS10"
                      className="h-9"
                    />
                    <Button variant="secondary" size="sm" onClick={applyPromo} disabled={validatingPromo}>
                      OK
                    </Button>
                  </div>
                </div>
              )}

              {error && <p className="text-sm text-red-400">{error}</p>}

              {!course.is_enrolled && isAuthenticated && paymentMethods.length > 0 && (
                <PaymentMethodSelector
                  methods={paymentMethods}
                  selected={paymentMethod}
                  onSelect={setPaymentMethod}
                />
              )}

              {!course.is_enrolled && <CheckoutTrust />}

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} уроков
                </div>
                {course.is_enrolled && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Прогресс</span>
                      <span className="text-copper-400">{course.progress_percent?.toFixed(0)}%</span>
                    </div>
                    <Progress value={course.progress_percent || 0} />
                  </div>
                )}
              </div>

              {course.is_enrolled ? (
                <Link href={`/learn/${course.id}`}>
                  <Button className="w-full" size="lg">
                    <Play className="h-5 w-5" />
                    Продолжить обучение
                  </Button>
                </Link>
              ) : (
                <Button className="w-full" size="lg" onClick={handlePurchase} disabled={purchasing}>
                  <ShoppingCart className="h-5 w-5" />
                  {purchasing ? "Обработка..." : "Купить курс"}
                </Button>
              )}

              {!isAuthenticated && (
                <p className="text-xs text-center text-muted-foreground">
                  <Link
                    href={`/auth/login?redirect=${encodeURIComponent(`/course/${courseId}`)}&mode=register`}
                    className="text-copper-400 hover:underline"
                  >
                    Зарегистрируйтесь
                  </Link>
                  , чтобы купить курс
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
