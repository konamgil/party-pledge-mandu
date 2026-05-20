import { NotificationsPage } from "@/client/pages/notifications/NotificationsPage.client";

export const metadata = {
  title: "알림 | 공약포럼",
  description: "내 공약·댓글에 달린 새 활동을 한 곳에서 확인.",
};

export default function Page() {
  return <NotificationsPage />;
}
