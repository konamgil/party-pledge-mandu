import { listPledges } from "@/shared/contracts/api";

const SITE_URL =
  typeof process !== "undefined" && process.env && process.env.MANDU_SITE_URL
    ? process.env.MANDU_SITE_URL
    : "https://party-pledge.example.com";

export async function generateMetadata({ params }: { params: { name: string } }) {
  const tag = decodeURIComponent(params.name);
  return {
    title: `#${tag} 태그 공약 | 공약포럼`,
    description: `'${tag}' 태그가 붙은 2026 지방선거 공약 모음.`,
  };
}

export default async function TagPage({ params }: { params: { name: string } }) {
  const tag = decodeURIComponent(params.name);
  const all = await listPledges(200);
  const pledges = all
    .filter((p) => p.tags.some((t) => t === tag))
    .sort((a, b) => b.upvotes - a.upvotes);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <link rel="canonical" href={`${SITE_URL}/tags/${encodeURIComponent(tag)}`} />
      <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>

      <header className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4 mb-6">
        <p className="text-xs text-primary font-semibold uppercase">태그</p>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">#{tag}</h1>
        <p className="text-sm text-gray-500 mt-1">{pledges.length}개 공약</p>
      </header>

      {pledges.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">해당 태그의 공약이 없습니다.</p>
        </div>
      ) : (
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
                <a
                  href={`/categories/${encodeURIComponent(p.category)}`}
                  className="hover:text-primary"
                >
                  {p.category}
                </a>
                <span>·</span>
                <span>👍 {p.upvotes}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
