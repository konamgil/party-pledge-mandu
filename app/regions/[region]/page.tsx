import { getRegionFullName, subRegions } from "@/client/shared/lib/data";
import { listCandidates, listPledges } from "@/shared/contracts/api";

export async function generateMetadata({ params }: { params: { region: string } }) {
  const region = decodeURIComponent(params.region);
  return {
    title: `${getRegionFullName(region)} 2026 지방선거 공약 | 공약포럼`,
    description: `${getRegionFullName(region)} 지역 후보자와 공약을 정당·직위별로 비교.`,
  };
}

export default async function RegionPage({ params }: { params: { region: string } }) {
  const region = decodeURIComponent(params.region);
  const [allCandidates, allPledges] = await Promise.all([listCandidates(), listPledges()]);

  const candidates = allCandidates.filter((c) => c.region === region);
  const pledges = allPledges
    .filter((p) => p.region === region)
    .sort((a, b) => b.upvotes - a.upvotes);

  if (candidates.length === 0 && pledges.length === 0) {
    return (
      <main className="max-w-4xl mx-auto p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800">{region} 지역 정보가 없습니다</h1>
        <a href="/" className="inline-block mt-6 text-primary underline">홈으로 돌아가기</a>
      </main>
    );
  }

  const subs = subRegions[region] || [];

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${getRegionFullName(region)} 공약 모음`} />
      <meta
        property="og:description"
        content={`${getRegionFullName(region)} 지역 ${candidates.length}명 후보의 공약 ${pledges.length}건.`}
      />
      <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>
      <header className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{getRegionFullName(region)}</h1>
        <p className="text-sm text-gray-500 mt-1">{candidates.length}명 후보 · {pledges.length}개 공약</p>
      </header>

      {subs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-bold text-gray-400 uppercase mb-2">기초자치단체</h2>
          <div className="flex flex-wrap gap-2">
            {subs.map((s) => (
              <a
                key={s}
                href={`/regions/${encodeURIComponent(region)}/${encodeURIComponent(s)}`}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm hover:border-primary hover:text-primary transition-colors"
              >
                {s}
              </a>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">{region} 인기 공약</h2>
        <div className="flex flex-col gap-3">
          {pledges.slice(0, 20).map((p) => (
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
                <span>{p.candidatePosition}</span>
                <span>·</span>
                <span>👍 {p.upvotes}</span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
