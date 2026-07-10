"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Award,
  CreditCard,
  Edit,
  FileQuestion,
  ImagePlus,
  MessageSquare,
  Plus,
  Settings as SettingsIcon,
  Star,
  Tag,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import api, { getAccessToken } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/store/auth";
import type {
  Certificate,
  CommentAdmin,
  CourseListItem,
  Enrollment,
  FAQ,
  Payment,
  PromoCode,
  Review,
  SiteSettings,
  User,
} from "@/lib/types";

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

type Tab = "courses" | "students" | "promos" | "content" | "settings";

const emptySettingsForm = {
  hero_title: "",
  hero_subtitle: "",
  promo_banner_text: "",
  promo_banner_enabled: true,
  contact_email: "",
  contact_phone: "",
  contact_address: "",
  social_instagram: "",
  social_telegram: "",
  social_whatsapp: "",
  social_vk: "",
  footer_text: "",
  meta_title: "",
  meta_description: "",
};

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [comments, setComments] = useState<CommentAdmin[]>([]);
  const [tab, setTab] = useState<Tab>("courses");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CourseFormState>(emptyCourseForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<CourseFormState>(emptyCourseForm);
  const [promoForm, setPromoForm] = useState({ code: "", discount_percent: "10", discount_amount: "0" });
  const [certForm, setCertForm] = useState({ user_id: "", course_id: "" });
  const [reviewForm, setReviewForm] = useState({ author_name: "", author_role: "", rating: "5", text: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "" });
  const [settingsForm, setSettingsForm] = useState(emptySettingsForm);
  const [settingsSaved, setSettingsSaved] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
      return;
    }
    loadData();
  }, [isAuthenticated, isLoading, user, router]);

  const loadData = async () => {
    const [
      coursesRes,
      usersRes,
      promosRes,
      enrollmentsRes,
      certificatesRes,
      paymentsRes,
      reviewsRes,
      faqsRes,
      commentsRes,
      settingsRes,
    ] = await Promise.all([
      api.get<CourseListItem[]>("/courses?published_only=false"),
      api.get<User[]>("/users"),
      api.get<PromoCode[]>("/promos"),
      api.get<Enrollment[]>("/enrollments"),
      api.get<Certificate[]>("/certificates"),
      api.get<Payment[]>("/payments"),
      api.get<Review[]>("/content/reviews?published_only=false"),
      api.get<FAQ[]>("/content/faq?published_only=false"),
      api.get<CommentAdmin[]>("/comments"),
      api.get<SiteSettings>("/settings"),
    ]);
    setCourses(coursesRes.data);
    setUsers(usersRes.data);
    setPromos(promosRes.data);
    setEnrollments(enrollmentsRes.data);
    setCertificates(certificatesRes.data);
    setPayments(paymentsRes.data);
    setReviews(reviewsRes.data);
    setFaqs(faqsRes.data);
    setComments(commentsRes.data);
    setSettingsForm({
      hero_title: settingsRes.data.hero_title || "",
      hero_subtitle: settingsRes.data.hero_subtitle || "",
      promo_banner_text: settingsRes.data.promo_banner_text || "",
      promo_banner_enabled: settingsRes.data.promo_banner_enabled,
      contact_email: settingsRes.data.contact_email || "",
      contact_phone: settingsRes.data.contact_phone || "",
      contact_address: settingsRes.data.contact_address || "",
      social_instagram: settingsRes.data.social_instagram || "",
      social_telegram: settingsRes.data.social_telegram || "",
      social_whatsapp: settingsRes.data.social_whatsapp || "",
      social_vk: settingsRes.data.social_vk || "",
      footer_text: settingsRes.data.footer_text || "",
      meta_title: settingsRes.data.meta_title || "",
      meta_description: settingsRes.data.meta_description || "",
    });
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

  const revokeEnrollment = async (id: number) => {
    if (!confirm("Отозвать запись на курс? Ученик потеряет доступ.")) return;
    await api.delete(`/enrollments/${id}`);
    loadData();
  };

  const issueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/certificates", {
        user_id: parseInt(certForm.user_id, 10),
        course_id: parseInt(certForm.course_id, 10),
      });
      setCertForm({ user_id: "", course_id: "" });
      loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Не удалось выдать сертификат");
    }
  };

  const revokeCertificate = async (id: number) => {
    if (!confirm("Отозвать сертификат?")) return;
    await api.delete(`/certificates/${id}`);
    loadData();
  };

  const deleteCommentAdmin = async (id: number) => {
    if (!confirm("Удалить комментарий?")) return;
    await api.delete(`/comments/${id}`);
    loadData();
  };

  const createReview = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/content/reviews", {
      author_name: reviewForm.author_name,
      author_role: reviewForm.author_role || null,
      rating: parseInt(reviewForm.rating, 10),
      text: reviewForm.text,
      is_published: true,
    });
    setReviewForm({ author_name: "", author_role: "", rating: "5", text: "" });
    loadData();
  };

  const toggleReviewPublished = async (review: Review) => {
    await api.patch(`/content/reviews/${review.id}`, { is_published: !review.is_published });
    loadData();
  };

  const deleteReview = async (id: number) => {
    if (!confirm("Удалить отзыв?")) return;
    await api.delete(`/content/reviews/${id}`);
    loadData();
  };

  const createFaq = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/content/faq", {
      question: faqForm.question,
      answer: faqForm.answer,
      order: faqs.length,
      is_published: true,
    });
    setFaqForm({ question: "", answer: "" });
    loadData();
  };

  const toggleFaqPublished = async (faq: FAQ) => {
    await api.patch(`/content/faq/${faq.id}`, { is_published: !faq.is_published });
    loadData();
  };

  const deleteFaq = async (id: number) => {
    if (!confirm("Удалить вопрос?")) return;
    await api.delete(`/content/faq/${id}`);
    loadData();
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.put("/settings", {
      hero_title: settingsForm.hero_title || null,
      hero_subtitle: settingsForm.hero_subtitle || null,
      promo_banner_text: settingsForm.promo_banner_text || null,
      promo_banner_enabled: settingsForm.promo_banner_enabled,
      contact_email: settingsForm.contact_email || null,
      contact_phone: settingsForm.contact_phone || null,
      contact_address: settingsForm.contact_address || null,
      social_instagram: settingsForm.social_instagram || null,
      social_telegram: settingsForm.social_telegram || null,
      social_whatsapp: settingsForm.social_whatsapp || null,
      social_vk: settingsForm.social_vk || null,
      footer_text: settingsForm.footer_text || null,
      meta_title: settingsForm.meta_title || null,
      meta_description: settingsForm.meta_description || null,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const userName = (id: number) => users.find((u) => u.id === id)?.full_name || `#${id}`;
  const courseName = (id: number) => courses.find((c) => c.id === id)?.title || `#${id}`;

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
        <p className="text-muted-foreground mb-8">Управление курсами, учениками и сайтом</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <Button variant={tab === "courses" ? "default" : "secondary"} onClick={() => setTab("courses")}>
          Курсы ({courses.length})
        </Button>
        <Button variant={tab === "students" ? "default" : "secondary"} onClick={() => setTab("students")}>
          <Users className="h-4 w-4" />
          Ученики ({users.length})
        </Button>
        <Button variant={tab === "promos" ? "default" : "secondary"} onClick={() => setTab("promos")}>
          <Tag className="h-4 w-4" />
          Промокоды ({promos.length})
        </Button>
        <Button variant={tab === "content" ? "default" : "secondary"} onClick={() => setTab("content")}>
          <Star className="h-4 w-4" />
          Отзывы и FAQ
        </Button>
        <Button variant={tab === "settings" ? "default" : "secondary"} onClick={() => setTab("settings")}>
          <SettingsIcon className="h-4 w-4" />
          Настройки сайта
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

      {tab === "students" && (
        <div className="space-y-10">
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-copper-400" /> Пользователи
            </h2>
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
              {users.length === 0 && <p className="text-sm text-muted-foreground">Пока нет пользователей</p>}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Записи на курсы</h2>
            <div className="space-y-2">
              {enrollments.map((en) => (
                <Card key={en.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{userName(en.user_id)}</p>
                    <p className="text-sm text-muted-foreground">
                      {en.course_title} · прогресс {Math.round(en.progress_percent)}% ·{" "}
                      {new Date(en.enrolled_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => revokeEnrollment(en.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              {enrollments.length === 0 && <p className="text-sm text-muted-foreground">Пока никто не записан</p>}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-copper-400" /> Сертификаты
            </h2>
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-base">Выдать сертификат вручную</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={issueCertificate} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <Label>Пользователь</Label>
                    <select
                      className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm"
                      value={certForm.user_id}
                      onChange={(e) => setCertForm({ ...certForm, user_id: e.target.value })}
                      required
                    >
                      <option value="">Выберите...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>{u.full_name} ({u.email})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Курс</Label>
                    <select
                      className="flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm"
                      value={certForm.course_id}
                      onChange={(e) => setCertForm({ ...certForm, course_id: e.target.value })}
                      required
                    >
                      <option value="">Выберите...</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit">Выдать</Button>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {certificates.map((cert) => (
                <Card key={cert.id} className="flex items-center justify-between p-4">
                  <div>
                    <span className="font-mono font-bold text-copper-400">{cert.certificate_code}</span>
                    <p className="text-sm text-muted-foreground">
                      {cert.user_name || userName(cert.user_id)} · {cert.course_title || courseName(cert.course_id)} ·{" "}
                      {new Date(cert.issued_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => revokeCertificate(cert.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
              {certificates.length === 0 && <p className="text-sm text-muted-foreground">Сертификаты ещё не выданы</p>}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-copper-400" /> Платежи
            </h2>
            <div className="space-y-2">
              {payments.map((p) => (
                <Card key={p.id} className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">
                      {userName(p.user_id)} → {courseName(p.course_id)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(p.amount)}{p.discount_amount ? ` (скидка ${formatPrice(p.discount_amount)})` : ""} ·{" "}
                      {p.payment_method} · {p.status} · {new Date(p.created_at).toLocaleDateString("ru-RU")}
                    </p>
                  </div>
                </Card>
              ))}
              {payments.length === 0 && <p className="text-sm text-muted-foreground">Платежей пока нет</p>}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-copper-400" /> Комментарии к урокам
            </h2>
            <div className="space-y-2">
              {comments.map((c) => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{c.user_name}</span>{" "}
                        <span className="text-muted-foreground">
                          · {c.course_title} → {c.lesson_title} ·{" "}
                          {new Date(c.created_at).toLocaleDateString("ru-RU")}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{c.content}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteCommentAdmin(c.id)}>
                      <Trash2 className="h-4 w-4 text-red-400" />
                    </Button>
                  </div>
                </Card>
              ))}
              {comments.length === 0 && <p className="text-sm text-muted-foreground">Комментариев пока нет</p>}
            </div>
          </div>
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

      {tab === "content" && (
        <div className="space-y-10">
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-copper-400" /> Отзывы на лендинге
            </h2>
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-base">Новый отзыв</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={createReview} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Имя автора</Label>
                      <Input
                        value={reviewForm.author_name}
                        onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label>Роль/должность</Label>
                      <Input
                        value={reviewForm.author_role}
                        onChange={(e) => setReviewForm({ ...reviewForm, author_role: e.target.value })}
                        placeholder="Барбер, выпускник курса"
                      />
                    </div>
                    <div>
                      <Label>Рейтинг (1–5)</Label>
                      <Input
                        type="number"
                        min={1}
                        max={5}
                        value={reviewForm.rating}
                        onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Текст отзыва</Label>
                    <Textarea
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit">Добавить отзыв</Button>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {reviews.map((r) => (
                <Card key={r.id} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{r.author_name} {r.author_role && `· ${r.author_role}`}</p>
                    <p className="text-sm text-muted-foreground mt-1">{r.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {"★".repeat(r.rating)} · {r.is_published ? "опубликован" : "скрыт"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => toggleReviewPublished(r)}>
                      {r.is_published ? "Скрыть" : "Показать"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteReview(r.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {reviews.length === 0 && <p className="text-sm text-muted-foreground">Отзывов пока нет</p>}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-copper-400" /> Частые вопросы (FAQ)
            </h2>
            <Card className="mb-4">
              <CardHeader><CardTitle className="text-base">Новый вопрос</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={createFaq} className="space-y-4">
                  <div>
                    <Label>Вопрос</Label>
                    <Input
                      value={faqForm.question}
                      onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Ответ</Label>
                    <Textarea
                      value={faqForm.answer}
                      onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit">Добавить вопрос</Button>
                </form>
              </CardContent>
            </Card>
            <div className="space-y-2">
              {faqs.map((f) => (
                <Card key={f.id} className="flex items-start justify-between gap-4 p-4">
                  <div className="min-w-0">
                    <p className="font-medium">{f.question}</p>
                    <p className="text-sm text-muted-foreground mt-1">{f.answer}</p>
                    <p className="text-xs text-muted-foreground mt-1">{f.is_published ? "опубликован" : "скрыт"}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="secondary" size="sm" onClick={() => toggleFaqPublished(f)}>
                      {f.is_published ? "Скрыть" : "Показать"}
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteFaq(f.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
              {faqs.length === 0 && <p className="text-sm text-muted-foreground">Вопросов пока нет</p>}
            </div>
          </div>
        </div>
      )}

      {tab === "settings" && (
        <Card>
          <CardHeader><CardTitle>Настройки сайта</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={saveSettings} className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-copper-400 mb-3">Главный экран</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Заголовок под логотипом</Label>
                    <Input
                      value={settingsForm.hero_title}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_title: e.target.value })}
                      placeholder="Академия барберинга нового уровня"
                    />
                  </div>
                  <div>
                    <Label>Подзаголовок</Label>
                    <Textarea
                      value={settingsForm.hero_subtitle}
                      onChange={(e) => setSettingsForm({ ...settingsForm, hero_subtitle: e.target.value })}
                      placeholder="Мужские стрижки и фейды, бритьё с горячими полотенцами..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-copper-400 mb-3">Баннер с промокодом</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={settingsForm.promo_banner_enabled}
                      onChange={(e) => setSettingsForm({ ...settingsForm, promo_banner_enabled: e.target.checked })}
                    />
                    Показывать баннер на главной
                  </label>
                  <div>
                    <Label>Текст баннера</Label>
                    <Input
                      value={settingsForm.promo_banner_text}
                      onChange={(e) => setSettingsForm({ ...settingsForm, promo_banner_text: e.target.value })}
                      placeholder="Промокод KOLOS10 — скидка 10%"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-copper-400 mb-3">Контакты (для футера)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={settingsForm.contact_email}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contact_email: e.target.value })}
                      placeholder="info@kolos.bar"
                    />
                  </div>
                  <div>
                    <Label>Телефон</Label>
                    <Input
                      value={settingsForm.contact_phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contact_phone: e.target.value })}
                      placeholder="+7 999 000-00-00"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Адрес</Label>
                    <Input
                      value={settingsForm.contact_address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, contact_address: e.target.value })}
                      placeholder="Москва, ул. Примерная, 1"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-copper-400 mb-3">Соцсети (ссылки, для футера)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Instagram</Label>
                    <Input
                      value={settingsForm.social_instagram}
                      onChange={(e) => setSettingsForm({ ...settingsForm, social_instagram: e.target.value })}
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <Label>Telegram</Label>
                    <Input
                      value={settingsForm.social_telegram}
                      onChange={(e) => setSettingsForm({ ...settingsForm, social_telegram: e.target.value })}
                      placeholder="https://t.me/..."
                    />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input
                      value={settingsForm.social_whatsapp}
                      onChange={(e) => setSettingsForm({ ...settingsForm, social_whatsapp: e.target.value })}
                      placeholder="https://wa.me/..."
                    />
                  </div>
                  <div>
                    <Label>VK</Label>
                    <Input
                      value={settingsForm.social_vk}
                      onChange={(e) => setSettingsForm({ ...settingsForm, social_vk: e.target.value })}
                      placeholder="https://vk.com/..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-copper-400 mb-3">Футер и SEO</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Строка копирайта в футере</Label>
                    <Input
                      value={settingsForm.footer_text}
                      onChange={(e) => setSettingsForm({ ...settingsForm, footer_text: e.target.value })}
                      placeholder="© 2026 KOLOS. Все права защищены."
                    />
                  </div>
                  <div>
                    <Label>Заголовок сайта (вкладка браузера)</Label>
                    <Input
                      value={settingsForm.meta_title}
                      onChange={(e) => setSettingsForm({ ...settingsForm, meta_title: e.target.value })}
                      placeholder="KOLOS — Академия барберов"
                    />
                  </div>
                  <div>
                    <Label>Описание сайта (для поисковиков)</Label>
                    <Textarea
                      value={settingsForm.meta_description}
                      onChange={(e) => setSettingsForm({ ...settingsForm, meta_description: e.target.value })}
                      placeholder="Премиальная платформа онлайн-обучения для барберов..."
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button type="submit">Сохранить настройки</Button>
                {settingsSaved && <span className="text-sm text-copper-400">Сохранено ✓</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
