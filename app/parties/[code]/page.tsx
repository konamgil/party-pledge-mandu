import { getPartyBundle } from "@/shared/contracts/api";

import { env } from "@/shared/contracts/env";
const SITE_URL = env("MANDU_SITE_URL", "https://party-pledge.example.com");

export async function generateMetadata({ params }: { params: { code: string } }) {
  const bundle = await getPartyBundle(params.code);
  if (!bundle) return { title: "정당을 찾을 수 없습니다 | 공약포럼" };
  const { party, candidates, pledges } = bundle;
  return {
    title: `${party.name} 2026 지방선거 공약 ${pledges.length}건 | 공약포럼`,
    description: `${party.name}(${party.shortName}) 소속 ${candidates.length}명 후보의 공약 ${pledges.length}건을 한눈에.`,
  };
}

export default async function PartyPage({ params }: { params: { code: string } }) {
  const bundle = await getPartyBundle(params.code);
  if (!bundle) {
    return (
      <main className="max-w-4xl mx-auto p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800">정당을 찾을 수 없습니다</h1>
        <a href="/" className="inline-block mt-6 text-primary underline">홈으로 돌아가기</a>
      </main>
    );
  }
  const { party, candidates, pledges } = bundle;

  const description = `${party.name}(${party.shortName}) 소속 ${candidates.length}명 후보의 공약 ${pledges.length}건을 한눈에.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: party.name,
    alternateName: party.shortName,
    url: `${SITE_URL}/parties/${party.code}`,
    logo: party.logoUrl,
    member: candidates.map((c) => ({
      "@type": "Person",
      name: c.name,
      jobTitle: c.position,
    })),
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <meta property="og:type" content="website" />
      <meta property="og:title" content={`${party.name} 공약 모음`} />
      <meta property="og:description" content={description} />
      <link rel="canonical" href={`${SITE_URL}/parties/${party.code}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>
      <header
        className="rounded-xl shadow-sm p-6 mt-4 mb-6 text-white"
        style={{ backgroundColor: party.color }}
      >
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
            {party.initial}
          </span>
          <div>
            <h1 className="text-2xl font-bold">{party.name}</h1>
            <p className="text-sm opacity-80">{party.shortName} · {candidates.length}명 후보 · {pledges.length}개 공약</p>
          </div>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">소속 후보 ({candidates.length})</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {candidates.map((c) => (
            <a
              key={c.id}
              href={`/candidates/${c.id}`}
              className="block bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-900">{c.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{c.position} · {c.region}</p>
                </div>
                <div className="text-right text-xs">
                  <div className="font-bold text-green-600">{c.citizenScore}</div>
                  <div className="text-gray-400">{c.pledgeCount}개 공약</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-3">대표 공약 ({pledges.length})</h2>
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
                <span>{p.region}</span>
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
