"use client";

import { Bell, Home, Plus, Search, User } from "lucide-react";

interface MobileNavProps {
  currentUserId: string | null;
}

export function MobileNav({ currentUserId }: MobileNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        <a href="/" className="flex flex-col items-center gap-0.5 text-primary">
          <Home className="w-5 h-5" fill="currentColor" />
          <span className="text-[10px] font-medium">홈</span>
        </a>
        <a
          href="/search"
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] font-medium">검색</span>
        </a>
        <a
          href="/pledges/new"
          className="flex flex-col items-center gap-0.5 text-gray-400 hover:text-primary"
        >
          <span className="bg-primary text-white rounded-full p-1.5 flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </span>
          <span className="text-[10px] font-medium">제안</span>
        </a>
        <button
          type="button"
          onClick={() => alert("알림 기능은 준비 중입니다.")}
          className="flex flex-col items-center gap-0.5 text-gray-400"
        >
          <Bell className="w-5 h-5" />
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
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">{currentUserId ? "MY" : "로그인"}</span>
        </a>
      </div>
    </nav>
  );
}
