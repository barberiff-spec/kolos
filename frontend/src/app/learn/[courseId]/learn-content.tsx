"use client";

import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Circle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LessonComments } from "@/components/lesson/lesson-comments";
import { VideoPlayer } from "@/components/lesson/video-player";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { Course, Lesson } from "@/lib/types";

export default function LearnContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = Number(params.courseId);
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const allLessons = useMemo(
    () => course?.modules?.flatMap((m) => m.lessons) || [],
    [course]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    api
      .get<Course>(`/courses/${courseId}`)
      .then((res) => {
        const data = res.data;
        if (!data.is_enrolled) {
          router.push(`/course/${courseId}`);
          return;
        }
        setCourse(data);
        const lessons = data.modules?.flatMap((m) => m.lessons) || [];
        const lessonParam = searchParams.get("lesson");
        const initial = lessonParam
          ? lessons.find((l) => l.id === Number(lessonParam))
          : lessons[0];
        setActiveLesson(initial || lessons[0] || null);
      })
      .catch(() => router.push(`/course/${courseId}`))
      .finally(() => setLoading(false));
  }, [courseId, isAuthenticated, authLoading, router, searchParams]);

  const markComplete = async (completed: boolean) => {
    if (!activeLesson) return;
    await api.put(`/progress/lesson/${activeLesson.id}`, { completed });
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        modules: prev.modules?.map((m) => ({
          ...m,
          lessons: m.lessons.map((l) =>
            l.id === activeLesson.id ? { ...l, completed } : l
          ),
        })),
      };
    });
    setActiveLesson((prev) => (prev ? { ...prev, completed } : prev));
    const { data } = await api.get<Course>(`/courses/${courseId}`);
    setCourse(data);
  };

  const goToLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    router.replace(`/learn/${courseId}?lesson=${lesson.id}`, { scroll: false });
  };

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  if (loading || authLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-copper-500 border-t-transparent" />
      </div>
    );
  }

  if (!course) return null;

  if (!activeLesson) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        В этом курсе пока нет уроков
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <aside
        className={cn(
          "border-r border-white/5 bg-[#0a0a0a]/95 md:bg-black/40 md:backdrop-blur-xl transition-all duration-300 overflow-y-auto",
          sidebarOpen ? "w-80" : "w-0"
        )}
      >
        <div className="p-4 border-b border-white/5">
          <Link href={`/course/${courseId}`} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
            <ChevronLeft className="h-4 w-4" />
            Назад к курсу
          </Link>
          <h2 className="font-semibold line-clamp-2">{course.title}</h2>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Прогресс</span>
              <span>{course.progress_percent?.toFixed(0)}%</span>
            </div>
            <Progress value={course.progress_percent || 0} />
          </div>
        </div>

        <div className="p-2">
          {course.modules?.map((module) => (
            <div key={module.id} className="mb-4">
              <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {module.title}
              </p>
              {module.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => goToLesson(lesson)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-left transition-all",
                    activeLesson.id === lesson.id
                      ? "bg-copper-600/20 text-copper-300"
                      : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lesson.completed ? (
                    <CheckCircle2 className="h-4 w-4 text-green-400 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0" />
                  )}
                  <span className="line-clamp-2">{lesson.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-white/5 bg-[#0a0a0a]/95 md:bg-background/80 md:backdrop-blur-xl px-4 py-3">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <h1 className="font-medium truncate flex-1">{activeLesson.title}</h1>
        </div>

        <div key={activeLesson.id} className="max-w-4xl mx-auto p-6 space-y-8">
          <VideoPlayer
            videoUrl={activeLesson.video_url}
            videoType={activeLesson.video_type}
            title={activeLesson.title}
          />

          {activeLesson.content && (
            <div className="premium-card prose prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {activeLesson.content}
              </div>
            </div>
          )}

          <LessonComments lessonId={activeLesson.id} />

          <div className="flex items-center justify-between gap-4">
            <Button
              variant="secondary"
              disabled={!prevLesson}
              onClick={() => prevLesson && goToLesson(prevLesson)}
            >
              <ChevronLeft className="h-4 w-4" />
              Предыдущий
            </Button>

            {!activeLesson.completed ? (
              <Button onClick={() => markComplete(true)}>Отметить пройденным</Button>
            ) : (
              <span className="text-sm text-green-400 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Пройден
              </span>
            )}

            <Button
              variant="secondary"
              disabled={!nextLesson}
              onClick={() => nextLesson && goToLesson(nextLesson)}
            >
              Следующий
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
