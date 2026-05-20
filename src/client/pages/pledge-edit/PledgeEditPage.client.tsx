"use client";

import { useEffect, useState } from "react";

interface Me {
  id: string;
  email: string;
  name: string;
}

interface Pledge {
  id: string;
  title: string;
  summary: string;
  category: string;
  author: string;
  tags: string[] | string;
}

interface Props {
  pledgeId: string;
}

export function PledgeEditPage({ pledgeId }: Props) {
  const [user, setUser] = useState<Me | null>(null);
  const [pledge, setPledge] = useState<Pledge | null>(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/pledges/${pledgeId}`, { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([me, p]: [{ user: Me | null }, { data: Pledge }]) => {
        setUser(me.user);
        if (p?.data) {
          setPledge(p.data);
          setTitle(p.data.title);
          setSummary(p.data.summary);
          setCategory(p.data.category);
          const t = Array.isArray(p.data.tags)
            ? p.data.tags
            : typeof p.data.tags === "string"
              ? safeParseArray(p.data.tags)
              : [];
          setTags(t.join(", "));
        }
      })
      .finally(() => setLoading(false));
  }, [pledgeId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const tagsArr = tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await fetch(`/api/pledges/${pledgeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ title, summary, category, tags: tagsArr }),
    });
    setSaving(false);
    if (res.ok) {
      window.location.href = `/pledges/${pledgeId}`;
    } else {
      const j = await res.json().catch(() => ({}));
      setError((j as { error?: string }).error ?? `저장 실패 (${res.status})`);
    }
  }

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center text-gray-400">로딩 중…</main>;
  }
  if (!pledge) {
    return (
      <main className="max-w-2xl mx-auto p-12 text-center">
        <p className="text-gray-500">공약을 찾을 수 없습니다.</p>
        <a href="/" className="text-primary underline mt-4 inline-block">홈으로</a>
      </main>
    );
  }
  if (!user || user.name !== pledge.author) {
    return (
      <main className="max-w-2xl mx-auto p-12 text-center">
        <p className="text-gray-500">이 공약을 수정할 권한이 없습니다.</p>
        <a href={`/pledges/${pledgeId}`} className="text-primary underline mt-4 inline-block">공약 보기</a>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <a href={`/pledges/${pledgeId}`} className="text-sm text-gray-500 hover:text-primary">← 공약 상세</a>
      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-6">공약 수정</h1>
      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-700">제목</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-700">요약</span>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={6}
            required
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-700">분야</span>
          <input
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-gray-700">태그 (쉼표 구분)</span>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="청년, 일자리, 주거"
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <div className="flex justify-end gap-2">
          <a
            href={`/pledges/${pledgeId}`}
            className="text-sm text-gray-500 px-4 py-2 rounded-full hover:bg-gray-100"
          >
            취소
          </a>
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-primary/90 disabled:opacity-50"
          >
            {saving ? "저장 중…" : "저장"}
          </button>
        </div>
      </form>
    </main>
  );
}

function safeParseArray(s: string): string[] {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
