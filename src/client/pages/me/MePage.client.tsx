"use client";

import { useEffect, useMemo, useState } from "react";
import { LogOut, MessageCircle, ThumbsUp, FileText } from "lucide-react";
import type { Pledge } from "@/client/shared/lib/types";

interface Me {
  id: string;
  email: string;
  name: string;
}

interface CommentRow {
  id: string;
  pledgeId: string;
  body: string;
  createdAt: string;
}

interface VoteRow {
  pledgeId: string;
  direction: number;
}

type Tab = "pledges" | "comments" | "votes";

export function MePage() {
  const [user, setUser] = useState<Me | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [tab, setTab] = useState<Tab>("pledges");
  const [pledges, setPledges] = useState<Pledge[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [votes, setVotes] = useState<VoteRow[]>([]);
  const [allPledges, setAllPledges] = useState<Pledge[]>([]);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { user: Me | null }) => setUser(j.user))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      fetch(`/api/pledges?limit=200`).then((r) => r.json()),
      fetch(`/api/comments?limit=200`).then((r) => r.json()),
      fetch(`/api/votes?userId=${encodeURIComponent(user.id)}&limit=200`).then((r) => r.json()),
    ])
      .then(([p, c, v]) => {
        const all = Array.isArray(p?.data) ? (p.data as Pledge[]) : [];
        setAllPledges(all);
        setPledges(all.filter((pl) => pl.author === user.name));
        const allComments = Array.isArray(c?.data) ? (c.data as (CommentRow & { userId: string })[]) : [];
        setComments(allComments.filter((cm) => cm.userId === user.id));
        setVotes(Array.isArray(v?.data) ? (v.data as VoteRow[]) : []);
      })
      .catch(() => {});
  }, [user]);

  const pledgeByIdMap = useMemo(() => {
    const m: Record<string, Pledge> = {};
    for (const p of allPledges) m[p.id] = p;
    return m;
  }, [allPledges]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/";
  }

  if (!authChecked) {
    return <main className="min-h-screen flex items-center justify-center text-gray-400">로딩 중…</main>;
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4">
        <p className="text-gray-600 mb-4">로그인 후 이용 가능합니다.</p>
        <a
          href="/login?redirect=/me"
          className="bg-primary text-white font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90"
        >
          로그인하러 가기
        </a>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>

      <header className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 mb-6">
        <div className="flex items-center gap-4">
          <span className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white text-xl font-bold">
            {user.name.slice(0, 1)}
          </span>
          <div className="flex-grow">
            <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-500 flex items-center gap-1"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-5 text-center">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xl font-bold text-primary">{pledges.length}</div>
            <div className="text-xs text-gray-500">작성 공약</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xl font-bold text-primary">{comments.length}</div>
            <div className="text-xs text-gray-500">댓글</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xl font-bold text-primary">{votes.length}</div>
            <div className="text-xs text-gray-500">투표</div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {(
          [
            { key: "pledges" as const, label: "내 공약", count: pledges.length, Icon: FileText },
            { key: "comments" as const, label: "내 댓글", count: comments.length, Icon: MessageCircle },
            { key: "votes" as const, label: "내 투표", count: votes.length, Icon: ThumbsUp },
          ]
        ).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              tab === t.key
                ? "text-primary border-primary"
                : "text-gray-500 border-transparent hover:text-gray-700"
            }`}
          >
            <t.Icon className="w-4 h-4" />
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "pledges" && (
        <div className="flex flex-col gap-3">
          {pledges.length === 0 ? (
            <p className="text-center text-gray-400 py-12">작성한 공약이 없습니다.</p>
          ) : (
            pledges.map((p) => (
              <a
                key={p.id}
                href={`/pledges/${p.id}`}
                className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-gray-900">{p.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.summary}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span>{p.region} {p.subRegion}</span>
                  <span>·</span>
                  <span>👍 {p.upvotes}</span>
                  <span>💬 {p.commentCount}</span>
                </div>
              </a>
            ))
          )}
        </div>
      )}

      {tab === "comments" && (
        <div className="flex flex-col gap-3">
          {comments.length === 0 ? (
            <p className="text-center text-gray-400 py-12">작성한 댓글이 없습니다.</p>
          ) : (
            comments.map((c) => {
              const p = pledgeByIdMap[c.pledgeId];
              return (
                <a
                  key={c.id}
                  href={`/pledges/${c.pledgeId}`}
                  className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <p className="text-sm text-gray-700">{c.body}</p>
                  <div className="text-xs text-gray-400 mt-2">
                    {p ? `↳ ${p.title}` : `↳ 공약 ${c.pledgeId}`}
                    {" · "}
                    {c.createdAt.slice(0, 10)}
                  </div>
                </a>
              );
            })
          )}
        </div>
      )}

      {tab === "votes" && (
        <div className="flex flex-col gap-3">
          {votes.length === 0 ? (
            <p className="text-center text-gray-400 py-12">투표 기록이 없습니다.</p>
          ) : (
            votes.map((v) => {
              const p = pledgeByIdMap[v.pledgeId];
              return (
                <a
                  key={v.pledgeId}
                  href={`/pledges/${v.pledgeId}`}
                  className="flex items-center gap-3 bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <span
                    className={`text-2xl ${v.direction === 1 ? "text-primary" : "text-red-500"}`}
                  >
                    {v.direction === 1 ? "👍" : v.direction === -1 ? "👎" : "·"}
                  </span>
                  <div className="flex-grow">
                    <div className="font-medium text-sm text-gray-800">
                      {p ? p.title : `공약 ${v.pledgeId.slice(0, 8)}`}
                    </div>
                    {p && (
                      <div className="text-xs text-gray-400">
                        {p.candidateName} · {p.region}
                      </div>
                    )}
                  </div>
                </a>
              );
            })
          )}
        </div>
      )}
    </main>
  );
}
