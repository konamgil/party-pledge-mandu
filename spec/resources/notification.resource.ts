import { defineResource } from "@mandujs/core";

/**
 * Notification Resource
 *
 * 사용자별 알림 (댓글, 대댓글, 투표 등). type / pledgeId / commentId / fromUserId
 * 조합으로 다양한 알림 종류 표현.
 */
export default defineResource({
  name: "notification",
  fields: {
    id: { type: "uuid", required: true },
    userId: { type: "uuid", required: true },
    type: { type: "string", required: true },
    title: { type: "string", required: true },
    body: { type: "string", required: true },
    pledgeId: { type: "uuid", required: false },
    commentId: { type: "uuid", required: false },
    fromUserId: { type: "uuid", required: false },
    isRead: { type: "boolean", required: false },
    createdAt: { type: "date", required: false },
  },
  options: {
    description: "Notification management API",
    tags: ["notification"],
    endpoints: {
      list: true,
      get: true,
      create: true,
      update: true,
      delete: true,
    },
    persistence: {
      provider: "sqlite",
      primaryKey: "id",
    },
  },
});
