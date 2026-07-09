"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Edit, ImagePlus, Plus, Tag, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api, { getAccessToken } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { CourseListItem, PromoCode, User } from "@/lib/types";

import { API_URL } from "@/lib/api-config";

async function uploadCourseImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const token = getAccessToken();
  const res = await fetch(`${API_URL}/uploads/course-image`, {
    method: "POST",
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.detail || "Не удалось загрузить изображение");
  }
  const data = await res.json();
  return data.url as string;
}

type CourseFormState = {
  title: string;
  description: string;
  short_description: string;
  price: string;
  image_url: string;
};

const emptyCourseForm: CourseFormState = {
  title: "",
  description: "",
  short_description: "",
  price: "0",
  image_url: "",
};

function CourseImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const url = await uploadCourseImage(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <Label>Обложка курса</Label>
      <div className="flex items-center gap-3">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... или загрузите файл →"
        />
        <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm hover:bg-white/10">
          <ImagePlus className="h-4 w-4" />
          {uploading ? "Загрузка..." : "Файл"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={uploading}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>
      </div>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="Превью обложки" className="mt-3 h-32 w-full rounded-xl object-cover" />
      )}
    </div>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [tab, setTab] = useState<"courses" | "users" | "promos">("courses");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CourseFormState>(emptyCourseForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CourseFormState>(emptyCourseForm);
  const [promoForm, setPromoForm] = useState({ code: "", discount_percent: "10", discount_amount: "0" });

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
      return;
    }
    loadData();
  }, [isAuthenticated, isLoading, user, router]);

  const loadData = async () => {
    const [coursesRes, usersRes, promosRes] = await Promise.all([
      api.get<CourseListItem[]>("/courses?published_only=false"),
      api.get<User[]>("/users"),
      api.get<PromoCode[]>("/promos"),
    ]);
    setCourses(coursesRes.data);
    setUsers(usersRes.data);
    setPromos(promosRes.data);
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/courses", {
      title: form.title,
      description: form.description,
      short_description: form.short_description,
      price: parseFloat(form.price),
      image_url: form.image_url || null,
      is_published: true,
    });
    setForm(emptyCourseForm);
    setShowForm(false);
    loadData();
  };

  const deleteCourse = async (id: number) => {
    if (!confirm("Удалить курс?")) return;
    await api.delete(`/courses/${id}`);
    loadData();
  };

  const startEditCourse = (course: CourseListItem) => {
    setEditingId(course.id);
    setEditForm({
      title: course.title,
      description: "",
      short_description: course.short_description || "",
      price: String(course.price),
      image_url: course.image_url || "",
    });
    api.get(`/courses/${course.id}`).then(({ data }) => {
      setEditForm((prev) => ({ ...prev, description: data.description || "" }));
    });
  };

  const saveEditCourse = async (e: React.FormEvent, id: number) => {
    e.preventDefault();
    await api.patch(`/courses/${id}`, {
      title: editForm.title,
      description: editForm.description,
      short_description: editForm.short_description,
      price: parseFloat(editForm.price),
      image_url: editForm.image_url || null,
    });
    setEditingId(null);
    loadData();
  };

  const createPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/promos", {
      code: promoForm.code,
      discount_percent: parseFloat(promoForm.discount_percent),
      discount_amount: parseFloat(promoForm.discount_amount),
    });
    setPromoForm({ code: "", discount_percent: "10", discount_amount: "0" });
    loadData();
  };

  const deletePromo = async (id: number) => {
    if (!confirm("Удалить промокод?")) return;
    await api.delete(`/promos/${id}`);
    loadData();
  };

  const togglePublish = async (course: CourseListItem) => {
    await api.patch(`/courses/${course.id}`, { is_published: !course.is_published });
    loadData();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-copper-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-playfair)]">Админ-панель KOLOS</h1>
        <p className="text-muted-foreground mb-8">Управление курсами и учениками</p>
      </div>

      <div className="flex gap-2 mb-8">
        <Button variant={tab === "courses" ? "default" : "secondary"} onClick={() => setTab("courses")}>
          Курсы ({courses.length})
        </Button>
        <Button variant={tab === "users" ? "default" : "secondary"} onClick={() => setTab("users")}>
          <Users className="h-4 w-4" />
          Пользователи ({users.length})
        </Button>
        <Button variant={tab === "promos" ? "default" : "secondary"} onClick={() => setTab("promos")}>
          <Tag className="h-4 w-4" />
          Промокоды ({promos.length})
        </Button>
      </div>

      {tab === "courses" && (
        <div className="space-y-6">
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            Новый курс
          </Button>

          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>Создать курс</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createCourse} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Название</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="short">Краткое описание</Label>
                    <Input
                      id="short"
                      value={form.short_description}
                      onChange={(e) => setForm({ ...form, short_description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="desc">Описание</Label>
                    <textarea
                      id="desc"
                      className="flex min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-500/50"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Цена (₽)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      required
                    />
                  </div>
                  <CourseImageField
                    value={form.image_url}
                    onChange={(url) => setForm({ ...form, image_url: url })}
                  />
                  <Button type="submit">Создать</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {courses.map((course) => (
              <Card key={course.id} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {course.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="h-12 w-16 shrink-0 rounded-lg object-cover"
                      />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-medium truncate">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(course.price)} · {course.lessons_count} уроков ·{" "}
                        {course.is_published ? "Опубликован" : "Черновик"}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => (editingId === course.id ? setEditingId(null) : startEditCourse(course))}
                    >
                      <Edit className="h-4 w-4" />
                      {editingId === course.id ? "Закрыть" : "Изменить"}
                    </Button>
                    <Link href={`/admin/courses/${course.id}`}>
                      <Button variant="secondary" size="sm">
                        Уроки
                      </Button>
                    </Link>
                    <Button variant="secondary" size="sm" onClick={() => togglePublish(course)}>
                      {course.is_published ? "Скрыть" : "Опубликовать"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCourse(course.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {editingId === course.id && (
                  <form onSubmit={(e) => saveEditCourse(e, course.id)} className="mt-4 space-y-4 border-t border-white/10 pt-4">
                    <div>
                      <Label>Название</Label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Краткое описание</Label>
                      <Input
                        value={editForm.short_description}
                        onChange={(e) => setEditForm({ ...editForm, short_description: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Описание</Label>
                      <textarea
                        className="flex min-h-[100px] w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-copper-500/50"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Цена (₽)</Label>
                      <Input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <CourseImageField
                      value={editForm.image_url}
                      onChange={(url) => setEditForm({ ...editForm, image_url: url })}
                    />
                    <Button type="submit">Сохранить изменения</Button>
                  </form>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id} className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-medium">{u.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {u.email} · {u.role} · {u.is_active ? "Активен" : "Неактивен"}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "promos" && (
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Новый промокод</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={createPromo} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <Label>Код</Label>
                  <Input value={promoForm.code} onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })} required />
                </div>
                <div>
                  <Label>Скидка %</Label>
                  <Input type="number" value={promoForm.discount_percent} onChange={(e) => setPromoForm({ ...promoForm, discount_percent: e.target.value })} />
                </div>
                <div>
                  <Label>Скидка ₽</Label>
                  <Input type="number" value={promoForm.discount_amount} onChange={(e) => setPromoForm({ ...promoForm, discount_amount: e.target.value })} />
                </div>
                <Button type="submit">Создать</Button>
              </form>
            </CardContent>
          </Card>
          <div className="space-y-3">
            {promos.map((p) => (
              <Card key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <span className="font-mono font-bold text-copper-400">{p.code}</span>
                  <p className="text-sm text-muted-foreground">
                    {p.discount_percent > 0 ? `${p.discount_percent}%` : `${p.discount_amount} ₽`} ·
                    использован {p.used_count}{p.max_uses ? `/${p.max_uses}` : ""} ·
                    {p.is_active ? " активен" : " неактивен"}
                  </p>
                </div>
                <Button variant="destructive" size="sm" onClick={() => deletePromo(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
