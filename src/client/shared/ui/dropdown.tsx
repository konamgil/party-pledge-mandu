"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: ReactNode;
  placeholder?: string;
  searchable?: boolean;
  size?: "sm" | "md";
  className?: string;
  ariaLabel?: string;
}

export function Dropdown({
  options,
  value,
  onChange,
  icon,
  placeholder = "선택",
  searchable = false,
  size = "sm",
  className = "",
  ariaLabel,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    if (searchable) {
      setTimeout(() => inputRef.current?.focus(), 0);
    }
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, searchable]);

  const selected = options.find((o) => o.value === value);
  const sizeClasses =
    size === "sm" ? "h-8 px-3 text-sm rounded-full" : "h-10 px-4 text-sm rounded-lg";

  const filtered = searchable && query.trim().length > 0
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : options;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel ?? selected?.label ?? placeholder}
        className={`${sizeClasses} bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 flex items-center gap-1.5 w-full text-left transition-colors`}
      >
        {icon && <span className="text-gray-500 shrink-0 flex items-center">{icon}</span>}
        <span className="flex-grow truncate text-gray-700">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute z-50 mt-1 w-full min-w-[8rem] max-h-72 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {searchable && (
            <div className="border-b border-gray-100 p-2">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="검색…"
                className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
          <ul className="overflow-y-auto max-h-60">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400 text-center">결과 없음</li>
            ) : (
              filtered.map((opt) => {
                const active = opt.value === value;
                return (
                  <li key={opt.value} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => {
                        onChange(opt.value);
                        setOpen(false);
                        setQuery("");
                      }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 ${
                        active
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {active ? (
                        <Check className="w-4 h-4 text-primary shrink-0" />
                      ) : (
                        <span className="w-4 h-4 shrink-0" />
                      )}
                      <span>{opt.label}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
