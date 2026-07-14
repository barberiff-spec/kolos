"use client";

import { Star } from "lucide-react";
import type { Review } from "@/lib/types";

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null;

  return (
    <section className="container mx-auto px-4 py-20 border-t border-accent/10">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Отзывы барберов</h2>
        <p className="text-muted">Те, кто уже прошёл KOLOS</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {reviews.map((review) => (
          <div key={review.id} className="premium-card border-accent/10">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: review.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-accent text-accent" />
              ))}
            </div>
            <p className="text-muted leading-relaxed mb-6">&ldquo;{review.text}&rdquo;</p>
            <div>
              <p className="font-semibold text-accent">{review.author_name}</p>
              {review.author_role && (
                <p className="text-xs text-muted mt-0.5">{review.author_role}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
