import { getCandidateById, listPledgesByCandidate } from "@/server/infra/queries";

const SITE_URL = process.env.MANDU_SITE_URL ?? "https://party-pledge.example.com";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const candidate = await getCandidateById(params.id);
  if (!candidate) return { title: "후보자를 찾을 수 없습니다 | 공약포럼" };
  const pledges = await listPledgesByCandidate(params.id);
  return {
    title: `${candidate.name} ${candidate.position} 후보 공약 ${pledges.length}건 | 공약포럼`,
    description: `${candidate.region} ${candidate.subRegion} ${candidate.position} ${candidate.name} 후보의 공약 ${pledges.length}건과 시민 점수 ${candidate.citizenScore}.`,
  };
}

export default async function CandidatePage({ params }: { params: { id: string } }) {
  const candidate = await getCandidateById(params.id);
  if (!candidate) {
    return (
      <main className="max-w-3xl mx-auto p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800">후보자를 찾을 수 없습니다</h1>
        <a href="/" className="inline-block mt-6 text-primary underline">홈으로 돌아가기</a>
      </main>
    );
  }
  const pledges = await listPledgesByCandidate(params.id);

  const description = `${candidate.region} ${candidate.subRegion} ${candidate.position} ${candidate.name} 후보의 공약 ${pledges.length}건과 시민 점수 ${candidate.citizenScore}.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: candidate.name,
    jobTitle: candidate.position,
    address: {
      "@type": "PostalAddress",
      addressRegion: candidate.region,
      addressLocality: candidate.subRegion,
    },
    knowsAbout: pledges.map((p) => p.title),
    mainEntityOfPage: `${SITE_URL}/candidates/${candidate.id}`,
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <meta property="og:type" content="profile" />
      <meta property="og:title" content={`${candidate.name} ${candidate.position} 후보`} />
      <meta property="og:description" content={description} />
      <link rel="canonical" href={`${SITE_URL}/candidates/${candidate.id}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>
      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {candidate.position} · {candidate.region} {candidate.subRegion}
        </p>
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <div className="text-xs text-gray-400">시민 점수</div>
            <div className="font-bold text-green-600">{candidate.citizenScore}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">등록 공약</div>
            <div className="font-bold">{candidate.pledgeCount}개</div>
          </div>
        </div>
      </section>
      <h2 className="text-lg font-bold text-gray-800 mb-3">{candidate.name} 후보 공약 ({pledges.length})</h2>
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
              <span>{p.category}</span>
              <span>👍 {p.upvotes}</span>
              <span>💬 {p.commentCount}</span>
            </div>
          </a>
        ))}
      </div>
    </main>
  );
}
