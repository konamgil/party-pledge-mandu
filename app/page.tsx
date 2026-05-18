import HomeApp from "@/client/widgets/home-app/HomeApp";
import { listCandidates, listParties, listPledges } from "@/server/infra/queries";

const SITE_URL = process.env.MANDU_SITE_URL ?? "https://party-pledge.example.com";

export const metadata = {
  title: "공약포럼 — 2026 지방선거 후보 공약 한눈에 비교",
  description:
    "2026 지방선거 4개 정당(민주·국힘·조국혁신·개혁신당) 후보의 공약을 정당·지역·직위별로 비교하고 시민이 직접 평가하는 SNS",
};

export default async function HomePage() {
  const [initialParties, initialCandidates, initialPledges] = await Promise.all([
    listParties(),
    listCandidates(),
    listPledges(),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "공약포럼",
    alternateName: "Party Pledge Forum",
    url: SITE_URL,
    description:
      "2026 지방선거 4개 정당 후보의 공약을 정당·지역·직위·카테고리별로 비교하고 평가하는 SNS",
    inLanguage: "ko",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <title>공약포럼 — 2026 지방선거 후보 공약 한눈에 비교</title>
      <meta
        name="description"
        content="2026 지방선거 4개 정당(민주·국힘·조국혁신·개혁신당) 후보의 공약을 정당·지역·직위별로 비교하고 시민이 직접 평가합니다."
      />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="공약포럼 — 2026 지방선거 공약" />
      <meta
        property="og:description"
        content="시민이 직접 후보자의 공약을 평가하고 토론하는 플랫폼"
      />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={`${SITE_URL}/`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeApp
        initialParties={initialParties}
        initialCandidates={initialCandidates}
        initialPledges={initialPledges}
      />
    </>
  );
}
