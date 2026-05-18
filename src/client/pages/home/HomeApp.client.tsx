"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  Candidate,
  Party,
  Pledge,
  PositionTab,
  SortType,
} from "@/client/shared/lib/types";
import { getPositionTabs, subRegions } from "@/client/shared/lib/data";
import {
  filterCandidates,
  filterPledges,
  rankCandidates,
  trendingPledges,
} from "@/client/shared/lib/filters";
import { Header } from "@/client/widgets/header/Header";
import { LeftSidebar } from "@/client/widgets/left-sidebar/LeftSidebar";
import { Feed } from "@/client/widgets/feed/Feed";
import { RightSidebar } from "@/client/widgets/right-sidebar/RightSidebar";
import { MobileNav } from "@/client/widgets/mobile-nav/MobileNav";

function HomeApp() {
  const [initialParties, setInitialParties] = useState<Party[]>([]);
  const [initialCandidates, setInitialCandidates] = useState<Candidate[]>([]);
  const [initialPledges, setInitialPledges] = useState<Pledge[]>([]);

  useEffect(() => {
    let aborted = false;
    Promise.all([
      fetch("/api/parties?limit=100").then((r) => r.json()),
      fetch("/api/candidates?limit=100").then((r) => r.json()),
      fetch("/api/pledges?limit=100").then((r) => r.json()),
    ])
      .then(([p, c, pl]) => {
        if (aborted) return;
        setInitialParties(Array.isArray(p?.data) ? p.data : []);
        setInitialCandidates(Array.isArray(c?.data) ? c.data : []);
        setInitialPledges(Array.isArray(pl?.data) ? pl.data : []);
      })
      .catch(() => {});
    return () => {
      aborted = true;
    };
  }, []);

  const partyByUuid = useMemo(() => {
    const m: Record<string, Party> = {};
    for (const p of initialParties) m[p.id] = p;
    return m;
  }, [initialParties]);

  const [selectedParty, setSelectedParty] = useState<string | "all">("all");
  const [selectedRegion, setSelectedRegion] = useState("서울");
  const [selectedSubRegion, setSelectedSubRegion] = useState("강남구");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedPositionTab, setSelectedPositionTab] = useState("서울시장");
  const [sortBy, setSortBy] = useState<SortType>("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [votes, setVotes] = useState<Record<string, 0 | 1 | -1>>({});
  const [likedCandidates, setLikedCandidates] = useState<Record<string, boolean>>({});
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const me = (await (
          await fetch("/api/auth/me", { credentials: "include" })
        ).json()) as { user: { id: string } | null };
        if (aborted) return;
        if (!me.user) {
          setCurrentUserId(null);
          return;
        }
        setCurrentUserId(me.user.id);
        const votesRes = (await (
          await fetch(`/api/votes?userId=${encodeURIComponent(me.user.id)}&limit=200`, {
            credentials: "include",
          })
        ).json()) as { data: { pledgeId: string; direction: number }[] };
        if (aborted) return;
        const map: Record<string, 0 | 1 | -1> = {};
        for (const v of votesRes.data ?? []) {
          map[v.pledgeId] = v.direction === 1 ? 1 : v.direction === -1 ? -1 : 0;
        }
        setVotes(map);
      } catch {
        if (!aborted) setCurrentUserId(null);
      }
    })();
    return () => {
      aborted = true;
    };
  }, []);

  const positionTabs: PositionTab[] = useMemo(
    () => getPositionTabs(selectedRegion, selectedSubRegion),
    [selectedRegion, selectedSubRegion],
  );

  useEffect(() => {
    if (positionTabs.length > 0 && !positionTabs.find((t) => t.key === selectedPositionTab)) {
      setSelectedPositionTab(positionTabs[0].key);
    }
  }, [positionTabs, selectedPositionTab]);

  const regionCandidates = useMemo(
    () => rankCandidates(filterCandidates(initialCandidates, selectedRegion, selectedSubRegion)),
    [initialCandidates, selectedRegion, selectedSubRegion],
  );

  const filteredPledges = useMemo(
    () =>
      filterPledges(initialPledges, {
        party: selectedParty,
        region: selectedRegion,
        category: selectedCategory,
        sortBy,
        positionTab: selectedPositionTab,
        search: searchQuery,
      }),
    [
      initialPledges,
      selectedParty,
      selectedRegion,
      selectedCategory,
      sortBy,
      selectedPositionTab,
      searchQuery,
    ],
  );

  const trending = useMemo(
    () => trendingPledges(initialPledges, selectedRegion, 4),
    [initialPledges, selectedRegion],
  );

  const handleVote = (pledgeId: string, direction: 1 | -1) => {
    if (!currentUserId) {
      if (typeof window !== "undefined") {
        const ok = window.confirm("투표는 로그인이 필요합니다. 로그인 페이지로 이동할까요?");
        if (ok) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
        }
      }
      return;
    }
    const current = votes[pledgeId] ?? 0;
    const next: 0 | 1 | -1 = current === direction ? 0 : direction;
    setVotes((prev) => ({ ...prev, [pledgeId]: next }));
    void fetch("/api/votes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ userId: currentUserId, pledgeId, direction: next }),
    }).catch(() => {
      // 실패 시 silently 무시 — 다음 페이지 로드 시 자동 동기화
    });
  };

  const toggleCandidateLike = (candidateId: string) => {
    setLikedCandidates((prev) => ({ ...prev, [candidateId]: !prev[candidateId] }));
  };

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    const subs = subRegions[newRegion];
    setSelectedSubRegion(subs && subs.length > 0 ? subs[0] : "");
  };

  const partyList: { id: string | "all"; name: string; color?: string }[] = [
    { id: "all", name: "전체" },
    ...initialParties.map((p) => ({ id: p.id, name: p.shortName, color: p.color })),
  ];

  const currentSubRegions = subRegions[selectedRegion] || [];

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRegion={selectedRegion}
        onRegionChange={handleRegionChange}
        selectedSubRegion={selectedSubRegion}
        onSubRegionChange={setSelectedSubRegion}
        currentSubRegions={currentSubRegions}
        showMobileFilter={showMobileFilter}
        onToggleMobileFilter={() => setShowMobileFilter((v) => !v)}
      />

      <div className="max-w-[1400px] mx-auto w-full flex-grow flex flex-col lg:flex-row">
        <LeftSidebar
          partyList={partyList}
          selectedParty={selectedParty}
          onPartyChange={setSelectedParty}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedRegion={selectedRegion}
          onRegionChange={handleRegionChange}
        />

        <Feed
          partyList={partyList}
          selectedParty={selectedParty}
          onPartyChange={setSelectedParty}
          selectedRegion={selectedRegion}
          selectedSubRegion={selectedSubRegion}
          positionTabs={positionTabs}
          selectedPositionTab={selectedPositionTab}
          onPositionTabChange={setSelectedPositionTab}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filteredPledges={filteredPledges}
          partyByUuid={partyByUuid}
          votes={votes}
          onVote={handleVote}
        />

        <RightSidebar
          selectedRegion={selectedRegion}
          regionCandidates={regionCandidates}
          partyByUuid={partyByUuid}
          likedCandidates={likedCandidates}
          onToggleLike={toggleCandidateLike}
          trending={trending}
        />
      </div>

      <MobileNav currentUserId={currentUserId} />
    </div>
  );
}

export default HomeApp;
