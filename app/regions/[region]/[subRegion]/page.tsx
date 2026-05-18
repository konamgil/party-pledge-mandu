import { getRegionFullName } from "@/client/shared/lib/data";
import { listCandidates, listPledges } from "@/server/infra/queries";

export async function generateMetadata({
  params,
}: {
  params: { region: string; subRegion: string };
}) {
  const region = decodeURIComponent(params.region);
  const subRegion = decodeURIComponent(params.subRegion);
  return {
    title: `${getRegionFullName(region)} ${subRegion} 후보·공약 | 공약포럼`,
    description: `${getRegionFullName(region)} ${subRegion} 지역 후보의 공약 모음.`,
  };
}

export default async function SubRegionPage({
  params,
}: {
  params: { region: string; subRegion: string };
}) {
  const region = decodeURIComponent(params.region);
  const subRegion = decodeURIComponent(params.subRegion);

  const [allCandidates, allPledges] = await Promise.all([listCandidates(), listPledges()]);

  const candidates = allCandidates.filter(
    (c) => c.region === region && (!c.subRegion || c.subRegion === subRegion),
  );
  const pledges = allPledges
    .filter((p) => p.region === region && p.subRegion === subRegion)
    .sort((a, b) => b.upvotes - a.upvotes);

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${subRegion} 후보·공약`} />
      <meta
        property="og:description"
        content={`${getRegionFullName(region)} ${subRegion} 지역 ${candidates.length}명 후보의 공약 ${pledges.length}건.`}
      />
      <a
        href={`/regions/${encodeURIComponent(region)}`}
        className="text-sm text-gray-500 hover:text-primary"
      >
        ← {getRegionFullName(region)}
      </a>
      <header className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {getRegionFullName(region)} {subRegion}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {candidates.length}명 후보 · {pledges.length}개 공약
        </p>
      </header>

      {candidates.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3">후보자 ({candidates.length})</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {candidates.map((c) => (
              <a
                key={c.id}
                href={`/candidates/${c.id}`}
                className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-gray-900">{c.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{c.position}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                  <span className="text-green-600 font-bold">{c.citizenScore}</span>
                  <span>{c.pledgeCount}개 공약</span>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">{subRegion} 인기 공약 ({pledges.length})</h2>
        <div className="flex flex-col gap-3">
          {pledges.map((p) => (
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
