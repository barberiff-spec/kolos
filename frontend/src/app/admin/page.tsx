"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Edit, Plus, Tag, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type { CourseListItem, PromoCode, User } from "@/lib/types";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [tab, setTab] = useState<"courses" | "users" | "promos">("courses");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    short_description: "",
    price: "0",
    image_url: "",
  });
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
    setForm({ title: "", description: "", short_description: "", price: "0", image_url: "" });
    setShowForm(false);
    loadData();
  };

  const deleteCourse = async (id: number) => {
    if (!confirm("Удалить курс?")) return;
    await api.delete(`/courses/${id}`);
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-playfair)]">Админ-панель KOLOS</h1>
        <p className="text-muted-foreground mb-8">Управление курсами и учениками</p>
      </motion.div>

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
                  <div>
                    <Label htmlFor="image">URL обложки</Label>
                    <Input
                      id="image"
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                    />
                  </div>
                  <Button type="submit">Создать</Button>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {courses.map((course) => (
              <Card key={course.id} className="flex items-center justify-between p-4">
                <div>
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(course.price)} · {course.lessons_count} уроков ·{" "}
                    {course.is_published ? "Опубликован" : "Черновик"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/admin/courses/${course.id}`}>
                    <Button variant="secondary" size="sm">
                      <Edit className="h-4 w-4" />
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
