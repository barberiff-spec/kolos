import Link from "next/link";
import { ArrowRight, Award, Play, Scissors, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { PromoBanner } from "@/components/landing/promo-banner";
import { FAQSection } from "@/components/landing/faq-section";
import { ReviewsSection } from "@/components/landing/reviews-section";
import { serverFetch } from "@/lib/server-api";
import { formatPrice } from "@/lib/utils";
import type { CourseListItem, FAQ, Review } from "@/lib/types";

async function getData() {
  const [courses, reviews, faqs] = await Promise.all([
    serverFetch<CourseListItem[]>("/courses?published_only=true"),
    serverFetch<Review[]>("/content/reviews"),
    serverFetch<FAQ[]>("/content/faq"),
  ]);
  return {
    courses: (courses || []).slice(0, 3),
    reviews: reviews || [],
    faqs: faqs || [],
  };
}

export default async function HomePage() {
  const { courses, reviews, faqs } = await getData();
  const minPrice = courses.length > 0 ? Math.min(...courses.map((c) => c.price)) : null;

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 md:py-36 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-sm text-copper-400 mb-8 border border-copper-500/20">
              <Sparkles className="h-4 w-4" />
              {minPrice ? `Курсы от ${formatPrice(minPrice)}` : "Премиальное обучение барберов"}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 font-[family-name:var(--font-playfair)]">
              <span className="gradient-text">KOLOS</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 font-light tracking-wide">
              Академия барберинга нового уровня
            </p>
            <p className="text-base text-muted-foreground/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Мужские стрижки и фейды, бритьё с горячими полотенцами, уход за бородой
              и работа с инструментами — обучение от мастеров премиальных барбершопов.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses">
                <Button size="lg">
                  Смотреть курсы
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/auth/login?mode=register">
                <Button variant="outline" size="lg">
                  <Play className="h-5 w-5" />
                  Зарегистрироваться
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto">
            {[
              { icon: Scissors, title: "Стрижки и фейды", desc: "Низкий, средний, под кожу и классика" },
              { icon: Award, title: "Бритьё и борода", desc: "Горячие полотенца, контуринг, уход" },
              { icon: Sparkles, title: "Премиальный формат", desc: "Видеоуроки, сертификаты, прогресс" },
            ].map((item) => (
              <div key={item.title} className="premium-card text-center border-copper-500/10">
                <item.icon className="h-8 w-8 text-copper-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-1 text-copper-100">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PromoBanner />

      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold mb-2 font-[family-name:var(--font-playfair)]">Популярные курсы</h2>
            <p className="text-muted-foreground">Выберите направление и начните путь мастера</p>
          </div>
          <Link href="/courses" className="hidden sm:block">
            <Button variant="ghost">
              Все курсы
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <CourseCard key={course.id} course={course} index={i} />
            ))}
          </div>
        ) : (
          <div className="premium-card text-center py-12">
            <p className="text-muted-foreground">Запустите backend для загрузки курсов</p>
          </div>
        )}
      </section>

      <ReviewsSection reviews={reviews} />
      <FAQSection faqs={faqs} />
    </div>
  );
}
