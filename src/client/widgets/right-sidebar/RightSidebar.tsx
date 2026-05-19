"use client";

import { MessageCircle, ThumbsUp, TrendingUp } from "lucide-react";
import { CandidateRankRow } from "@/client/entities/candidate/CandidateRankRow";
import { getRegionFullName } from "@/client/shared/lib/data";
import type { Candidate, Party, Pledge } from "@/client/shared/lib/types";

interface RightSidebarProps {
  selectedRegion: string;
  regionCandidates: Candidate[];
  partyByUuid: Record<string, Party>;
  likedCandidates: Record<string, boolean>;
  onToggleLike: (candidateId: string) => void;
  trending: Pledge[];
}

export function RightSidebar({
  selectedRegion,
  regionCandidates,
  partyByUuid,
  likedCandidates,
  onToggleLike,
  trending,
}: RightSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-72 xl:w-80 shrink-0 p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto gap-4">
      {/* Candidate ranking */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-primary to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm">후보자 랭킹</h3>
            <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">
              2026 지방선거
            </span>
          </div>
          <p className="text-[11px] opacity-80 mt-0.5">
            {getRegionFullName(selectedRegion)} 기준
          </p>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {regionCandidates.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">
              해당 지역 후보자 데이터가 없습니다.
            </p>
          ) : (
            regionCandidates.slice(0, 5).map((c, i) => (
              <CandidateRankRow
                key={c.id}
                rank={i + 1}
                candidate={c}
                party={partyByUuid[c.partyId]}
                liked={!!likedCandidates[c.id]}
                onToggleLike={() => onToggleLike(c.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Trending pledges */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <h3 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          실시간 인기 공약
        </h3>
        <div className="flex flex-col gap-3">
          {trending.length === 0 ? (
            <p className="text-xs text-gray-400">해당 지역 데이터가 없습니다.</p>
          ) : (
            trending.map((p, i) => {
              const party = partyByUuid[p.partyId];
              return (
                <a
                  key={p.id}
                  href={`/pledges/${p.id}`}
                  className="flex gap-2 items-start cursor-pointer group/item"
                >
                  <span
                    className={`text-sm font-bold shrink-0 w-5 ${
                      i < 3 ? "text-primary" : "text-gray-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-grow">
                    <p className="text-sm text-gray-700 font-medium line-clamp-1 group-hover/item:text-primary transition-colors">
                      {p.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className="text-[11px] font-medium"
                        style={{ color: party?.color ?? "#888" }}
                      >
                        {party?.shortName ?? "?"}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                        <ThumbsUp className="w-3 h-3" />
                        {p.upvotes}
                      </span>
                      <span className="text-[11px] text-gray-400 flex items-center gap-0.5">
                        <MessageCircle className="w-3 h-3" />
                        {p.commentCount}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })
          )}
        </div>
      </div>

      {/* Info card */}
      <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-xl border border-primary/10 p-4">
        <h3 className="font-bold text-sm text-primary mb-1">공약포럼이란?</h3>
        <p className="text-xs text-gray-600 leading-relaxed">
          시민이 직접 후보자의 공약을 평가하고 토론하는 플랫폼입니다. 투명한 정책 경쟁을 지향합니다.
        </p>
        <div className="flex gap-3 mt-3 text-[11px] text-gray-500">
          <span>이용약관</span>
          <span>개인정보처리방침</span>
          <span>문의하기</span>
        </div>
      </div>
    </aside>
  );
}
