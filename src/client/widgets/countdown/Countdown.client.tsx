"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  target: string; // ISO date
}

function diff(target: Date) {
  const ms = Math.max(0, target.getTime() - Date.now());
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds };
}

export function Countdown({ target }: CountdownProps) {
  const targetDate = new Date(target);
  const [time, setTime] = useState(() => diff(targetDate));

  useEffect(() => {
    const id = setInterval(() => setTime(diff(targetDate)), 1000);
    return () => clearInterval(id);
  }, [target]);

  return (
    <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
      {(
        [
          { value: time.days, label: "일" },
          { value: time.hours, label: "시간" },
          { value: time.minutes, label: "분" },
          { value: time.seconds, label: "초" },
        ]
      ).map((t) => (
        <div key={t.label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <div className="text-2xl font-bold text-primary tabular-nums">
            {String(t.value).padStart(2, "0")}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">{t.label}</div>
        </div>
      ))}
    </div>
  );
}
