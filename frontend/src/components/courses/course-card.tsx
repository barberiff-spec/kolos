"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { CourseListItem } from "@/lib/types";

interface CourseCardProps {
  course: CourseListItem;
  index?: number;
}

export function CourseCard({ course, index = 0 }: CourseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
    >
      <Link href={`/course/${course.id}`}>
        <Card className="group overflow-hidden p-0 h-full border-copper-500/10">
          <div className="relative aspect-video overflow-hidden">
            {course.image_url ? (
              <Image
                src={course.image_url}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-copper-900/40 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <span className="inline-block rounded-lg bg-copper-600/90 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm border border-copper-400/30">
                {formatPrice(course.price)}
              </span>
            </div>
          </div>
          <CardContent className="p-5">
            <h3 className="font-semibold text-lg mb-2 group-hover:text-copper-400 transition-colors line-clamp-2">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {course.short_description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5 text-copper-600" />
                {course.lessons_count} уроков
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}
