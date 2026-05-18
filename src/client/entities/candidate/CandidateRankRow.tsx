import type { Candidate, Party } from "@/client/shared/lib/types";

interface CandidateRankRowProps {
  rank: number;
  candidate: Candidate;
  party: Party | undefined;
  liked: boolean;
  onToggleLike: () => void;
}

export function CandidateRankRow({
  rank,
  candidate,
  party,
  liked,
  onToggleLike,
}: CandidateRankRowProps) {
  const color = party?.color ?? "#888";
  const shortName = party?.shortName ?? "?";
  const rankBadgeClass =
    rank === 1
      ? "bg-yellow-400 text-yellow-900"
      : rank === 2
        ? "bg-gray-300 text-gray-700"
        : rank === 3
          ? "bg-orange-300 text-orange-800"
          : "bg-gray-100 text-gray-500";

  return (
    <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
      <span
        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${rankBadgeClass}`}
      >
        {rank}
      </span>
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-gray-400 text-base">person</span>
      </div>
      <div className="flex-grow min-w-0">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm text-gray-800 truncate">{candidate.name}</span>
          <span
            className="text-[10px] font-medium px-1 rounded"
            style={{ backgroundColor: color + "15", color }}
          >
            {shortName}
          </span>
        </div>
        <span className="text-[11px] text-gray-400">{candidate.position}</span>
      </div>
      <div className="flex flex-col items-end shrink-0">
        <span className="text-xs font-bold text-green-600">{candidate.citizenScore}</span>
        <span className="text-[10px] text-gray-400">{candidate.pledgeCount}개 공약</span>
      </div>
      <button
        onClick={onToggleLike}
        className={`shrink-0 transition-colors ${
          liked ? "text-red-500" : "text-gray-300 hover:text-red-400"
        }`}
        aria-label={liked ? "좋아요 취소" : "좋아요"}
      >
        <span className={`material-symbols-outlined text-base ${liked ? "fill" : ""}`}>
          favorite
        </span>
      </button>
    </div>
  );
}
