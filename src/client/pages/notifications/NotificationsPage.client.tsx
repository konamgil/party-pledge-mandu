"use client";

import { useEffect, useState } from "react";
import { Bell, MessageCircle, ThumbsUp } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  pledgeId: string | null;
  commentId: string | null;
  isRead: boolean;
  createdAt: string;
}

interface Me {
  id: string;
  email: string;
  name: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

function IconFor({ type }: { type: string }) {
  if (type === "comment") return <MessageCircle className="w-5 h-5 text-primary" />;
  if (type === "reply") return <MessageCircle className="w-5 h-5 text-blue-500" />;
  if (type === "vote") return <ThumbsUp className="w-5 h-5 text-orange-500" />;
  return <Bell className="w-5 h-5 text-gray-400" />;
}

export function NotificationsPage() {
  const [user, setUser] = useState<Me | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { user: Me | null }) => setUser(j.user))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    fetch(`/api/notifications?userId=${encodeURIComponent(user.id)}&limit=100`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((j: { data: Notification[]; unread?: number }) =>
        setItems(Array.isArray(j.data) ? j.data : []),
      )
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ isRead: true }),
    });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  async function markAllRead() {
    const unread = items.filter((n) => !n.isRead);
    await Promise.all(
      unread.map((n) =>
        fetch(`/api/notifications/${n.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ isRead: true }),
        }),
      ),
    );
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  if (!authChecked) {
    return <main className="min-h-screen flex items-center justify-center text-gray-400">로딩 중…</main>;
  }
  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-gray-600 mb-4">알림은 로그인 후 확인 가능합니다.</p>
        <a href="/login?redirect=/notifications" className="bg-primary text-white font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90">
          로그인하러 가기
        </a>
      </main>
    );
  }

  const unreadCount = items.filter((n) => !n.isRead).length;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>

      <header className="flex items-center justify-between mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />
          알림
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h1>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-sm text-primary hover:underline"
          >
            모두 읽음
          </button>
        )}
      </header>

      {loading ? (
        <p className="text-center text-gray-400 py-12">로딩 중…</p>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">새 알림이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <a
              key={n.id}
              href={n.pledgeId ? `/pledges/${n.pledgeId}` : "#"}
              onClick={() => !n.isRead && markRead(n.id)}
              className={`flex gap-3 p-4 rounded-xl border transition-colors ${
                n.isRead
                  ? "bg-white border-gray-200"
                  : "bg-primary/5 border-primary/20 hover:bg-primary/10"
              }`}
            >
              <div className="shrink-0 pt-0.5">
                <IconFor type={n.type} />
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className={`text-sm ${n.isRead ? "text-gray-700" : "font-semibold text-gray-900"}`}>
                    {n.title}
                  </h3>
                  {!n.isRead && <span className="w-2 h-2 bg-red-500 rounded-full" />}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
