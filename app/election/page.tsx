import { Countdown } from "@/client/widgets/countdown/Countdown.client";

export const metadata = {
  title: "2026 지방선거 안내 | 공약포럼",
  description:
    "2026 제9회 전국동시지방선거 일정·후보자 등록·투표소·재외선거 안내. 시민의 정책 선택을 돕는 핵심 정보.",
};

// 제9회 전국동시지방선거 2026-06-03 (수). 공직선거법상 매 4년 6월 첫째 수요일.
const ELECTION_DAY = "2026-06-03T06:00:00+09:00";

const SCHEDULE = [
  { date: "2026-02-04", label: "예비후보자 등록 시작", phase: "선거운동 준비" },
  { date: "2026-03-23", label: "공무원 등 사퇴 시한 (선거일 90일 전)", phase: "선거 준비" },
  { date: "2026-05-14", label: "후보자 등록 (5/14 ~ 5/15)", phase: "후보 확정" },
  { date: "2026-05-21", label: "공식 선거운동 시작", phase: "선거운동" },
  { date: "2026-05-29", label: "사전투표 (5/29 ~ 5/30)", phase: "투표" },
  { date: "2026-06-03", label: "선거일 (오전 6시 ~ 오후 6시)", phase: "투표" },
];

const POSITIONS = [
  "광역단체장 (시·도지사)",
  "기초단체장 (시장·군수·구청장)",
  "광역의원 (시·도의원)",
  "기초의원 (시·군·구의원)",
  "교육감",
  "교육의원 (제주)",
];

export default function ElectionPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <a href="/" className="text-sm text-gray-500 hover:text-primary">← 공약포럼</a>

      <header className="text-center mt-6 mb-8">
        <p className="text-xs text-primary font-semibold uppercase tracking-wider">
          2026 제9회 전국동시지방선거
        </p>
        <h1 className="text-3xl font-bold text-gray-900 mt-2">선거일까지</h1>
        <div className="mt-6">
          <Countdown target={ELECTION_DAY} />
        </div>
        <p className="text-sm text-gray-500 mt-4">
          2026년 6월 3일 (수요일) · 오전 6시 ~ 오후 6시
        </p>
      </header>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">📅 주요 일정</h2>
        <ol className="flex flex-col gap-3">
          {SCHEDULE.map((s) => (
            <li key={s.date} className="flex gap-3">
              <span className="text-xs font-bold text-primary w-24 shrink-0 tabular-nums">
                {s.date}
              </span>
              <div className="flex-grow">
                <div className="text-sm font-medium text-gray-800">{s.label}</div>
                <div className="text-xs text-gray-400">{s.phase}</div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">🗳️ 선출 직위</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {POSITIONS.map((p) => (
            <li key={p} className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
              {p}
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-xl border border-primary/10 p-6 mb-6">
        <h2 className="text-lg font-bold text-primary mb-2">투표소 안내</h2>
        <p className="text-sm text-gray-700 mb-3">
          내 투표소는 본인 주민등록 주소지의 투표구에 따라 지정됩니다. 사전투표는 전국 어디서나
          가능합니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href="https://www.nec.go.kr"
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-white text-primary border border-primary/30 px-4 py-2 rounded-full text-sm font-semibold text-center hover:bg-primary/5"
          >
            중앙선거관리위원회 →
          </a>
          <a
            href="https://si.nec.go.kr"
            target="_blank"
            rel="noreferrer"
            className="flex-1 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold text-center hover:bg-primary/90"
          >
            내 투표소 찾기 →
          </a>
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-3">공약포럼 활용법</h2>
        <ul className="flex flex-col gap-2 text-sm text-gray-700">
          <li>
            🔍 <a href="/search" className="text-primary hover:underline">검색</a> — 관심
            정책·후보·지역 키워드로 한 번에 찾기
          </li>
          <li>
            🏷️ <a href="/categories/경제" className="text-primary hover:underline">분야별</a>{" "}
            — 경제·복지·교육 등 정책 카테고리로 비교
          </li>
          <li>
            ⚖️ <a href="/compare" className="text-primary hover:underline">후보 비교</a> —
            관심 있는 후보를 나란히 놓고 평가
          </li>
          <li>
            🗣️ 공약마다 댓글로 토론하고 👍 투표로 시민 의견 표시
          </li>
        </ul>
      </section>
    </main>
  );
}
