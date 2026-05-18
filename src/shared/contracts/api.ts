/**
 * Page-level server data fetchers.
 *
 * - 위치: `src/shared/contracts/` — Mandu Guard 가 page.tsx 에서 import 허용한 layer.
 * - server-only db import 는 금지 (F1 / F17). 대신 internal HTTP fetch.
 * - production 에서는 `MANDU_INTERNAL_URL` 환경 변수로 self-origin 지정.
 */
import type { Candidate, Party, Pledge } from "@/client/shared/lib/types";

// inline env: shared/contracts 내 cross-slice import 차단 회피 (FSD 룰).
const INTERNAL_BASE =
  typeof process !== "undefined" && process.env && process.env.MANDU_INTERNAL_URL
    ? process.env.MANDU_INTERNAL_URL
    : "http://localhost:3333";

async function apiGet<T>(path: string): Promise<T | null> {
  try {
    const r = await fetch(`${INTERNAL_BASE}${path}`, { cache: "no-store" });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

async function apiList<T>(path: string): Promise<T[]> {
  const body = await apiGet<{ data?: unknown }>(path);
  return Array.isArray(body?.data) ? (body.data as T[]) : [];
}

// ─── List ────────────────────────────────────────────────────────────────────

export async function listParties(limit = 100): Promise<Party[]> {
  return apiList<Party>(`/api/parties?limit=${limit}`);
}

export async function listCandidates(limit = 100): Promise<Candidate[]> {
  return apiList<Candidate>(`/api/candidates?limit=${limit}`);
}

export async function listPledges(limit = 100): Promise<Pledge[]> {
  return apiList<Pledge>(`/api/pledges?limit=${limit}`);
}

// ─── Detail ──────────────────────────────────────────────────────────────────

export async function getPledgeById(id: string): Promise<Pledge | null> {
  const body = await apiGet<{ data: Pledge }>(`/api/pledges/${id}`);
  return body?.data ?? null;
}

export async function getCandidateBundle(
  id: string,
): Promise<{ candidate: Candidate; pledges: Pledge[] } | null> {
  const body = await apiGet<{ data: { candidate: Candidate; pledges: Pledge[] } }>(
    `/api/candidates/${id}`,
  );
  return body?.data ?? null;
}

export async function getPartyBundle(
  code: string,
): Promise<{ party: Party; candidates: Candidate[]; pledges: Pledge[] } | null> {
  const body = await apiGet<{
    data: { party: Party; candidates: Candidate[]; pledges: Pledge[] };
  }>(`/api/parties/${code}`);
  return body?.data ?? null;
}

// ─── Comments (pledge 상세 페이지용) ─────────────────────────────────────────

export interface CommentWithUser {
  id: string;
  body: string;
  createdAt: string;
  userName: string;
}

export async function listCommentsByPledgeId(pledgeId: string): Promise<CommentWithUser[]> {
  return apiList<CommentWithUser>(
    `/api/comments?pledgeId=${encodeURIComponent(pledgeId)}&limit=200`,
  );
}
