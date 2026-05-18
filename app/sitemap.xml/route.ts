import { db } from "@/server/infra/db";

import { env } from "@/shared/contracts/env";
const SITE_URL = env("MANDU_SITE_URL", "https://party-pledge.example.com");

interface PartyRow { code: string }
interface CandidateRow { id: string }
interface PledgeRow { id: string; created_at: string }
interface RegionRow { region: string; sub_region: string }

function urlEntry(
  loc: string,
  priority: number,
  changeFrequency: "daily" | "weekly" | "monthly" | "yearly",
  lastModified?: string,
): string {
  const parts = [
    "  <url>",
    `    <loc>${loc}</loc>`,
    changeFrequency ? `    <changefreq>${changeFrequency}</changefreq>` : "",
    `    <priority>${priority.toFixed(1)}</priority>`,
    lastModified ? `    <lastmod>${lastModified}</lastmod>` : "",
    "  </url>",
  ].filter(Boolean);
  return parts.join("\n");
}

function escapeUrl(s: string): string {
  return encodeURI(s).replace(/&/g, "&amp;");
}

export async function GET() {
  const [parties, candidates, pledges, regionPairs] = await Promise.all([
    db<PartyRow>`SELECT "code" FROM "parties"`,
    db<CandidateRow>`SELECT "id" FROM "candidates"`,
    db<PledgeRow>`SELECT "id", "created_at" FROM "pledges"`,
    db<RegionRow>`SELECT DISTINCT "region", "sub_region" FROM "pledges" WHERE "sub_region" <> ''`,
  ]);

  const distinctRegions = Array.from(new Set(regionPairs.map((r) => r.region)));

  const entries: string[] = [
    urlEntry(`${SITE_URL}/`, 1.0, "daily"),
  ];

  for (const party of parties) {
    entries.push(urlEntry(`${SITE_URL}/parties/${party.code}`, 0.8, "weekly"));
  }

  for (const candidate of candidates) {
    entries.push(urlEntry(`${SITE_URL}/candidates/${candidate.id}`, 0.7, "weekly"));
  }

  for (const pledge of pledges) {
    const lastMod = pledge.created_at ? pledge.created_at.slice(0, 10) : undefined;
    entries.push(urlEntry(`${SITE_URL}/pledges/${pledge.id}`, 0.9, "monthly", lastMod));
  }

  for (const region of distinctRegions) {
    entries.push(urlEntry(escapeUrl(`${SITE_URL}/regions/${region}`), 0.6, "weekly"));
  }

  for (const pair of regionPairs) {
    entries.push(
      urlEntry(
        escapeUrl(`${SITE_URL}/regions/${pair.region}/${pair.sub_region}`),
        0.5,
        "weekly",
      ),
    );
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries,
    "</urlset>",
    "",
  ].join("\n");

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
