"use client";

import { useState } from "react";

interface SearchInputProps {
  defaultValue?: string;
}

export function SearchInput({ defaultValue = "" }: SearchInputProps) {
  const [q, setQ] = useState(defaultValue);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (typeof window !== "undefined") {
      window.location.href = trimmed
        ? `/search?q=${encodeURIComponent(trimmed)}`
        : "/search";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
        search
      </span>
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="공약, 후보자, 정당 검색…"
        className="w-full bg-white rounded-full py-3 pl-10 pr-4 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 text-sm transition-all"
        autoFocus={!defaultValue}
      />
    </form>
  );
}
