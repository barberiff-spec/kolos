import { Suspense } from "react";
import LearnContent from "./learn-content";

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-copper-500 border-t-transparent" />
        </div>
      }
    >
      <LearnContent />
    </Suspense>
  );
}
