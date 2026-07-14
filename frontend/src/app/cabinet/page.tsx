"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BookOpen, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Enrollment } from "@/lib/types";

function initials(name: string | undefined) {
  if (!name) return "K";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

export default function CabinetPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [lessonReminders, setLessonReminders] = useState(true);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    api
      .get<Enrollment[]>("/enrollments/me")
      .then((res) => setEnrollments(res.data))
      .finally(() => setLoading(false));
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-tight mb-2">Личный кабинет</h1>
        <p className="text-muted mb-10">
          Добро пожаловать, {user?.full_name}
        </p>
      </div>

      <h2 className="text-xl font-semibold uppercase tracking-tight mb-6">Профиль</h2>
      <Card className="mb-10">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-surface border border-border/30 text-lg font-semibold text-accent">
              {initials(user?.full_name)}
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.full_name}</p>
              <p className="text-sm text-muted">{user?.email}</p>
            </div>
          </div>

          <div className="divide-y divide-border/20">
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm">Email-уведомления</p>
                <p className="text-xs text-muted">Покупки, сертификаты, новости курсов</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm">Напоминания об уроках</p>
                <p className="text-xs text-muted">Продолжить курс, если прогресс встал</p>
              </div>
              <Switch checked={lessonReminders} onCheckedChange={setLessonReminders} />
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold uppercase tracking-tight mb-6">Мои курсы</h2>

      {enrollments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {enrollments.map((enrollment, i) => (
            <div key={enrollment.id}>
              <Card className="p-0 overflow-hidden h-full">
                <div className="relative h-40">
                  {enrollment.course_image_url ? (
                    <Image
                      src={enrollment.course_image_url}
                      alt={enrollment.course_title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-border/20 to-surface/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/80 to-transparent" />
                </div>
                <CardContent className="p-5 space-y-4">
                  <h3 className="font-semibold text-lg">{enrollment.course_title}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {enrollment.completed_lessons}/{enrollment.lessons_count} уроков
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Прогресс</span>
                      <span className="text-accent">{enrollment.progress_percent.toFixed(0)}%</span>
                    </div>
                    <Progress value={enrollment.progress_percent} />
                  </div>
                  <Link href={`/learn/${enrollment.course_id}`}>
                    <Button className="w-full">
                      <Play className="h-4 w-4" />
                      Продолжить
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <Card className="text-center py-16">
          <CardContent>
            <p className="text-muted mb-4">У вас пока нет курсов</p>
            <Link href="/courses">
              <Button>Выбрать курс</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
