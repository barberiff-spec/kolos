"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Course, Lesson, Module, VideoType } from "@/lib/types";

export default function AdminCourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = Number(params.id);
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
      return;
    }
    loadCourse();
  }, [courseId, isAuthenticated, isLoading, user, router]);

  const loadCourse = async () => {
    const { data } = await api.get<Course>(`/courses/${courseId}`);
    setCourse(data);
    if (data.modules?.length) setExpandedModule(data.modules[0].id);
  };

  const addModule = async () => {
    const title = prompt("Название модуля:");
    if (!title) return;
    await api.post("/modules", { course_id: courseId, title, order: course?.modules?.length || 0 });
    loadCourse();
  };

  const addLesson = async (moduleId: number) => {
    const title = prompt("Название урока:");
    if (!title) return;
    const mod = course?.modules?.find((m) => m.id === moduleId);
    await api.post("/lessons", {
      module_id: moduleId,
      title,
      order: mod?.lessons.length || 0,
      video_type: "none" as VideoType,
      duration_minutes: 0,
    });
    loadCourse();
  };

  const updateLesson = async (lesson: Lesson, field: string, value: string | number) => {
    await api.patch(`/lessons/${lesson.id}`, { [field]: value });
    loadCourse();
  };

  const deleteModule = async (id: number) => {
    if (!confirm("Удалить модуль и все уроки?")) return;
    await api.delete(`/modules/${id}`);
    loadCourse();
  };

  const deleteLesson = async (id: number) => {
    if (!confirm("Удалить урок?")) return;
    await api.delete(`/lessons/${id}`);
    loadCourse();
  };

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-copper-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Назад в админку
      </Link>

      <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
      <p className="text-muted-foreground mb-8">Редактор модулей и уроков</p>

      <div className="space-y-4">
        {course.modules?.map((module, mi) => (
          <Card key={module.id} className="border-copper-500/10 overflow-hidden">
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between py-4 bg-white/[0.02]"
              onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
            >
              <CardTitle className="text-base flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-copper-600/20 text-copper-400 text-sm">
                  {mi + 1}
                </span>
                {module.title}
                <span className="text-xs text-muted-foreground font-normal">({module.lessons.length} уроков)</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteModule(module.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
                {expandedModule === module.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {expandedModule === module.id && (
              <CardContent className="space-y-4 pt-0">
                {module.lessons.map((lesson, li) => (
                  <div key={lesson.id} className="rounded-xl border border-white/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-copper-400">Урок {li + 1}</span>
                      <Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson.id)}>
                        <Trash2 className="h-4 w-4 text-red-400" />
                      </Button>
                    </div>
                    <div>
                      <Label>Название</Label>
                      <Input
                        defaultValue={lesson.title}
                        onBlur={(e) => e.target.value !== lesson.title && updateLesson(lesson, "title", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Контент</Label>
                      <Textarea
                        defaultValue={lesson.content || ""}
                        onBlur={(e) => updateLesson(lesson, "content", e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Video URL</Label>
                        <Input
                          defaultValue={lesson.video_url || ""}
                          placeholder="YouTube или VK ссылка"
                          onBlur={(e) => updateLesson(lesson, "video_url", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Тип видео</Label>
                        <select
                          className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm"
                          defaultValue={lesson.video_type}
                          onChange={(e) => updateLesson(lesson, "video_type", e.target.value)}
                        >
                          <option value="none">Нет</option>
                          <option value="youtube">YouTube</option>
                          <option value="vk">VK Video</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>Длительность (мин)</Label>
                      <Input
                        type="number"
                        defaultValue={lesson.duration_minutes}
                        onBlur={(e) =>
                          updateLesson(lesson, "duration_minutes", parseInt(e.target.value) || 0)
                        }
                      />
                    </div>
                  </div>
                ))}
                <Button variant="secondary" size="sm" onClick={() => addLesson(module.id)}>
                  <Plus className="h-4 w-4" /> Добавить урок
                </Button>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Button className="mt-6" onClick={addModule}>
        <Plus className="h-4 w-4" /> Добавить модуль
      </Button>
    </div>
  );
}
