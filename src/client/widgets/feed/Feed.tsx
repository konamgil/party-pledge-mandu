"use client";

import {
  ChevronRight,
  Clock,
  Flame,
  Navigation,
  SearchX,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { PledgeCard } from "@/client/entities/pledge/PledgeCard";
import { getRegionFullName } from "@/client/shared/lib/data";
import type { Party, Pledge, PositionTab, SortType } from "@/client/shared/lib/types";

interface PartyOption {
  id: string | "all";
  name: string;
  color?: string;
}

interface FeedProps {
  partyList: PartyOption[];
  selectedParty: string | "all";
  onPartyChange: (id: string | "all") => void;
  selectedRegion: string;
  selectedSubRegion: string;
  positionTabs: PositionTab[];
  selectedPositionTab: string;
  onPositionTabChange: (key: string) => void;
  sortBy: SortType;
  onSortChange: (s: SortType) => void;
  filteredPledges: Pledge[];
  partyByUuid: Record<string, Party>;
  votes: Record<string, 0 | 1 | -1>;
  onVote: (pledgeId: string, direction: 1 | -1) => void;
}

const SORT_OPTIONS: { key: SortType; label: string; Icon: LucideIcon }[] = [
  { key: "hot", label: "인기", Icon: Flame },
  { key: "new", label: "최신", Icon: Clock },
  { key: "top", label: "추천순", Icon: TrendingUp },
];

export function Feed({
  partyList,
  selectedParty,
  onPartyChange,
  selectedRegion,
  selectedSubRegion,
  positionTabs,
  selectedPositionTab,
  onPositionTabChange,
  sortBy,
  onSortChange,
  filteredPledges,
  partyByUuid,
  votes,
  onVote,
}: FeedProps) {
  return (
    <main className="flex-grow max-w-[680px] w-full mx-auto px-3 lg:px-4 py-3 lg:py-4 flex flex-col gap-3">
      {/* Mobile party filter */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        {partyList.map((p) => (
          <button
            key={p.id}
            onClick={() => onPartyChange(p.id)}
            className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 whitespace-nowrap text-xs font-medium transition-all shrink-0 ${
              selectedParty === p.id
                ? "bg-gray-800 text-white"
                : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {p.color && (
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
            )}
            {p.name}
          </button>
        ))}
      </div>

      {/* Region + Position tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-primary/5 to-transparent border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="font-semibold text-gray-800">
              {getRegionFullName(selectedRegion)}
            </span>
            {selectedSubRegion && (
              <>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-600">{selectedSubRegion}</span>
              </>
            )}
          </div>
          <span className="text-xs text-gray-400">{filteredPledges.length}개 공약</span>
        </div>
        <div className="flex overflow-x-auto scrollbar-hide">
          {positionTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => onPositionTabChange(tab.key)}
              className={`px-4 py-3 text-sm font-medium transition-all shrink-0 relative border-b-2 ${
                selectedPositionTab === tab.key
                  ? "text-primary border-primary bg-primary/5"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-1 bg-white rounded-lg px-2 py-1.5 shadow-sm border border-gray-200">
        {SORT_OPTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => onSortChange(s.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 transition-all ${
              sortBy === s.key
                ? "bg-primary/10 text-primary"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <s.Icon className="w-4 h-4" />
            {s.label}
          </button>
        ))}
      </div>

      {/* Pledge feed */}
      {filteredPledges.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
          <SearchX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">해당 조건에 맞는 공약이 없습니다.</p>
          <p className="text-sm text-gray-400 mt-1">다른 직위 탭이나 필터를 선택해보세요.</p>
        </div>
      ) : (
        filteredPledges.map((pledge) => (
          <PledgeCard
            key={pledge.id}
            pledge={pledge}
            party={partyByUuid[pledge.partyId]}
            voteState={votes[pledge.id] ?? 0}
            onVote={(d) => onVote(pledge.id, d)}
          />
        ))
      )}
    </main>
  );
}
