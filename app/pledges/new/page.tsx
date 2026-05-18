import { listCandidates, listParties } from "@/server/infra/queries";
import { PledgeForm } from "@/client/widgets/pledge-form/PledgeForm";

export const metadata = {
  title: "공약 제안하기 | 공약포럼",
  description: "후보자에게 시민의 목소리를 직접 전달하는 공약을 제안하세요.",
};

export default async function NewPledgePage() {
  const [parties, candidates] = await Promise.all([listParties(), listCandidates()]);

  return (
    <main className="min-h-screen bg-[#f0f2f5] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>
        <header className="mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">공약 제안하기</h1>
          <p className="text-sm text-gray-500 mt-1">
            시민이 후보자에게 제안하는 정책을 공유합니다.
          </p>
        </header>
        <PledgeForm parties={parties} candidates={candidates} />
      </div>
    </main>
  );
}
