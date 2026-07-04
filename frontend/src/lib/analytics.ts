declare global {
  interface Window {
    ym?: (id: number, method: string, target: string, params?: Record<string, unknown>) => void;
  }
}

const YM_ID = process.env.NEXT_PUBLIC_YM_ID ? Number(process.env.NEXT_PUBLIC_YM_ID) : null;

export function trackGoal(name: string, params?: Record<string, unknown>) {
  if (!YM_ID || typeof window === "undefined" || !window.ym) return;
  window.ym(YM_ID, "reachGoal", name, params);
}

export function trackPurchase(courseId: number, amount: number) {
  trackGoal("purchase", { course_id: courseId, order_price: amount });
}
