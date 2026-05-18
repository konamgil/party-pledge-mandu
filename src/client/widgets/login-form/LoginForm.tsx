"use client";

import { useState } from "react";

export function LoginForm() {
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
  );
}
