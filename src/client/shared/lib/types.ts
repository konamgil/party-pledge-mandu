export type PartyId = "democratic" | "ppp" | "rebuilding" | "reform";

export interface Party {
  id: string;
  code: string;
  name: string;
  shortName: string;
  initial: string;
  color: string;
  logoUrl: string;
}

export interface Candidate {
  id: string;
  name: string;
  partyId: string;
  position: string;
  region: string;
  subRegion: string;
  pledgeCount: number;
  citizenScore: number;
}

export interface Pledge {
  id: string;
  partyId: string;
  candidateId: string;
  candidateName: string;
  candidatePosition: string;
  title: string;
  summary: string;
  category: string;
  region: string;
  subRegion: string;
  positionTab: string;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  author: string;
  tags: string[];
  createdAt: string;
}

export type SortType = "hot" | "new" | "top";

export interface PositionTab {
  key: string;
  label: string;
  level: "metro_head" | "local_head" | "metro_council" | "local_council";
}
