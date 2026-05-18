import { db } from "./db";
import type { Candidate, Party, Pledge } from "@/client/shared/lib/types";

function tryParseJsonArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v): v is string => typeof v === "string");
    } catch {
      // fall through
    }
  }
  return [];
}

const PARTY_COLS = `"id", "code", "name", "short_name" AS "shortName", "initial", "color", "logo_url" AS "logoUrl"`;
const CANDIDATE_COLS = `"id", "name", "party_id" AS "partyId", "position", "region", "sub_region" AS "subRegion", "pledge_count" AS "pledgeCount", "citizen_score" AS "citizenScore"`;
const PLEDGE_COLS = `"id", "party_id" AS "partyId", "candidate_id" AS "candidateId", "candidate_name" AS "candidateName", "candidate_position" AS "candidatePosition", "title", "summary", "category", "region", "sub_region" AS "subRegion", "position_tab" AS "positionTab", "upvotes", "downvotes", "comment_count" AS "commentCount", "author", "tags", "created_at" AS "createdAt"`;

function normalizePledge(row: Record<string, unknown>): Pledge {
  return { ...row, tags: tryParseJsonArray(row.tags) } as Pledge;
}

export async function listParties(limit = 100): Promise<Party[]> {
  return db<Party>`SELECT "id", "code", "name", "short_name" AS "shortName", "initial", "color", "logo_url" AS "logoUrl" FROM "parties" LIMIT ${limit}`;
}

export async function listCandidates(limit = 100): Promise<Candidate[]> {
  return db<Candidate>`SELECT "id", "name", "party_id" AS "partyId", "position", "region", "sub_region" AS "subRegion", "pledge_count" AS "pledgeCount", "citizen_score" AS "citizenScore" FROM "candidates" LIMIT ${limit}`;
}

export async function listPledges(limit = 100): Promise<Pledge[]> {
  const rows = await db<Record<string, unknown>>`SELECT "id", "party_id" AS "partyId", "candidate_id" AS "candidateId", "candidate_name" AS "candidateName", "candidate_position" AS "candidatePosition", "title", "summary", "category", "region", "sub_region" AS "subRegion", "position_tab" AS "positionTab", "upvotes", "downvotes", "comment_count" AS "commentCount", "author", "tags", "created_at" AS "createdAt" FROM "pledges" LIMIT ${limit}`;
  return rows.map(normalizePledge);
}

export async function getPledgeById(id: string): Promise<Pledge | null> {
  const row = await db.one<Record<string, unknown>>`SELECT "id", "party_id" AS "partyId", "candidate_id" AS "candidateId", "candidate_name" AS "candidateName", "candidate_position" AS "candidatePosition", "title", "summary", "category", "region", "sub_region" AS "subRegion", "position_tab" AS "positionTab", "upvotes", "downvotes", "comment_count" AS "commentCount", "author", "tags", "created_at" AS "createdAt" FROM "pledges" WHERE "id" = ${id}`;
  return row ? normalizePledge(row) : null;
}

export async function getCandidateById(id: string): Promise<Candidate | null> {
  return db.one<Candidate>`SELECT "id", "name", "party_id" AS "partyId", "position", "region", "sub_region" AS "subRegion", "pledge_count" AS "pledgeCount", "citizen_score" AS "citizenScore" FROM "candidates" WHERE "id" = ${id}`;
}

export async function getPartyByCode(code: string): Promise<Party | null> {
  return db.one<Party>`SELECT "id", "code", "name", "short_name" AS "shortName", "initial", "color", "logo_url" AS "logoUrl" FROM "parties" WHERE "code" = ${code}`;
}

export async function listPledgesByCandidate(candidateId: string): Promise<Pledge[]> {
  const rows = await db<Record<string, unknown>>`SELECT "id", "party_id" AS "partyId", "candidate_id" AS "candidateId", "candidate_name" AS "candidateName", "candidate_position" AS "candidatePosition", "title", "summary", "category", "region", "sub_region" AS "subRegion", "position_tab" AS "positionTab", "upvotes", "downvotes", "comment_count" AS "commentCount", "author", "tags", "created_at" AS "createdAt" FROM "pledges" WHERE "candidate_id" = ${candidateId} ORDER BY "upvotes" DESC`;
  return rows.map(normalizePledge);
}

export async function listCandidatesByParty(partyId: string): Promise<Candidate[]> {
  return db<Candidate>`SELECT "id", "name", "party_id" AS "partyId", "position", "region", "sub_region" AS "subRegion", "pledge_count" AS "pledgeCount", "citizen_score" AS "citizenScore" FROM "candidates" WHERE "party_id" = ${partyId} ORDER BY "citizen_score" DESC`;
}

export async function listPledgesByParty(partyId: string): Promise<Pledge[]> {
  const rows = await db<Record<string, unknown>>`SELECT "id", "party_id" AS "partyId", "candidate_id" AS "candidateId", "candidate_name" AS "candidateName", "candidate_position" AS "candidatePosition", "title", "summary", "category", "region", "sub_region" AS "subRegion", "position_tab" AS "positionTab", "upvotes", "downvotes", "comment_count" AS "commentCount", "author", "tags", "created_at" AS "createdAt" FROM "pledges" WHERE "party_id" = ${partyId} ORDER BY "upvotes" DESC`;
  return rows.map(normalizePledge);
}

export interface CommentWithUser {
  id: string;
  body: string;
  createdAt: string;
  userName: string;
}

export async function listCommentsByPledgeId(pledgeId: string): Promise<CommentWithUser[]> {
  return db<CommentWithUser>`SELECT c."id", c."body", c."created_at" AS "createdAt", COALESCE(u."name", '익명') AS "userName" FROM "comments" c LEFT JOIN "users" u ON u."id" = c."user_id" WHERE c."pledge_id" = ${pledgeId} ORDER BY c."created_at" DESC`;
}

export async function getUserById(id: string): Promise<{ id: string; email: string; name: string } | null> {
  return db.one<{ id: string; email: string; name: string }>`SELECT "id", "email", "name" FROM "users" WHERE "id" = ${id}`;
}

// 마커: queries.ts 의 SELECT 컬럼 매핑은 generated repo 와 동일 (단방향 sync. 필요 시 generated 파일 그대로 복사).
export const _COLUMN_DEFINITIONS = { PARTY_COLS, CANDIDATE_COLS, PLEDGE_COLS };
