"use client";

interface MobileNavProps {
  currentUserId: string | null;
}

export function MobileNav({ currentUserId }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        <a href="/" className="flex flex-col items-center gap-0.5 text-primary">
          <span className="material-symbols-outlined text-xl fill">home</span>
          <span className="text-[10px] font-medium">홈</span>
        </a>
        <a
          href="/search"
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary"
        >
          <span className="material-symbols-outlined text-xl">search</span>
          <span className="text-[10px] font-medium">검색</span>
        </a>
        <a
          href="/pledges/new"
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary"
        >
          <span className="material-symbols-outlined text-xl bg-primary text-white rounded-full p-1">
            add
          </span>
          <span className="text-[10px] font-medium">제안</span>
        </a>
        <button
          type="button"
          onClick={() => alert("알림 기능은 준비 중입니다.")}
          className="flex flex-col items-center gap-0.5 text-gray-400"
        >
          <span className="material-symbols-outlined text-xl">notifications</span>
          <span className="text-[10px] font-medium">알림</span>
        </button>
        <a
          href={currentUserId ? "#" : "/login"}
          onClick={(e) => {
            if (currentUserId) {
              e.preventDefault();
              alert("마이페이지는 준비 중입니다.");
            }
          }}
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary"
        >
          <span className="material-symbols-outlined text-xl">person</span>
          <span className="text-[10px] font-medium">{currentUserId ? "MY" : "로그인"}</span>
        </a>
      </div>
    </nav>
  );
}
