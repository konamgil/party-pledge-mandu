"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `로그인 실패 (${res.status})`);
      }
      const url = new URL(window.location.href);
      const redirect = url.searchParams.get("redirect") ?? "/";
      window.location.href = redirect;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <header className="text-center mb-6">
          <a
            href="/"
            className="inline-flex items-center gap-1.5 font-display font-bold text-primary text-xl"
          >
            <span className="bg-primary text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold">
              공
            </span>
            공약포럼
          </a>
          <h1 className="text-lg font-bold text-gray-800 mt-3">로그인 또는 가입</h1>
          <p className="text-xs text-gray-500 mt-1">이메일 하나로 시작하세요</p>
        </header>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="text-sm text-gray-600">
            이메일
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/20"
            />
          </label>
          <label className="text-sm text-gray-600">
            이름 <span className="text-xs text-gray-400">(신규 가입 시)</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="홍길동"
              className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/20"
            />
          </label>
          <p className="text-xs text-gray-400 -mt-1">
            기존 이메일이면 로그인, 없으면 자동 가입됩니다. (비밀번호 없음 · mock 인증)
          </p>
          {error && (
            <p className="text-sm text-red-500" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || email.trim().length === 0}
            className="bg-primary text-white font-semibold py-2.5 rounded-full shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? "처리 중…" : "로그인 / 가입"}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-4">
          <a href="/" className="hover:text-primary">
            ← 홈으로
          </a>
        </p>
      </div>
    </main>
  );
}
