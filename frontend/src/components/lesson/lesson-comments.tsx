"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import type { Comment } from "@/lib/types";

export function LessonComments({ lessonId }: { lessonId: number }) {
  const { isAuthenticated, user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.get<Comment[]>(`/comments/lesson/${lessonId}`).then((r) => setComments(r.data));
  };

  useEffect(() => {
    load();
  }, [lessonId]);

  const submit = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await api.post(`/comments/lesson/${lessonId}`, { content: text });
      setText("");
      load();
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    await api.delete(`/comments/${id}`);
    load();
  };

  return (
    <div className="premium-card border-accent/10">
      <h3 className="font-semibold flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-accent" />
        Вопросы и обсуждение
      </h3>

      <div className="space-y-4 mb-6">
        {comments.length === 0 && (
          <p className="text-sm text-muted">Пока нет комментариев. Задайте первый вопрос!</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl bg-text/[0.02] border border-text/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-medium text-sm">{c.user_name}</span>
                {c.user_role === "admin" && (
                  <span className="ml-2 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded">Мастер</span>
                )}
              </div>
              {(user?.role === "admin" || user?.id === c.user_id) && (
                <button onClick={() => remove(c.id)} className="text-muted hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted">{c.content}</p>
          </div>
        ))}
      </div>

      {isAuthenticated ? (
        <div className="space-y-3">
          <Textarea
            placeholder="Задайте вопрос по уроку..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button onClick={submit} disabled={loading} size="sm">
            <Send className="h-4 w-4" />
            Отправить
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted">Войдите, чтобы оставить комментарий</p>
      )}
    </div>
  );
}
