"use client";

import { categories } from "@/client/shared/lib/data";

const QUICK_REGIONS = ["서울", "경기", "인천", "부산", "대구", "광주", "대전", "충남", "경남"];

interface PartyOption {
  id: string | "all";
  name: string;
  color?: string;
}

interface LeftSidebarProps {
  partyList: PartyOption[];
  selectedParty: string | "all";
  onPartyChange: (id: string | "all") => void;
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
  selectedRegion: string;
  onRegionChange: (r: string) => void;
}

export function LeftSidebar({
  partyList,
  selectedParty,
  onPartyChange,
  selectedCategory,
  onCategoryChange,
  selectedRegion,
  onRegionChange,
}: LeftSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-col w-56 xl:w-64 shrink-0 p-4 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
          정당 필터
        </h3>
        <div className="flex flex-col gap-0.5">
          {partyList.map((p) => (
            <button
              key={p.id}
              onClick={() => onPartyChange(p.id)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                selectedParty === p.id
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p.color ? (
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    backgroundColor: p.color,
                    boxShadow: `0 0 0 2px white, 0 0 0 3px ${p.color}40`,
                  }}
                />
              ) : (
                <span className="w-3 h-3 rounded-full shrink-0 bg-gray-400 ring-2 ring-offset-1 ring-gray-200" />
              )}
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
          분야
        </h3>
        <div className="flex flex-wrap gap-1.5 px-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedCategory === c
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
          빠른 지역 이동
        </h3>
        <div className="flex flex-wrap gap-1.5 px-2">
          {QUICK_REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => onRegionChange(r)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                selectedRegion === r
                  ? "bg-primary text-white"
                  : "bg-white text-gray-500 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <a
        href="/pledges/new"
        className="mt-6 w-full bg-primary text-white font-semibold text-sm py-2.5 rounded-full shadow-md hover:shadow-lg hover:bg-primary/90 transition-all active:scale-[0.97] text-center"
      >
        + 공약 제안하기
      </a>
    </aside>
  );
}
