"use client";

import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Pencil, Reply, Trash2, X } from "lucide-react";

export interface CommentItem {
  id: string;
  pledgeId: string;
  userId: string;
  parentId: string | null;
  body: string;
  createdAt: string;
  userName: string;
}

interface Me {
  id: string;
  email: string;
  name: string;
}

interface Props {
  pledgeId: string;
  initialComments: CommentItem[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

export function CommentsSection({ pledgeId, initialComments }: Props) {
  const [user, setUser] = useState<Me | null>(null);
  const [comments, setComments] = useState<CommentItem[]>(initialComments);
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { user: Me | null }) => setUser(j.user))
      .catch(() => setUser(null));
  }, []);

  const tree = useMemo(() => {
    const parents = comments.filter((c) => !c.parentId);
    const byParent = new Map<string, CommentItem[]>();
    for (const c of comments) {
      if (c.parentId) {
        const arr = byParent.get(c.parentId) ?? [];
        arr.push(c);
        byParent.set(c.parentId, arr);
      }
    }
    for (const [, arr] of byParent) {
      arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }
    return { parents, replies: byParent };
  }, [comments]);

  async function refreshComments() {
    const res = await fetch(
      `/api/comments?pledgeId=${encodeURIComponent(pledgeId)}&limit=200`,
      { credentials: "include" },
    );
    if (!res.ok) return;
    const j = (await res.json()) as { data: CommentItem[] };
    setComments(Array.isArray(j.data) ? j.data : []);
  }

  async function ensureLogin(): Promise<Me | null> {
    if (user) return user;
    if (!email.trim()) {
      setError("이메일을 입력해주세요.");
      return null;
    }
    const login = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email: email.trim() }),
    });
    if (!login.ok) {
      const errBody = (await login.json().catch(() => ({}))) as { error?: string };
      setError(errBody.error ?? `로그인 실패 (${login.status})`);
      return null;
    }
    const j = (await login.json()) as { user: Me };
    setUser(j.user);
    return j.user;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const u = await ensureLogin();
      if (!u) return;
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ pledgeId, userId: u.id, body: body.trim() }),
      });
      if (!res.ok) throw new Error(`댓글 등록 실패 (${res.status})`);
      setBody("");
      await refreshComments();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(parentId: string) {
    if (!user) return;
    const text = replyBody.trim();
    if (!text) return;
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ pledgeId, userId: user.id, parentId, body: text }),
    });
    if (res.ok) {
      setReplyBody("");
      setReplyTo(null);
      await refreshComments();
    }
  }

  async function handleEditSave(id: string) {
    const text = editBody.trim();
    if (!text) return;
    const res = await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ body: text }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditBody("");
      await refreshComments();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("정말 삭제하시겠습니까? 답글도 함께 삭제됩니다.")) return;
    const res = await fetch(`/api/comments/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) await refreshComments();
  }

  function renderCommentItem(c: CommentItem, isReply = false) {
    const mine = user && user.id === c.userId;
    const isEditing = editingId === c.id;
    return (
      <article
        key={c.id}
        className={`bg-white rounded-xl border border-gray-200 shadow-sm p-4 ${
          isReply ? "ml-6 border-l-4 border-l-primary/30" : ""
        }`}
      >
        <header className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">{c.userName}</span>
          <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
        </header>
        {isEditing ? (
          <div className="flex flex-col gap-2">
            <textarea
              value={editBody}
              onChange={(e) => setEditBody(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditBody("");
                }}
                className="text-xs text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-100"
              >
                취소
              </button>
              <button
                onClick={() => handleEditSave(c.id)}
                className="text-xs bg-primary text-white font-semibold px-3 py-1.5 rounded-full hover:bg-primary/90"
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-700 whitespace-pre-line">{c.body}</p>
        )}
        {!isEditing && (
          <footer className="flex gap-3 mt-2 text-xs text-gray-400">
            {!isReply && user && (
              <button
                onClick={() => {
                  setReplyTo(replyTo === c.id ? null : c.id);
                  setReplyBody("");
                }}
                className="flex items-center gap-1 hover:text-primary"
              >
                <Reply className="w-3 h-3" />
                답글
              </button>
            )}
            {mine && (
              <>
                <button
                  onClick={() => {
                    setEditingId(c.id);
                    setEditBody(c.body);
                  }}
                  className="flex items-center gap-1 hover:text-primary"
                >
                  <Pencil className="w-3 h-3" />
                  수정
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="flex items-center gap-1 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                  삭제
                </button>
              </>
            )}
          </footer>
        )}
        {replyTo === c.id && !isReply && (
          <div className="mt-3 ml-6 flex flex-col gap-2">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="답글을 입력하세요"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setReplyTo(null);
                  setReplyBody("");
                }}
                className="text-xs text-gray-500 px-3 py-1.5 rounded-full hover:bg-gray-100"
              >
                <X className="w-3 h-3 inline" /> 취소
              </button>
              <button
                onClick={() => handleReply(c.id)}
                disabled={!replyBody.trim()}
                className="text-xs bg-primary text-white font-semibold px-3 py-1.5 rounded-full hover:bg-primary/90 disabled:opacity-50"
              >
                답글 등록
              </button>
            </div>
          </div>
        )}
      </article>
    );
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        댓글 {comments.length}
      </h2>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3"
      >
        {user ? (
          <div className="text-xs text-gray-500">
            <span className="font-semibold text-gray-700">{user.name}</span> ({user.email}) 으로 댓글
            작성
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
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        )}
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="공약에 대한 의견을 남겨주세요"
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
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
            className="bg-primary text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? "등록 중…" : "댓글 등록"}
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-3 mt-4">
        {tree.parents.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">
            아직 댓글이 없습니다. 첫 댓글을 남겨주세요.
          </p>
        ) : (
          tree.parents.map((p) => (
            <div key={p.id} className="flex flex-col gap-2">
              {renderCommentItem(p)}
              {(tree.replies.get(p.id) ?? []).map((r) => renderCommentItem(r, true))}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
