import { MePage } from "@/client/pages/me/MePage.client";

export const metadata = {
  title: "마이페이지 | 공약포럼",
  description: "내가 작성한 공약과 댓글, 투표 기록을 한 곳에서 관리.",
};

export default function Page() {
  return <MePage />;
}
