"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowDown, ArrowUp, ChevronDown, ChevronUp, Edit, Plus, Trash2 } from "lucide-react";
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
  const [editingModuleId, setEditingModuleId] = useState<number | null>(null);
  const [moduleTitleDraft, setModuleTitleDraft] = useState("");

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

  const startEditModuleTitle = (module: Module) => {
    setEditingModuleId(module.id);
    setModuleTitleDraft(module.title);
  };

  const saveModuleTitle = async (moduleId: number) => {
    if (moduleTitleDraft.trim()) {
      await api.patch(`/modules/${moduleId}`, { title: moduleTitleDraft.trim() });
    }
    setEditingModuleId(null);
    loadCourse();
  };

  const moveModule = async (index: number, direction: -1 | 1) => {
    const modules = course?.modules;
    if (!modules) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= modules.length) return;
    const a = modules[index];
    const b = modules[targetIndex];
    await Promise.all([
      api.patch(`/modules/${a.id}`, { order: b.order }),
      api.patch(`/modules/${b.id}`, { order: a.order }),
    ]);
    loadCourse();
  };

  const moveLesson = async (module: Module, index: number, direction: -1 | 1) => {
    const lessons = module.lessons;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lessons.length) return;
    const a = lessons[index];
    const b = lessons[targetIndex];
    await Promise.all([
      api.patch(`/lessons/${a.id}`, { order: b.order }),
      api.patch(`/lessons/${b.id}`, { order: a.order }),
    ]);
    loadCourse();
  };

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-muted hover:text-text mb-6">
        <ArrowLeft className="h-4 w-4" /> Назад в админку
      </Link>

      <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
      <p className="text-muted mb-8">Редактор модулей и уроков</p>

      <div className="space-y-4">
        {course.modules?.map((module, mi) => (
          <Card key={module.id} className="border-accent/10 overflow-hidden">
            <CardHeader
              className="cursor-pointer flex flex-row items-center justify-between py-4 bg-text/[0.02]"
              onClick={() => editingModuleId !== module.id && setExpandedModule(expandedModule === module.id ? null : module.id)}
            >
              <CardTitle className="text-base flex items-center gap-2 min-w-0 flex-1">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent text-sm">
                  {mi + 1}
                </span>
                {editingModuleId === module.id ? (
                  <Input
                    autoFocus
                    value={moduleTitleDraft}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setModuleTitleDraft(e.target.value)}
                    onBlur={() => saveModuleTitle(module.id)}
                    onKeyDown={(e) => e.key === "Enter" && saveModuleTitle(module.id)}
                    className="h-9"
                  />
                ) : (
                  <>
                    <span className="truncate">{module.title}</span>
                    <span className="text-xs text-muted font-normal shrink-0">
                      ({module.lessons.length} уроков)
                    </span>
                  </>
                )}
              </CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={mi === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveModule(mi, -1);
                  }}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={mi === (course.modules?.length || 1) - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveModule(mi, 1);
                  }}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditModuleTitle(module);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteModule(module.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-danger" />
                </Button>
                {expandedModule === module.id ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </div>
            </CardHeader>

            {expandedModule === module.id && (
              <CardContent className="space-y-4 pt-0">
                {module.lessons.map((lesson, li) => (
                  <div key={lesson.id} className="rounded-xl border border-text/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-accent">Урок {li + 1}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={li === 0}
                          onClick={() => moveLesson(module, li, -1)}
                        >
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={li === module.lessons.length - 1}
                          onClick={() => moveLesson(module, li, 1)}
                        >
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteLesson(lesson.id)}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
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
                          className="flex h-11 w-full rounded-xl border border-text/10 bg-text/[0.03] px-4 text-sm"
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
