"use client";

import { useEffect, useState } from "react";

interface CommentFormProps {
  pledgeId: string;
}

interface MeResponse {
  user: { id: string; email: string; name: string } | null;
}

export function CommentForm({ pledgeId }: CommentFormProps) {
  const [user, setUser] = useState<MeResponse["user"]>(null);
  const [hydrated, setHydrated] = useState(false);
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j: MeResponse) => setUser(j.user))
      .catch(() => setUser(null));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      let currentUser = user;
      if (!currentUser) {
        const login = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email: email.trim() }),
        });
        if (!login.ok) {
          const errBody = (await login.json().catch(() => ({}))) as { error?: string };
          throw new Error(errBody.error ?? `로그인 실패 (${login.status})`);
        }
        const loginBody = (await login.json()) as { user: NonNullable<MeResponse["user"]> };
        currentUser = loginBody.user;
        setUser(currentUser);
      }
      const post = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pledgeId, userId: currentUser.id, body: body.trim() }),
      });
      if (!post.ok) throw new Error(`댓글 등록 실패 (${post.status})`);
      setBody("");
      if (typeof window !== "undefined") window.location.reload();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  if (!hydrated) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 text-sm text-gray-400">
        댓글 작성 폼 로드 중…
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3"
    >
      {user ? (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            <span className="font-semibold text-gray-700">{user.name}</span> ({user.email})
            으로 댓글 작성
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 underline"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div>
          <label className="text-xs text-gray-500 block mb-1">
            이메일 (admin@lamysolution.com 또는 test@example.com)
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/20"
          />
        </div>
      )}
      <textarea
        required
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="공약에 대한 의견을 남겨주세요"
        rows={3}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/20"
      />
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || body.trim().length === 0}
          className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "등록 중…" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}
