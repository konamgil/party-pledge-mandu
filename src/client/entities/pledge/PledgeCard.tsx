import type { Pledge, Party } from "@/client/shared/lib/types";
import { timeAgo } from "@/client/shared/lib/utils";

interface PledgeCardProps {
  pledge: Pledge;
  party: Party | undefined;
  voteState: 0 | 1 | -1;
  onVote: (direction: 1 | -1) => void;
  onComment?: () => void;
  onShare?: () => void;
  onSave?: () => void;
  onMenu?: () => void;
}

export function PledgeCard({
  pledge,
  party,
  voteState,
  onVote,
  onComment,
  onShare,
  onSave,
  onMenu,
}: PledgeCardProps) {
  const color = party?.color ?? "#888";
  const shortName = party?.shortName ?? "?";
  const initial = party?.initial ?? "?";
  const netVotes = pledge.upvotes - pledge.downvotes + voteState;

  return (
    <article className="pledge-card bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden group cursor-pointer">
      <div className="px-4 pt-3 pb-2 flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
          style={{ backgroundColor: color }}
        >
          {initial}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-1.5 text-sm">
            <span className="font-semibold text-gray-800">{pledge.candidateName}</span>
            <span
              className="text-xs px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: color + "15", color }}
            >
              {shortName}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>{pledge.candidatePosition}</span>
            <span>·</span>
            <span>{timeAgo(pledge.createdAt)}</span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onMenu?.();
          }}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="더보기"
        >
          <span className="material-symbols-outlined text-lg">more_horiz</span>
        </button>
      </div>

      <div className="px-4 pb-2">
        <h3 className="text-[15px] font-bold text-gray-900 leading-snug mb-1.5">{pledge.title}</h3>
        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{pledge.summary}</p>
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
            {pledge.category}
          </span>
          {pledge.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-full"
              style={{ backgroundColor: color + "10", color: color }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVote(1);
            }}
            className={`vote-btn flex items-center gap-0.5 px-2 py-1 rounded-full text-sm transition-all ${
              voteState === 1 ? "bg-primary/10 text-primary" : "text-gray-500 hover:bg-gray-100"
            }`}
            aria-label="upvote"
          >
            <span className={`material-symbols-outlined text-lg ${voteState === 1 ? "fill" : ""}`}>
              thumb_up
            </span>
            <span className="font-medium text-xs">
              {pledge.upvotes + (voteState === 1 ? 1 : 0)}
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVote(-1);
            }}
            className={`vote-btn flex items-center gap-0.5 px-2 py-1 rounded-full text-sm transition-all ${
              voteState === -1 ? "bg-red-50 text-red-500" : "text-gray-500 hover:bg-gray-100"
            }`}
            aria-label="downvote"
          >
            <span className={`material-symbols-outlined text-lg ${voteState === -1 ? "fill" : ""}`}>
              thumb_down
            </span>
          </button>
          <span className="text-xs font-bold text-gray-700 ml-1">{netVotes}</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComment?.();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors text-sm"
            aria-label="댓글"
          >
            <span className="material-symbols-outlined text-lg">chat_bubble_outline</span>
            <span className="text-xs font-medium">{pledge.commentCount}</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare?.();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors text-sm"
            aria-label="공유"
          >
            <span className="material-symbols-outlined text-lg">share</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSave?.();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-gray-500 hover:bg-gray-100 transition-colors text-sm"
            aria-label="저장"
          >
            <span className="material-symbols-outlined text-lg">bookmark_border</span>
          </button>
        </div>
      </div>
    </article>
  );
}
