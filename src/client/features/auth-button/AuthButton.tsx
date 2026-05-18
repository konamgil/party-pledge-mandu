"use client";

import { useEffect, useState } from "react";

interface Me {
  id: string;
  email: string;
  name: string;
}

export function AuthButton() {
  const [user, setUser] = useState<Me | null>(null);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { user: Me | null }) => setUser(j.user))
      .catch(() => setUser(null));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
    setOpen(false);
  }

  if (!hydrated) {
    return (
      <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold">
        U
      </span>
    );
  }

  if (!user) {
    return (
      <a
        href="/login"
        className="text-xs font-semibold text-primary border border-primary/30 rounded-full px-3 py-1.5 hover:bg-primary/5 transition-colors"
      >
        로그인
      </a>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xs font-bold"
        aria-label={`${user.name} 메뉴`}
      >
        {user.name.slice(0, 1)}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 text-sm z-50">
          <div className="px-3 py-2 border-b border-gray-100">
            <div className="font-semibold text-gray-800">{user.name}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
