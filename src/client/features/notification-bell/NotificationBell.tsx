"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";

interface Me {
  id: string;
}

export function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState<Me | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { user: Me | null }) => {
        if (cancelled) return;
        setUser(j.user);
      })
      .catch(() => {})
      .finally(() => !cancelled && setAuthChecked(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchUnread = () => {
      fetch(`/api/notifications?userId=${encodeURIComponent(user.id)}&limit=1`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((j: { unread?: number }) => {
          if (!cancelled) setUnread(j.unread ?? 0);
        })
        .catch(() => {});
    };
    fetchUnread();
    const t = setInterval(fetchUnread, 60_000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [user]);

  if (!authChecked || !user) {
    return (
      <a
        href="/notifications"
        className="relative text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
        aria-label="알림"
      >
        <Bell className="w-5 h-5" />
      </a>
    );
  }

  return (
    <a
      href="/notifications"
      className="relative text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
      aria-label={unread > 0 ? `읽지 않은 알림 ${unread}개` : "알림"}
    >
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </a>
  );
}
