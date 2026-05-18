"use client";

import { useEffect, useMemo, useState } from "react";
import type { Candidate, Party } from "@/client/shared/lib/types";
import {
  categories,
  getPositionTabs,
  regions,
  subRegions,
} from "@/client/shared/lib/data";

interface PledgeFormProps {
  parties: Party[];
  candidates: Candidate[];
}

interface Me {
  id: string;
  email: string;
  name: string;
}

export function PledgeForm({ parties, candidates }: PledgeFormProps) {
  const [user, setUser] = useState<Me | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("경제");
  const [region, setRegion] = useState("서울");
  const [subRegion, setSubRegion] = useState("강남구");
  const [positionTab, setPositionTab] = useState("서울시장");
  const [partyId, setPartyId] = useState(parties[0]?.id ?? "");
  const [candidateId, setCandidateId] = useState("");
  const [tags, setTags] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((j: { user: Me | null }) => setUser(j.user))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, []);

  const subs = subRegions[region] ?? [];
  const positionTabs = useMemo(() => getPositionTabs(region, subRegion), [region, subRegion]);

  const candidateOptions = useMemo(
    () =>
      candidates.filter(
        (c) =>
          c.partyId === partyId &&
          c.region === region &&
          (!c.subRegion || c.subRegion === subRegion) &&
          c.position === positionTab,
      ),
    [candidates, partyId, region, subRegion, positionTab],
  );

  useEffect(() => {
    // 자동으로 첫 후보 선택
    if (candidateOptions.length > 0 && !candidateOptions.find((c) => c.id === candidateId)) {
      setCandidateId(candidateOptions[0].id);
    } else if (candidateOptions.length === 0) {
      setCandidateId("");
    }
  }, [candidateOptions, candidateId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!candidateId) {
      setError("해당 정당·지역·직위에 후보자가 없습니다. 다른 조건을 선택하세요.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const candidate = candidates.find((c) => c.id === candidateId);
      const tagList = tags
        .split(/[,\s]+/)
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await fetch("/api/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          summary: summary.trim(),
          category,
          region,
          subRegion,
          positionTab,
          partyId,
          candidateId,
          candidateName: candidate?.name ?? "",
          candidatePosition: candidate?.position ?? positionTab,
          author: user.name,
          tags: tagList,
        }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `등록 실패 (${res.status})`);
      }
      const body = (await res.json()) as { data: { id: string } };
      window.location.href = `/pledges/${body.data.id}`;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  if (!authChecked) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-400">
        로딩 중…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-sm text-gray-600 mb-4">공약 제안은 로그인 후 가능합니다.</p>
        <a
          href="/login?redirect=/pledges/new"
          className="inline-block bg-primary text-white font-semibold px-5 py-2.5 rounded-full hover:bg-primary/90"
        >
          로그인하러 가기
        </a>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col gap-4"
    >
      <p className="text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{user.name}</span> 이름으로 제안합니다.
      </p>

      <label className="text-sm">
        <span className="text-gray-700 font-medium">제목 *</span>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 청년 월세 지원 확대"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <label className="text-sm">
        <span className="text-gray-700 font-medium">상세 내용 *</span>
        <textarea
          required
          rows={5}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="공약의 구체적인 내용·재원·시행 방안을 적어주세요"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label>
          <span className="text-gray-700 font-medium">분야</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
          >
            {categories.filter((c) => c !== "전체").map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-gray-700 font-medium">정당</span>
          <select
            value={partyId}
            onChange={(e) => setPartyId(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
          >
            {parties.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-gray-700 font-medium">광역</span>
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              const newSubs = subRegions[e.target.value] ?? [];
              setSubRegion(newSubs[0] ?? "");
            }}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
          >
            {regions.filter((r) => r !== "전체").map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>

        <label>
          <span className="text-gray-700 font-medium">기초</span>
          <select
            value={subRegion}
            onChange={(e) => setSubRegion(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
            disabled={subs.length === 0}
          >
            {subs.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="text-sm">
        <span className="text-gray-700 font-medium">직위</span>
        <select
          value={positionTab}
          onChange={(e) => setPositionTab(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
        >
          {positionTabs.map((t) => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>
      </label>

      <label className="text-sm">
        <span className="text-gray-700 font-medium">후보자</span>
        {candidateOptions.length > 0 ? (
          <select
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg bg-white"
          >
            {candidateOptions.map((c) => (
              <option key={c.id} value={c.id}>{c.name} ({c.position})</option>
            ))}
          </select>
        ) : (
          <p className="mt-1 text-xs text-red-500">
            ⚠ 이 정당·지역·직위에 등록된 후보가 없습니다. 조건을 바꿔주세요.
          </p>
        )}
      </label>

      <label className="text-sm">
        <span className="text-gray-700 font-medium">태그 (쉼표 구분)</span>
        <input
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="예: 청년정책, 주거안정"
          className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </label>

      {error && (
        <p className="text-sm text-red-500" role="alert">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <a
          href="/"
          className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700"
        >
          취소
        </a>
        <button
          type="submit"
          disabled={submitting || candidateOptions.length === 0 || title.trim().length === 0 || summary.trim().length === 0}
          className="bg-primary text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "등록 중…" : "공약 등록"}
        </button>
      </div>
    </form>
  );
}
