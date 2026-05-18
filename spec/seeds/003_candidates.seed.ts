/**
 * 22명 후보자 — declarative seed
 * key: "id" 로 idempotent upsert. partyId 는 001_parties.seed.ts의 고정 uuid 참조.
 */

const PARTY = {
  democratic: "11111111-1111-4000-8000-000000000001",
  ppp:        "11111111-1111-4000-8000-000000000002",
  rebuilding: "11111111-1111-4000-8000-000000000003",
  reform:     "11111111-1111-4000-8000-000000000004",
} as const;

const cid = (n: number) => `22222222-2222-4000-8000-${String(n).padStart(12, "0")}`;

export const env = ["dev", "staging"] as const;

export default {
  resource: "candidate",
  key: "id",
  env: ["dev", "staging"] as const,
  data: [
    // 서울
    { id: cid(1),  name: "홍길동",   partyId: PARTY.democratic, position: "서울시장",                region: "서울", subRegion: "",       pledgeCount: 12, citizenScore: 4.8 },
    { id: cid(2),  name: "김철수",   partyId: PARTY.ppp,        position: "서울시장",                region: "서울", subRegion: "",       pledgeCount: 15, citizenScore: 4.5 },
    { id: cid(3),  name: "이영희",   partyId: PARTY.rebuilding, position: "서울시장",                region: "서울", subRegion: "",       pledgeCount: 8,  citizenScore: 4.2 },
    { id: cid(4),  name: "박지민",   partyId: PARTY.reform,     position: "서울시장",                region: "서울", subRegion: "",       pledgeCount: 10, citizenScore: 3.9 },
    { id: cid(5),  name: "최민수",   partyId: PARTY.democratic, position: "강남구청장",              region: "서울", subRegion: "강남구", pledgeCount: 9,  citizenScore: 4.1 },
    { id: cid(6),  name: "정수진",   partyId: PARTY.ppp,        position: "강남구청장",              region: "서울", subRegion: "강남구", pledgeCount: 11, citizenScore: 4.3 },
    { id: cid(7),  name: "한미영",   partyId: PARTY.rebuilding, position: "강남구청장",              region: "서울", subRegion: "강남구", pledgeCount: 7,  citizenScore: 3.8 },
    { id: cid(8),  name: "오세훈",   partyId: PARTY.democratic, position: "서울특별시의원(강남구)",  region: "서울", subRegion: "강남구", pledgeCount: 5,  citizenScore: 3.7 },
    { id: cid(9),  name: "김민정",   partyId: PARTY.ppp,        position: "강남구의원",              region: "서울", subRegion: "강남구", pledgeCount: 6,  citizenScore: 4.0 },
    // 경기
    { id: cid(10), name: "이재명",   partyId: PARTY.democratic, position: "경기도지사",              region: "경기", subRegion: "",       pledgeCount: 18, citizenScore: 4.6 },
    { id: cid(11), name: "김동연",   partyId: PARTY.ppp,        position: "경기도지사",              region: "경기", subRegion: "",       pledgeCount: 14, citizenScore: 4.3 },
    { id: cid(12), name: "조은희",   partyId: PARTY.reform,     position: "경기도지사",              region: "경기", subRegion: "",       pledgeCount: 9,  citizenScore: 3.8 },
    { id: cid(13), name: "박상혁",   partyId: PARTY.democratic, position: "수원시장",                region: "경기", subRegion: "수원시", pledgeCount: 11, citizenScore: 4.2 },
    { id: cid(14), name: "이준석",   partyId: PARTY.ppp,        position: "수원시장",                region: "경기", subRegion: "수원시", pledgeCount: 13, citizenScore: 4.0 },
    // 충남
    { id: cid(15), name: "양승조",   partyId: PARTY.democratic, position: "충남도지사",              region: "충남", subRegion: "",       pledgeCount: 14, citizenScore: 4.4 },
    { id: cid(16), name: "김태흠",   partyId: PARTY.ppp,        position: "충남도지사",              region: "충남", subRegion: "",       pledgeCount: 12, citizenScore: 4.1 },
    { id: cid(17), name: "박완주",   partyId: PARTY.democratic, position: "천안시장",                region: "충남", subRegion: "천안시", pledgeCount: 10, citizenScore: 4.0 },
    { id: cid(18), name: "이상천",   partyId: PARTY.ppp,        position: "천안시장",                region: "충남", subRegion: "천안시", pledgeCount: 8,  citizenScore: 3.9 },
    // 부산
    { id: cid(19), name: "김영춘",   partyId: PARTY.democratic, position: "부산시장",                region: "부산", subRegion: "",       pledgeCount: 13, citizenScore: 4.3 },
    { id: cid(20), name: "박형준",   partyId: PARTY.ppp,        position: "부산시장",                region: "부산", subRegion: "",       pledgeCount: 16, citizenScore: 4.5 },
    { id: cid(21), name: "이정헌",   partyId: PARTY.rebuilding, position: "부산시장",                region: "부산", subRegion: "",       pledgeCount: 7,  citizenScore: 3.7 },
    { id: cid(22), name: "강민구",   partyId: PARTY.democratic, position: "해운대구청장",            region: "부산", subRegion: "해운대구", pledgeCount: 8,  citizenScore: 4.0 },
  ],
};
