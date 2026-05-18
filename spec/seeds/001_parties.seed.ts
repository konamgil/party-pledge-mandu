/**
 * 4개 정당 — declarative seed
 * key: "code" (unique) 로 idempotent upsert.
 *
 * 정당 uuid 는 다른 seed 파일에서도 동일 매핑으로 lookup하므로 고정값 사용.
 */

export const env = ["dev", "staging"] as const;

export default {
  resource: "party",
  key: "id",
  env: ["dev", "staging"] as const,
  data: [
    {
      id: "11111111-1111-4000-8000-000000000001",
      code: "democratic",
      name: "더불어민주당",
      shortName: "민주",
      initial: "민",
      color: "#004EA2",
      logoUrl: "",
    },
    {
      id: "11111111-1111-4000-8000-000000000002",
      code: "ppp",
      name: "국민의힘",
      shortName: "국힘",
      initial: "국",
      color: "#E61E2B",
      logoUrl: "",
    },
    {
      id: "11111111-1111-4000-8000-000000000003",
      code: "rebuilding",
      name: "조국혁신당",
      shortName: "조국",
      initial: "혁",
      color: "#1B3A6B",
      logoUrl: "",
    },
    {
      id: "11111111-1111-4000-8000-000000000004",
      code: "reform",
      name: "개혁신당",
      shortName: "개혁",
      initial: "개",
      color: "#FF6B00",
      logoUrl: "",
    },
  ],
};
