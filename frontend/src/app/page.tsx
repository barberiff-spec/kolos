import Link from "next/link";
import { ArrowRight, Award, BookOpen, Play, Scissors, Sparkles, Star } from "lucide-react";
import { PromoBanner } from "@/components/landing/promo-banner";
import { serverFetch } from "@/lib/server-api";
import { formatPrice } from "@/lib/utils";
import type { CourseListItem, FAQ, Review, SiteSettings } from "@/lib/types";

const DEFAULT_HERO_TITLE = "Академия барберинга нового уровня";
const DEFAULT_HERO_SUBTITLE =
  "Мужские стрижки и фейды, бритьё с горячими полотенцами, уход за бородой " +
  "и работа с инструментами — обучение от мастеров премиальных барбершопов.";

async function getData() {
  const [courses, reviews, faqs, settings] = await Promise.all([
    serverFetch<CourseListItem[]>("/courses?published_only=true"),
    serverFetch<Review[]>("/content/reviews"),
    serverFetch<FAQ[]>("/content/faq"),
    serverFetch<SiteSettings>("/settings"),
  ]);
  return {
    courses: (courses || []).slice(0, 3),
    reviews: reviews || [],
    faqs: faqs || [],
    settings,
  };
}

const btn =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium h-12 px-8";
const btnPrimary =
  `${btn} bg-accent text-bg shadow-card transition-all duration-200 ease-out hover:brightness-105 active:brightness-90`;
const btnOutline =
  `${btn} border border-border bg-transparent text-text transition-all duration-200 ease-out hover:bg-text/5 hover:border-accent/40`;

export default async function HomePage() {
  const { courses, reviews, faqs, settings } = await getData();
  const minPrice = courses.length > 0 ? Math.min(...courses.map((c) => c.price)) : null;
  const heroTitle = settings?.hero_title || DEFAULT_HERO_TITLE;
  const heroSubtitle = settings?.hero_subtitle || DEFAULT_HERO_SUBTITLE;

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-24 md:py-36 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 rounded-full glass px-5 py-2 text-sm text-accent mb-8 border border-accent/20">
              <Sparkles className="h-4 w-4" />
              {minPrice ? `Курсы от ${formatPrice(minPrice)}` : "Премиальное обучение барберов"}
            </div>
            <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tight mb-6">
              <span className="gradient-text">KOLOS</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted mb-4 font-light tracking-wide">
              {heroTitle}
            </p>
            <p className="text-base text-muted/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/courses" className={btnPrimary}>
                Смотреть курсы
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/auth/login?mode=register" className={btnOutline}>
                <Play className="h-5 w-5" />
                Зарегистрироваться
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto">
            {[
              { icon: Scissors, title: "Стрижки и фейды", desc: "Низкий, средний, под кожу и классика" },
              { icon: Award, title: "Бритьё и борода", desc: "Горячие полотенца, контуринг, уход" },
              { icon: Sparkles, title: "Премиальный формат", desc: "Видеоуроки, сертификаты, прогресс" },
            ].map((item) => (
              <div key={item.title} className="premium-card text-center border-accent/10">
                <item.icon className="h-8 w-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold mb-1 text-accent">{item.title}</h3>
                <p className="text-sm text-muted">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {settings?.promo_banner_enabled !== false && (
        <PromoBanner text={settings?.promo_banner_text || undefined} />
      )}

      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-2">Популярные курсы</h2>
            <p className="text-muted">Выберите направление и начните путь мастера</p>
          </div>
          <Link href="/courses" className="hidden sm:inline-flex items-center gap-2 text-sm text-muted hover:text-text">
            Все курсы
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link key={course.id} href={`/course/${course.id}`} className="block h-full">
                <article className="premium-card overflow-hidden p-0 h-full border-accent/10">
                  <div className="relative aspect-video overflow-hidden bg-bg">
                    {course.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.image_url}
                        alt={course.title}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-border/20 to-bg" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg/90 via-bg/20 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-block rounded-full bg-accent/90 px-3 py-1 text-sm font-semibold text-bg border border-accent/30">
                        {formatPrice(course.price)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-muted line-clamp-2 mb-4">{course.short_description}</p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      <BookOpen className="h-3.5 w-3.5 text-accent" />
                      {course.lessons_count} уроков
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div className="premium-card text-center py-12">
            <p className="text-muted">Курсы скоро появятся</p>
          </div>
        )}
      </section>

      {reviews.length > 0 && (
        <section className="container mx-auto px-4 py-20 border-t border-accent/10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-3">Отзывы барберов</h2>
            <p className="text-muted">Те, кто уже прошёл KOLOS</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reviews.map((review) => (
              <article key={review.id} className="premium-card border-accent/10">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-muted leading-relaxed mb-6">&ldquo;{review.text}&rdquo;</p>
                <p className="font-semibold text-accent">{review.author_name}</p>
                {review.author_role && (
                  <p className="text-xs text-muted mt-0.5">{review.author_role}</p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-3">Частые вопросы</h2>
            <p className="text-muted">Всё, что нужно знать перед стартом</p>
          </div>
          <div className="max-w-2xl mx-auto space-y-3">
            {faqs.map((faq) => (
              <details key={faq.id} className="premium-card border-accent/10 group" open={faq.id === faqs[0]?.id}>
                <summary className="cursor-pointer list-none font-medium p-5 [&::-webkit-details-marker]:hidden">
                  {faq.question}
                </summary>
                <p className="px-5 pb-5 text-muted leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
