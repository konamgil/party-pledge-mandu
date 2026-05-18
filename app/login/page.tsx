import { LoginForm } from "@/client/widgets/login-form/LoginForm";

export const metadata = {
  title: "로그인 | 공약포럼",
  description: "공약포럼에 로그인해서 공약에 댓글과 투표를 남기세요.",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#f0f2f5] px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-sm">
        <header className="text-center mb-6">
          <a href="/" className="inline-flex items-center gap-1.5 font-display font-bold text-primary text-xl">
            <span className="bg-primary text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold">
              공
            </span>
            공약포럼
          </a>
          <h1 className="text-lg font-bold text-gray-800 mt-3">로그인 또는 가입</h1>
          <p className="text-xs text-gray-500 mt-1">이메일 하나로 시작하세요</p>
        </header>
        <LoginForm />
        <p className="text-center text-xs text-gray-400 mt-4">
          <a href="/" className="hover:text-primary">← 홈으로</a>
        </p>
      </div>
    </main>
  );
}
