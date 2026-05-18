import { CommentForm } from "@/client/widgets/comment-form/CommentForm";
import { getPledgeById, listCommentsByPledgeId } from "@/shared/contracts/api";

function timeAgoServer(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  if (days < 30) return `${Math.floor(days / 7)}주 전`;
  return `${Math.floor(days / 30)}개월 전`;
}

const SITE_URL = process.env.MANDU_SITE_URL ?? "https://party-pledge.example.com";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const p = await getPledgeById(params.id);
  if (!p) return { title: "공약을 찾을 수 없습니다 | 공약포럼" };
  return {
    title: `${p.title} — ${p.candidateName} | 공약포럼`,
    description: p.summary.slice(0, 158),
  };
}

export default async function PledgePage({ params }: { params: { id: string } }) {
  const [pledge, comments] = await Promise.all([
    getPledgeById(params.id),
    listCommentsByPledgeId(params.id),
  ]);
  if (!pledge) {
    return (
      <main className="max-w-3xl mx-auto p-12 text-center">
        <h1 className="text-2xl font-bold text-gray-800">공약을 찾을 수 없습니다</h1>
        <p className="text-gray-500 mt-2">잘못된 링크이거나 삭제된 공약입니다.</p>
        <a href="/" className="inline-block mt-6 text-primary underline">홈으로 돌아가기</a>
      </main>
    );
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: pledge.title,
    articleBody: pledge.summary,
    datePublished: pledge.createdAt,
    author: { "@type": "Person", name: pledge.candidateName, jobTitle: pledge.candidatePosition },
    publisher: { "@type": "Organization", name: "공약포럼", url: SITE_URL },
    keywords: pledge.tags.join(", "),
    about: { "@type": "Place", name: `${pledge.region} ${pledge.subRegion}` },
    mainEntityOfPage: `${SITE_URL}/pledges/${pledge.id}`,
  };

  const description = pledge.summary.slice(0, 158);

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <meta property="og:type" content="article" />
      <meta property="og:title" content={pledge.title} />
      <meta property="og:description" content={description} />
      <meta property="article:author" content={pledge.candidateName} />
      <meta property="article:published_time" content={pledge.createdAt} />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={`${SITE_URL}/pledges/${pledge.id}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>
      <article className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-4">
        <header className="mb-4">
          <div className="text-xs text-gray-400 mb-2">
            {pledge.region} {pledge.subRegion} · {pledge.candidatePosition}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{pledge.title}</h1>
          <p className="text-sm text-gray-500 mt-2">
            {pledge.candidateName} · {pledge.author} · {pledge.createdAt.slice(0, 10)}
          </p>
        </header>
        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line mb-6">
          {pledge.summary}
        </p>
        <div className="flex gap-2 flex-wrap mb-6">
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
            {pledge.category}
          </span>
          {pledge.tags.map((t) => (
            <span key={t} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
              #{t}
            </span>
          ))}
        </div>
        <footer className="flex items-center gap-4 text-sm text-gray-500 pt-4 border-t border-gray-100">
          <span>👍 {pledge.upvotes}</span>
          <span>👎 {pledge.downvotes}</span>
          <span>💬 {comments.length}</span>
        </footer>
      </article>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-3">댓글 {comments.length}</h2>
        <CommentForm pledgeId={pledge.id} />
        <div className="flex flex-col gap-3 mt-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              아직 댓글이 없습니다. 첫 댓글을 남겨주세요.
            </p>
          ) : (
            comments.map((c) => (
              <article
                key={c.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-4"
              >
                <header className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">{c.userName}</span>
                  <span className="text-xs text-gray-400">{timeAgoServer(c.createdAt)}</span>
                </header>
                <p className="text-sm text-gray-700 whitespace-pre-line">{c.body}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
