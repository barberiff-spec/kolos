import Link from "next/link";
import { serverFetch } from "@/lib/server-api";
import { formatPrice } from "@/lib/utils";
import type { CourseListItem } from "@/lib/types";

export const metadata = {
  title: "KOLOS — мобильная версия",
};

export default async function MobileHomePage() {
  const courses = ((await serverFetch<CourseListItem[]>("/courses?published_only=true")) || []).slice(0, 6);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold uppercase tracking-tight mb-3 gradient-text">KOLOS</h1>
        <p className="text-muted mb-6">Академия барберинга</p>
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <Link
            href="/courses"
            className="inline-flex h-12 items-center justify-center rounded-full bg-accent text-bg font-medium"
          >
            Смотреть курсы
          </Link>
          <Link
            href="/auth/login?mode=register"
            className="inline-flex h-12 items-center justify-center rounded-full border border-accent/20"
          >
            Регистрация
          </Link>
        </div>
      </div>

      {courses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold uppercase tracking-tight">Курсы</h2>
          {courses.map((course) => (
            <Link key={course.id} href={`/course/${course.id}`} className="block premium-card border-accent/10">
              <p className="font-semibold text-accent">{course.title}</p>
              <p className="text-sm text-muted mt-1 line-clamp-2">{course.short_description}</p>
              <p className="text-sm text-accent mt-2">{formatPrice(course.price)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
