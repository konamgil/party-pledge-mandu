import type { Candidate, Pledge, PartyId, SortType } from "./types";

export interface PledgeFilters {
  party: string | "all";
  region: string;
  category: string;
  sortBy: SortType;
  positionTab?: string;
  search?: string;
}

export function filterPledges(rows: Pledge[], f: PledgeFilters): Pledge[] {
  let result = rows.slice();

  if (f.party !== "all") result = result.filter((p) => p.partyId === f.party);
  if (f.region !== "전체") result = result.filter((p) => p.region === f.region);
  if (f.category !== "전체") result = result.filter((p) => p.category === f.category);
  if (f.positionTab) result = result.filter((p) => p.positionTab === f.positionTab);

  if (f.search && f.search.trim()) {
    const q = f.search.toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  switch (f.sortBy) {
    case "hot":
      result.sort((a, b) => b.upvotes + b.commentCount - (a.upvotes + a.commentCount));
      break;
    case "new":
      result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;
    case "top":
      result.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
      break;
  }

  return result;
}

export function filterCandidates(
  rows: Candidate[],
  region: string,
  subRegion?: string,
): Candidate[] {
  let result = rows.filter((c) => c.region === region);
  if (subRegion) {
    result = result.filter((c) => !c.subRegion || c.subRegion === subRegion);
  }
  return result;
}

export function rankCandidates(rows: Candidate[]): Candidate[] {
  return rows.slice().sort((a, b) => b.citizenScore - a.citizenScore);
}

export function trendingPledges(rows: Pledge[], region: string, limit = 4): Pledge[] {
  return rows
    .filter((p) => p.region === region)
    .sort((a, b) => b.upvotes - a.upvotes)
    .slice(0, limit);
}

const PARTY_CODE_TO_ID_LOCAL: Record<string, PartyId> = {
  democratic: "democratic",
  ppp: "ppp",
  rebuilding: "rebuilding",
  reform: "reform",
};

export function resolvePartyId(
  parties: { id: string; code: string }[],
  partyDbId: string,
): PartyId | null {
  const party = parties.find((p) => p.id === partyDbId);
  if (!party) return null;
  return PARTY_CODE_TO_ID_LOCAL[party.code] ?? null;
}
