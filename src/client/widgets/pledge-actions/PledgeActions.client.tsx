"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface Me {
  id: string;
  email: string;
  name: string;
}

interface Props {
  pledgeId: string;
  authorName: string;
}

export function PledgeActions({ pledgeId, authorName }: Props) {
  const [user, setUser] = useState<Me | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { user: Me | null }) => setUser(j.user))
      .catch(() => setUser(null));
  }, []);

  if (!user || user.name !== authorName) return null;

  async function handleDelete() {
    if (!confirm("정말 이 공약을 삭제하시겠습니까? 댓글·투표도 함께 삭제됩니다.")) return;
    setBusy(true);
    const res = await fetch(`/api/pledges/${pledgeId}`, {
      method: "DELETE",
      credentials: "include",
    });
    setBusy(false);
    if (res.ok) {
      alert("삭제되었습니다.");
      window.location.href = "/";
    } else {
      const j = await res.json().catch(() => ({}));
      alert(`삭제 실패: ${(j as { error?: string }).error ?? res.status}`);
    }
  }

  return (
    <div className="flex gap-2 mt-4">
      <a
        href={`/pledges/${pledgeId}/edit`}
        className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-primary hover:text-primary"
      >
        <Pencil className="w-3 h-3" />
        수정
      </a>
      <button
        onClick={handleDelete}
        disabled={busy}
        className="text-xs flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-red-400 hover:text-red-500 disabled:opacity-50"
      >
        <Trash2 className="w-3 h-3" />
        {busy ? "삭제 중…" : "삭제"}
      </button>
    </div>
  );
}
