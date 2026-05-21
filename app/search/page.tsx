import { listCandidates, listParties, listPledges } from "@/shared/contracts/api";
import { SearchInput } from "@/client/widgets/search-input/SearchInput.client";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = searchParams?.q?.trim() ?? "";
  if (!q) return { title: "검색 | 공약포럼" };
  return {
    title: `"${q}" 검색 결과 | 공약포럼`,
    description: `"${q}" 키워드로 공약·후보·정당을 검색합니다.`,
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams?: { q?: string };
}) {
  const q = (searchParams?.q ?? "").trim();
  const qLower = q.toLowerCase();

  const [allPledges, allCandidates, allParties] = q
    ? await Promise.all([listPledges(200), listCandidates(200), listParties()])
    : [[], [], []];

  const pledgeHits = q
    ? allPledges.filter(
        (p) =>
          p.title.toLowerCase().includes(qLower) ||
          p.summary.toLowerCase().includes(qLower) ||
          p.tags.some((t) => t.toLowerCase().includes(qLower)),
      )
    : [];

  const candidateHits = q
    ? allCandidates.filter(
        (c) =>
          c.name.toLowerCase().includes(qLower) ||
          c.position.toLowerCase().includes(qLower) ||
          c.region.toLowerCase().includes(qLower) ||
          (c.subRegion ?? "").toLowerCase().includes(qLower),
      )
    : [];

  const partyHits = q
    ? allParties.filter(
        (p) =>
          p.name.toLowerCase().includes(qLower) ||
          p.shortName.toLowerCase().includes(qLower) ||
          p.code.toLowerCase().includes(qLower),
      )
    : [];

  const totalHits = pledgeHits.length + candidateHits.length + partyHits.length;

  return (
    <main className="min-h-screen bg-[#f0f2f5] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>
        <header className="mt-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">검색</h1>
          {q && (
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-semibold">{q}</span> 검색 결과 {totalHits}건
            </p>
          )}
        </header>

        <div className="mb-6">
          <SearchInput defaultValue={q} />
        </div>

        {!q && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">검색어를 입력해주세요.</p>
            <p className="text-xs text-gray-400 mt-2">
              공약 제목·요약·태그, 후보 이름·직위·지역, 정당 이름·약어 검색
            </p>
          </div>
        )}

        {q && totalHits === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">검색 결과가 없습니다.</p>
            <p className="text-xs text-gray-400 mt-2">다른 키워드로 시도해보세요.</p>
          </div>
        )}

        {pledgeHits.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">
              공약 {pledgeHits.length}건
            </h2>
            <div className="flex flex-col gap-3">
              {pledgeHits.map((p) => (
                <a
                  key={p.id}
                  href={`/pledges/${p.id}`}
                  className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-gray-900 leading-snug">{p.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{p.summary}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span>{p.candidateName}</span>
                    <span>·</span>
                    <span>{p.region} {p.subRegion}</span>
                    <span>·</span>
                    <span>👍 {p.upvotes}</span>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {candidateHits.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">
              후보 {candidateHits.length}명
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {candidateHits.map((c) => (
                <a
                  key={c.id}
                  href={`/candidates/${c.id}`}
                  className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{c.position} · {c.region}</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {partyHits.length > 0 && (
          <section className="mb-8">
            <h2 className="text-sm font-bold text-gray-500 uppercase mb-3">
              정당 {partyHits.length}개
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {partyHits.map((p) => (
                <a
                  key={p.id}
                  href={`/parties/${p.code}`}
                  className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full text-white text-xs font-bold flex items-center justify-center"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.initial}
                    </span>
                    <div>
                      <h3 className="font-bold text-gray-900">{p.name}</h3>
                      <p className="text-xs text-gray-500">{p.shortName}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
