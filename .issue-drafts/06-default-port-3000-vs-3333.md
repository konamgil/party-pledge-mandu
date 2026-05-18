## Repro

```bash
bunx @mandujs/cli create demo
```

생성 직후 안내:

```
## File structure
- app/page.tsx — http://localhost:3333/
```

이후 dev 실행:

```bash
cd demo
bun run dev
```

## Actual

```
# CLI_E010 — Port 3000 already in use
## How to fix
- Pick a different port on the command line: PORT=3334 bun run dev
```

즉, `mandu dev` 의 **실제 기본 포트는 3000**. create 출력 메시지의 3333 은 사실과 다름.

## 영향 두 가지

1. **메시지/실제 불일치** — 신규 사용자 첫 5분 안에 만나는 인지 충돌.
2. **포트 충돌 빈발** — 3000은 Vite / CRA / Express 예제 / Next.js 등이 광범위하게 쓰는 포트. 다른 프로젝트 dev 서버 켜둔 상태에서 mandu dev = 즉시 충돌.

내 케이스: 같은 워크스페이스에서 Vite 기반 SPA 를 3000 에서 돌리던 중 mandu 프로젝트도 3000 잡으려다 즉시 실패.

## Fix 두 가지 선택지

**선택지 A — 기본 포트를 3333으로 변경**
- create 메시지가 진실이 됨
- 3000 충돌 회피
- mnemonic: `3` × `3` = Mandu의 "Prerender, Island, Guard" 세 기둥... 일 수도

**선택지 B — create 메시지를 3000 으로 정정**
- 변경 폭은 적음
- 충돌 문제는 그대로 남음

**선택지 C — create 시 사용 가능한 포트 자동 탐색 + .env 에 기록**
- vite 의 `strictPort: false` 와 같은 동작
- 사용자별 충돌 없음, 메시지도 정확

A 또는 C 추천. C가 가장 좋은 UX이지만 구현 비용 좀 더 큼.

환경: `@mandujs/cli@0.44.1`.
