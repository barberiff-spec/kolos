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

// Leader-line callouts: a short line + dot pointing from a label in the
// margin into the photo — the reference's annotated-product-shot motif,
// not a pill badge sitting on top of the image.
const HERO_CALLOUTS = [
  { label: "Стрижки и фейды", top: "18%", side: "left" as const },
  { label: "Бритьё и уход за бородой", top: "48%", side: "right" as const },
  { label: "Сертификат по итогам курса", top: "80%", side: "left" as const },
];

function HeroCallout({ label, top, side }: { label: string; top: string; side: "left" | "right" }) {
  // `left-0`/`right-0` on an absolutely positioned element sit at the
  // containing block's PADDING-box edge, i.e. before the parent's own
  // padding is applied — not at the visual edge the padding creates. So
  // the offset has to match the photo row's padding value exactly (36 =
  // px-36) for the dot to land right on the photo's edge instead of out
  // past the card's own border.
  return (
    <div
      className={`absolute flex items-center gap-2 ${side === "left" ? "left-36 -translate-x-full pr-2" : "right-36 translate-x-full pl-2 flex-row-reverse"}`}
      style={{ top }}
    >
      <span className="text-xs text-muted whitespace-nowrap">{label}</span>
      <span className={`h-px w-6 bg-border ${side === "right" ? "scale-x-[-1]" : ""}`} />
      <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-border" />
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
      {/* Split hero: one continuous card cut by a thin vertical line — not a bold
          gutter — with the photo floating dominant across the seam and thin
          leader-line callouts pointing into it from the margins. Matches the
          reference's actual structure: single card, hairline divider, product
          shot breaking out of the grid, mini shots sitting by the CTA. */}
      <section className="container mx-auto px-4 pt-6 md:pt-8">
        <div className="relative rounded-[var(--radius-lg)] border border-border bg-surface shadow-elevated">
          {/* Hairline divider — desktop only, spans the full card height. */}
          <div className="hidden md:block absolute inset-y-0 left-1/2 w-px bg-border z-10" />

          {/* Top bar: just the eyebrow badge — KOLOS's own site nav already
              lives in the sticky Navbar above, so this isn't a second header. */}
          <div className="relative px-6 md:px-10 pt-6 md:pt-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted">
              <Sparkles className="h-3.5 w-3.5" />
              {minPrice ? `Курсы от ${formatPrice(minPrice)}` : "Премиальное обучение барберов"}
            </div>
          </div>

          {/* The dominant product shot: margin either side leaves room for the
              leader-line callouts, and a light object-contain frame (instead of
              a cropping object-cover) shows the whole photo the way the
              reference shows the whole drone rather than cropping into it. */}
          <div className="relative px-8 md:px-36 pt-8 md:pt-10 pb-4">
            <div className="relative mx-auto aspect-[4/3] md:aspect-[16/9] max-w-2xl rounded-[var(--radius-md)] bg-surface-2 shadow-card">
              {heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={heroImage}
                  alt=""
                  className="absolute inset-0 h-full w-full object-contain photo-mono p-2"
                />
              ) : (
                <div className="absolute inset-0 rounded-[var(--radius-md)] bg-gradient-to-br from-border/40 to-surface-2" />
              )}
            </div>
            <div className="hidden md:block">
              {HERO_CALLOUTS.map((c) => (
                <HeroCallout key={c.label} {...c} />
              ))}
            </div>
          </div>

          {/* Bottom: short statement + CTA + mini shots (left) / oversized
              two-tone headline (right) — same two-column split as the
              reference's text zone. */}
          <div className="relative grid grid-cols-1 md:grid-cols-2">
            <div className="px-6 md:px-10 pt-6 pb-8 md:pb-11 md:pr-10">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted mb-3">Академия KOLOS</p>
              <p className="text-lg md:text-xl font-bold leading-snug max-w-sm mb-8">{heroTitle}</p>
              <div className="flex items-center gap-6">
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
                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  {courses.slice(0, 2).map((c) => (
                    <div key={c.id} className="h-11 w-11 rounded-2xl overflow-hidden bg-surface-2 border border-border shrink-0">
                      {c.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image_url} alt="" className="h-full w-full object-cover photo-mono" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 md:px-10 pt-6 pb-8 md:pb-11 md:pl-10 md:border-l border-border/0">
              <h1 className="text-5xl md:text-7xl font-extrabold uppercase tracking-[-0.03em] leading-[0.9] mb-6">
                KOLOS <span className="text-muted">Академия</span>
              </h1>
              <p className="text-muted leading-relaxed max-w-md">{heroSubtitle}</p>
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
