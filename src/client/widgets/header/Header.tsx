"use client";

import { AuthButton } from "@/client/features/auth-button/AuthButton";
import { Dropdown } from "@/client/shared/ui/dropdown";
import { regions } from "@/client/shared/lib/data";

const REGION_OPTIONS = regions.filter((r) => r !== "전체").map((r) => ({ value: r, label: r }));

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  selectedSubRegion: string;
  onSubRegionChange: (subRegion: string) => void;
  currentSubRegions: string[];
  showMobileFilter: boolean;
  onToggleMobileFilter: () => void;
}

export function Header({
  searchQuery,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  selectedSubRegion,
  onSubRegionChange,
  currentSubRegions,
  showMobileFilter,
  onToggleMobileFilter,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div className="flex justify-between items-center w-full px-3 lg:px-6 max-w-[1400px] mx-auto h-12 lg:h-14">
        <div className="flex items-center gap-2 lg:gap-4">
          <a
            className="font-display font-bold text-primary flex items-center gap-1.5 text-base lg:text-lg"
            href="/"
          >
            <span className="bg-primary text-white w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold">
              공
            </span>
            <span className="hidden sm:inline">공약포럼</span>
          </a>
          <form
            className="hidden md:flex relative w-64 lg:w-80"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = searchQuery.trim();
              if (trimmed && typeof window !== "undefined") {
                window.location.href = `/search?q=${encodeURIComponent(trimmed)}`;
              }
            }}
          >
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              search
            </span>
            <input
              className="w-full bg-gray-100 rounded-full py-2 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white border border-transparent focus:border-primary/20 text-sm transition-all"
              placeholder="공약, 후보자, 정당 검색... (Enter)"
              type="search"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </form>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onToggleMobileFilter}
            className="lg:hidden flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors"
          >
            <span className="material-symbols-outlined text-base">location_on</span>
            {selectedRegion}
          </button>
          <div className="hidden lg:flex items-center gap-1.5">
            <Dropdown
              options={REGION_OPTIONS}
              value={selectedRegion}
              onChange={onRegionChange}
              icon="location_on"
              size="sm"
              className="w-28"
              ariaLabel="광역지역 선택"
            />
            {currentSubRegions.length > 0 && (
              <Dropdown
                options={currentSubRegions.map((sr) => ({ value: sr, label: sr }))}
                value={selectedSubRegion}
                onChange={onSubRegionChange}
                searchable
                size="sm"
                className="w-32"
                ariaLabel="기초지역 선택"
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => alert("알림 기능은 준비 중입니다.")}
            className="relative text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="알림"
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <AuthButton />
        </div>
      </div>
      {showMobileFilter && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 py-3 shadow-sm">
          <div className="flex gap-2">
            <Dropdown
              options={REGION_OPTIONS}
              value={selectedRegion}
              onChange={onRegionChange}
              icon="location_on"
              searchable
              size="md"
              className="flex-1"
              ariaLabel="광역지역 선택"
            />
            {currentSubRegions.length > 0 && (
              <Dropdown
                options={currentSubRegions.map((sr) => ({ value: sr, label: sr }))}
                value={selectedSubRegion}
                onChange={onSubRegionChange}
                searchable
                size="md"
                className="flex-1"
                ariaLabel="기초지역 선택"
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
}
