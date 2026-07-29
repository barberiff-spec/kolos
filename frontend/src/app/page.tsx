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
  "и работа с инструментами — обучение от мастеров элитных студий барберинга.";

// Hero photo geometry, all derived from the source file's real aspect ratio
// (1102x1494, tightly cropped to the subject) so the reserved space below it
// always matches what the image actually occupies — no hand-tuned
// min-heights that drift when the photo or the copy changes.
const HERO_PHOTO_W = 29;
const HERO_PHOTO_H = +(HERO_PHOTO_W * (1494 / 1102)).toFixed(2);
const HERO_PHOTO_TOP = 4.5; // clears the eyebrow badge above it
const HERO_PHOTO_HALF = HERO_PHOTO_W / 2;
const HERO_PHOTO_BOTTOM = HERO_PHOTO_TOP + HERO_PHOTO_H;
const HERO_BADGE_BAND = 4.375; // pt-9 + the badge pill's own height

// Leader-line callouts, styled like the reference's: a hairline + end dot,
// label set in two tones (bold lead word, muted tail). Tops are absolute rem
// values inside the photo's vertical band, so they stay pinned to the subject
// instead of sliding around as percentages of a changing container height.
const HERO_CALLOUTS = [
  { lead: "Фейд", tail: "и переходы", top: 15, side: "left" as const },
  { lead: "Контур", tail: "и окантовка", top: 33, side: "left" as const },
  { lead: "Борода", tail: "и стайлинг", top: 22, side: "right" as const },
  { lead: "Финиш", tail: "и укладка", top: 40, side: "right" as const },
];

function HeroCallout({
  lead,
  tail,
  top,
  side,
}: {
  lead: string;
  tail: string;
  top: number;
  side: "left" | "right";
}) {
  const isLeft = side === "left";
  const inset = `calc(50% + ${HERO_PHOTO_HALF}rem + 1rem)`;
  return (
    <div
      className={`hidden md:flex absolute z-30 items-center gap-3 ${isLeft ? "flex-row" : "flex-row-reverse"}`}
      style={isLeft ? { top: `${top}rem`, right: inset } : { top: `${top}rem`, left: inset }}
    >
      <span className="text-[11px] leading-none whitespace-nowrap">
        <span className="font-bold text-text">{lead}</span>{" "}
        <span className="text-muted">{tail}</span>
      </span>
      <span className="h-px w-10 bg-border" />
      <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-border bg-surface" />
    </div>
  );
}

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
      {/* Split hero, matching the reference exactly: two rounded panels on a
          black field, with the seam running between them — and the photo
          floating on top, centred over that seam so the line is interrupted
          by the subject rather than cutting across it. Panels carry the
          content; the photo, leader lines and mini shots are overlays whose
          vertical bands are reserved by the panels' min-height + padding,
          so nothing can collide. */}
      <section className="bg-inverse p-3 md:p-4">
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {/* LEFT PANEL */}
          <div className="bg-surface rounded-[var(--radius-lg)] px-7 md:px-10 pt-7 md:pt-9 pb-9 md:pb-12 flex flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted">
              <Sparkles className="h-3.5 w-3.5" />
              {minPrice ? `Курсы от ${formatPrice(minPrice)}` : "Премиальное обучение барберов"}
            </div>

            {/* Mobile keeps the photo inline — there is no seam to straddle.
                Its backdrop was cut out to pure white in the source file, so
                it uses photo-mono-bright (no brightness dip) to actually stay
                white against the panel instead of reading as a gray box. */}
            <div className="md:hidden relative mt-7">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage} alt="" className="w-full h-auto photo-mono-bright" />
            </div>

            {/* Reserves exactly the band the overlaid photo occupies, so the
                copy below can never end up underneath it. */}
            <div
              aria-hidden
              className="hidden md:block"
              style={{ height: `${HERO_PHOTO_BOTTOM - HERO_BADGE_BAND}rem` }}
            />

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
                {/* Mini shots live here rather than floating over the seam:
                    as an overlay they collided with both the photo above and
                    the headline opposite at some viewport heights. */}
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

          {/* RIGHT PANEL */}
          <div className="bg-surface rounded-[var(--radius-lg)] px-7 md:px-10 pt-7 md:pt-9 pb-9 md:pb-12 flex flex-col">
            <div
              aria-hidden
              className="hidden md:block"
              style={{ height: `${HERO_PHOTO_BOTTOM - 2.25}rem` }}
            />
            <div className="mt-auto pt-10 md:pt-8">
              <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.9] mb-6">
                KOLOS <span className="text-muted">Академия</span>
              </h1>
              <p className="text-muted leading-relaxed max-w-md">{heroSubtitle}</p>
            </div>
          </div>

          {/* The subject, centred over the seam — no card chrome around it
              (no border/shadow/rounded box): the photo's own backdrop was
              cut out to pure white in the source file, so it merges straight
              into the panels instead of reading as a sticker on top of them.
              Being opaque white, it also masks the black seam behind it, so
              the divider stops at the subject instead of cutting through. */}
          <div
            className="hidden md:block absolute z-20 left-1/2 -translate-x-1/2"
            style={{ top: `${HERO_PHOTO_TOP}rem`, width: `${HERO_PHOTO_W}rem` }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt="" className="w-full h-auto photo-mono-bright" />
          </div>

          {HERO_CALLOUTS.map((c) => (
            <HeroCallout key={c.lead} {...c} />
          ))}
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
