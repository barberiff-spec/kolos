"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { CourseListItem } from "@/lib/types";

interface CourseCardProps {
  course: CourseListItem;
  index?: number;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/course/${course.id}`}>
      <Card className="group overflow-hidden p-0 h-full border-accent/10">
        <div className="relative aspect-video overflow-hidden bg-bg">
          {course.image_url ? (
            // Native img — avoids Next image optimizer requesting 3840px on mobile
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
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
            <span className="inline-block rounded-full bg-accent/90 px-3 py-1 text-sm font-semibold text-bg border border-accent/30">
              {formatPrice(course.price)}
            </span>
          </div>
        </div>
        <CardContent className="p-5">
          <h3 className="font-semibold text-lg mb-2 group-hover:text-accent transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-muted line-clamp-2 mb-4">
            {course.short_description}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5 text-accent" />
              {course.lessons_count} уроков
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
