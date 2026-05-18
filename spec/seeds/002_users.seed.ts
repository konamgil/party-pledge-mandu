/**
 * 테스트용 사용자 2명
 * 댓글/투표 시드 시 author 로 참조.
 */

export const env = ["dev", "staging"] as const;

export default {
  resource: "user",
  key: "id",
  env: ["dev", "staging"] as const,
  data: [
    {
      id: "44444444-4444-4000-8000-000000000001",
      email: "admin@lamysolution.com",
      name: "관리자",
    },
    {
      id: "44444444-4444-4000-8000-000000000002",
      email: "test@example.com",
      name: "테스트유저",
    },
  ],
};
