import LoginPage from "@/client/pages/login/LoginPage.client";

export const metadata = {
  title: "로그인 | 공약포럼",
  description: "공약포럼에 로그인해서 공약에 댓글과 투표를 남기세요.",
};

export default function Page() {
  return <LoginPage />;
}
