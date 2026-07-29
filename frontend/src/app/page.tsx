import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { CourseCard } from "@/components/courses/course-card";
import { PromoBanner } from "@/components/landing/promo-banner";
import { serverFetch } from "@/lib/server-api";
import { formatPrice } from "@/lib/utils";
import type { CourseListItem, FAQ, Review, SiteSettings } from "@/lib/types";

const DEFAULT_HERO_TITLE = "Академия барберинга нового уровня";
const DEFAULT_HERO_SUBTITLE =
  "Мужские стрижки и фейды, бритьё с горячими полотенцами, уход за бородой " +
  "и работа с инструментами — обучение от мастеров элитных студий барберинга.";

// Skill labels, set over the photo's lower edge rather than as leader lines
// pointing at the subject from outside — the photo now fills its whole panel,
// so there is no margin left to run a line through.
const HERO_SKILLS = [
  { lead: "Фейд", tail: "и переходы" },
  { lead: "Контур", tail: "и окантовка" },
  { lead: "Борода", tail: "и стайлинг" },
  { lead: "Финиш", tail: "и укладка" },
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
  const heroImage = "/hero/portrait.jpg";

  return (
    <div>
      {/* Split hero: two rounded panels on a black field. Left carries the
          CTA copy; right is the portrait filling its panel edge-to-edge,
          with the heading and skill tags set directly over the photo. */}
      <section className="bg-inverse p-3 md:p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* LEFT PANEL */}
          <div className="bg-surface rounded-[var(--radius-lg)] px-7 md:px-10 pt-7 md:pt-9 pb-9 md:pb-12 flex flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted">
              <Sparkles className="h-3.5 w-3.5" />
              {minPrice ? `Курсы от ${formatPrice(minPrice)}` : "Премиальное обучение барберов"}
            </div>

            <div className="mt-auto pt-10 md:pt-8">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted mb-3">Академия KOLOS</p>
              <p className="text-lg md:text-xl font-bold leading-snug max-w-xs mb-8">{heroTitle}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                <Link
                  href="/courses"
                  className="glow-on-hover group inline-flex items-center gap-4 rounded-full bg-inverse py-2 pl-6 pr-2 text-on-inverse shadow-inverse hover:shadow-inverse-hover hover:-translate-y-0.5"
                >
                  <span className="font-medium">Смотреть курсы</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-on-inverse text-inverse transition-transform group-hover:translate-x-0.5">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
                <Link
                  href="/auth/login?mode=register"
                  className="text-sm font-medium underline underline-offset-4 hover:text-muted"
                >
                  Регистрация
                </Link>
                <div className="hidden sm:flex items-center gap-2 sm:ml-auto">
                  {courses.slice(0, 2).map((c) => (
                    <div
                      key={c.id}
                      className="h-12 w-12 rounded-2xl overflow-hidden bg-surface border border-border shadow-card"
                    >
                      {c.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image_url} alt="" className="h-full w-full object-cover photo-mono" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL — the photo fills the whole panel edge-to-edge,
              cropped with the panel's own corner radius, instead of floating
              as a cutout on top of it. Title/subtitle sit directly on the
              photo over a bottom scrim so they stay legible against any
              crop; the skill tags read as captions on the image itself. */}
          <div className="relative rounded-[var(--radius-lg)] overflow-hidden aspect-[4/5] md:aspect-auto flex flex-col justify-end">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover object-[30%_center] photo-mono"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />
            <div className="relative z-10 p-7 md:p-10">
              <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-[-0.03em] leading-[0.9] text-on-inverse mb-4">
                KOLOS <span className="text-on-inverse/55">Академия</span>
              </h1>
              <p className="text-on-inverse/70 leading-relaxed max-w-md mb-6">{heroSubtitle}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {HERO_SKILLS.map((s) => (
                  <span key={s.lead} className="text-[11px] leading-none whitespace-nowrap">
                    <span className="font-bold text-on-inverse">{s.lead}</span>{" "}
                    <span className="text-on-inverse/55">{s.tail}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {settings?.promo_banner_enabled !== false && (
        <PromoBanner text={settings?.promo_banner_text || undefined} />
      )}

      <section className="container mx-auto px-4 py-20 md:py-28">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-2">Популярные курсы</h2>
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
        <section className="container mx-auto px-4 py-20 md:py-28 border-t border-border">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-3">Отзывы барберов</h2>
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

      <section className="bg-charcoal text-on-inverse">
        <div className="container mx-auto px-4 py-20 md:py-28 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight leading-[1.05] mb-5">
            Готовы стать <span className="text-on-inverse/50">мастером?</span>
          </h2>
          <p className="text-on-inverse/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Начните с любого курса — видеоуроки, практика и именной сертификат по итогам обучения.
          </p>
          <Link
            href="/auth/login?mode=register"
            className="glow-on-hover group inline-flex items-center gap-4 rounded-full bg-on-inverse py-2 pl-6 pr-2 text-inverse shadow-inverse hover:shadow-glow-hover hover:-translate-y-0.5"
          >
            <span className="font-medium">Начать бесплатно</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-inverse text-on-inverse transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-3">Частые вопросы</h2>
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
