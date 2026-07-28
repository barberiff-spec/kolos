import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Star } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { PromoBanner } from "@/components/landing/promo-banner";
import { serverFetch } from "@/lib/server-api";
import { formatPrice } from "@/lib/utils";
import type { CourseListItem, FAQ, Review, SiteSettings } from "@/lib/types";

const DEFAULT_HERO_TITLE = "Академия барберинга нового уровня";
const DEFAULT_HERO_SUBTITLE =
  "Мужские стрижки и фейды, бритьё с горячими полотенцами, уход за бородой " +
  "и работа с инструментами — обучение от мастеров премиальных барбершопов.";

const HERO_CALLOUTS = [
  { label: "Стрижки и фейды", style: "top-[8%] left-[6%] md:left-[10%]" },
  { label: "Бритьё и уход за бородой", style: "top-[42%] right-[6%] md:right-[10%]" },
  { label: "Сертификат по итогам курса", style: "bottom-[10%] left-[8%] md:left-[14%]" },
];

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

export default async function HomePage() {
  const { courses, reviews, faqs, settings } = await getData();
  const minPrice = courses.length > 0 ? Math.min(...courses.map((c) => c.price)) : null;
  const heroTitle = settings?.hero_title || DEFAULT_HERO_TITLE;
  const heroSubtitle = settings?.hero_subtitle || DEFAULT_HERO_SUBTITLE;
  const heroImage = courses[0]?.image_url;

  return (
    <div>
      <section className="container mx-auto px-4 pt-10 md:pt-16">
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface overflow-hidden">
          {/* Top bar: eyebrow badge left, small course thumbnails right — split by the same
              vertical line that runs through the whole hero. */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex items-center px-6 md:px-10 py-6 md:border-r border-border">
              <div className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted">
                <Sparkles className="h-3.5 w-3.5" />
                {minPrice ? `Курсы от ${formatPrice(minPrice)}` : "Премиальное обучение барберов"}
              </div>
            </div>
            <div className="hidden md:flex items-center justify-end gap-3 px-10 py-6">
              {courses.slice(0, 2).map((c) => (
                <div
                  key={c.id}
                  className="h-14 w-14 rounded-2xl overflow-hidden bg-surface-2 border border-border shrink-0"
                >
                  {c.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.image_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Photo straddling the vertical divider, with thin leader-line callouts —
              the annotated-product-shot motif, applied to a barbershop photo. */}
          <div className="relative mx-6 md:mx-10 aspect-[16/9] md:aspect-[21/9] rounded-[var(--radius-md)] overflow-hidden bg-surface-2">
            {heroImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover grayscale" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-border/40 to-surface-2" />
            )}
            <div className="hidden md:block">
              {HERO_CALLOUTS.map((c) => (
                <span
                  key={c.label}
                  className={`absolute ${c.style} rounded-full bg-surface/90 border border-border px-3 py-1 text-xs text-text backdrop-blur-sm`}
                >
                  {c.label}
                </span>
              ))}
            </div>
          </div>

          {/* Text zone: left = eyebrow + short statement, right = big two-tone headline —
              same bottom-anchored split as the reference. */}
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="flex items-end px-6 md:px-10 py-10 md:py-14 md:border-r border-border">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted mb-3">Академия KOLOS</p>
                <p className="text-lg md:text-xl font-bold leading-snug max-w-sm">{heroTitle}</p>
              </div>
            </div>
            <div className="px-6 md:px-10 py-10 md:py-14">
              <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight leading-[0.95] mb-5">
                KOLOS <span className="text-muted">Барбершоп</span>
              </h1>
              <p className="text-muted leading-relaxed max-w-md">{heroSubtitle}</p>
            </div>
          </div>

          {/* Bottom CTA bar. */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 md:px-10 py-6 border-t border-border">
            <Link
              href="/courses"
              className="group inline-flex items-center gap-4 rounded-full bg-inverse py-2 pl-6 pr-2 text-on-inverse"
            >
              <span className="font-medium">Смотреть курсы</span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-on-inverse text-inverse transition-transform group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
            <Link href="/auth/login?mode=register" className="text-sm font-medium underline underline-offset-4">
              Регистрация
            </Link>
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
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div className="premium-card text-center py-12">
            <p className="text-muted">Курсы скоро появятся</p>
          </div>
        )}
      </section>

      {reviews.length > 0 && (
        <section className="container mx-auto px-4 py-20 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold uppercase tracking-tight mb-3">Отзывы барберов</h2>
            <p className="text-muted">Те, кто уже прошёл KOLOS</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {reviews.map((review) => (
              <article key={review.id} className="premium-card">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: review.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-text text-text" />
                  ))}
                </div>
                <p className="text-muted leading-relaxed mb-6">&ldquo;{review.text}&rdquo;</p>
                <p className="font-semibold text-text">{review.author_name}</p>
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
              <details key={faq.id} className="premium-card group" open={faq.id === faqs[0]?.id}>
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
