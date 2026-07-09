import { CourseCard } from "@/components/courses/course-card";
import { serverFetch } from "@/lib/server-api";
import type { CourseListItem } from "@/lib/types";

async function getCourses(): Promise<CourseListItem[]> {
  return (await serverFetch<CourseListItem[]>("/courses?published_only=true")) || [];
}

export const metadata = {
  title: "Каталог курсов — KOLOS",
};

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 font-[family-name:var(--font-playfair)]">
          Каталог курсов
        </h1>
        <p className="text-muted-foreground">
          {courses.length} {courses.length === 1 ? "курс" : "курсов"} для барберов
        </p>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      ) : (
        <div className="premium-card text-center py-16">
          <p className="text-muted-foreground text-lg">Курсы пока не добавлены</p>
          <p className="text-sm text-muted-foreground mt-2">
            Загляните позже — каталог скоро пополнится
          </p>
        </div>
      )}
    </div>
  );
}
