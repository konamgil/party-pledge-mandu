import { getCandidateBundle } from "@/shared/contracts/api";
import type { Candidate, Pledge } from "@/client/shared/lib/types";

export const metadata = {
  title: "후보자 비교 | 공약포럼",
  description: "2026 지방선거 후보자를 나란히 비교. 공약·시민 점수·소속 정당.",
};

interface CandidateBundle {
  candidate: Candidate;
  pledges: Pledge[];
}

export default async function ComparePage({
  searchParams,
}: {
  searchParams?: { candidates?: string };
}) {
  const ids = (searchParams?.candidates ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);

  const bundles = (
    await Promise.all(ids.map((id) => getCandidateBundle(id)))
  ).filter((b): b is CandidateBundle => b !== null);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>

      <header className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">후보자 비교</h1>
        <p className="text-sm text-gray-500 mt-1">
          최대 4명의 후보자를 나란히 비교 ({bundles.length}/{ids.length || 0})
        </p>
      </header>

      {bundles.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500 mb-2">비교할 후보자를 선택해주세요.</p>
          <p className="text-xs text-gray-400">
            URL 예시: <code>/compare?candidates=ID1,ID2,ID3</code>
          </p>
          <p className="text-xs text-gray-400 mt-4">
            후보 ID는 <a href="/" className="underline">후보자 랭킹</a> 또는{" "}
            <a href="/search" className="underline">검색</a> 에서 클릭해 확인.
          </p>
        </div>
      ) : (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${bundles.length}, minmax(0, 1fr))` }}
        >
          {bundles.map(({ candidate, pledges }) => (
            <div
              key={candidate.id}
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="px-4 py-4 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">{candidate.name}</h2>
                <p className="text-xs text-gray-500 mt-1">{candidate.position}</p>
                <p className="text-xs text-gray-400">
                  {candidate.region} {candidate.subRegion}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-base font-bold text-green-600">
                      {candidate.citizenScore}
                    </div>
                    <div className="text-[10px] text-gray-500">시민 점수</div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-base font-bold text-gray-800">
                      {candidate.pledgeCount}
                    </div>
                    <div className="text-[10px] text-gray-500">공약</div>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xs font-bold text-gray-500 uppercase mb-2">대표 공약</p>
                <div className="flex flex-col gap-2">
                  {pledges.slice(0, 5).map((p) => (
                    <a
                      key={p.id}
                      href={`/pledges/${p.id}`}
                      className="block text-sm hover:text-primary"
                    >
                      <div className="font-medium text-gray-800 line-clamp-1">{p.title}</div>
                      <div className="text-xs text-gray-400">👍 {p.upvotes}</div>
                    </a>
                  ))}
                  {pledges.length === 0 && (
                    <p className="text-xs text-gray-400">공약 없음</p>
                  )}
                </div>
              </div>
              <a
                href={`/candidates/${candidate.id}`}
                className="block text-center text-xs text-primary hover:underline py-2 border-t border-gray-100"
              >
                상세 보기 →
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
