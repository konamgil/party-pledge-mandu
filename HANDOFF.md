# 🥟 Mandu Migration — Session Handoff (2026-05-18)

이 문서는 새 Claude Code 세션이 `D:\workspace\party-pledge-mandu` 에서 시작될 때 컨텍스트 복원용입니다. **첫 작업으로 이 파일을 읽어주세요.**

---

## 프로젝트 정체

- **원본 SPA**: `D:\workspace\party-pledge-sns` (Vite 7 + React 19 + Express, "공약포럼" — 2026 지방선거 공약 Reddit-style SNS, 4개 정당 대상)
- **마이그레이션 타겟 (여기)**: `D:\workspace\party-pledge-mandu` — Mandu fullstack framework로 풀 마이그레이션 진행 중
- **사용자**: Mandu 메인테이너 본인. konamgil@github / oddeye@npm. 한국어 사용.
- **전략**: 옵션 B (풀 마이그레이션), dogfooding 목적

---

## 진행 상황 (Phase 별)

| Phase | 상태 | 비고 |
|---|---|---|
| 0. 환경 검증 | ✅ 완료 | 10개 이슈 (#263~272) 발견·발행·**모두 fix됨** |
| 1. 디자인 토큰 이식 | ✅ 완료 | `app/globals.css` + `app/page.tsx` 검증 페이지 |
| 2. 리소스 정의 + DB 스키마 | ✅ 완료 | 6개 리소스 → 6개 SQLite 테이블 |
| 3. API 슬롯 구현 | 🔴 **여기서 막힘** | `mandu generate api` silent fail. Mandu MCP / skills 활용 필요 |
| 4. 데이터 시드 | ✅ 완료 (Phase 3 이전에 먼저 처리) | 4 parties, 2 users, 22 candidates, 24 pledges |
| 5. 클라이언트 마이그레이션 | ⏸️ 대기 | 원본 SPA의 `Home.tsx` 565줄 → FSD 분해 필요 |
| 6. 미구현 기능 (댓글/검색/auth) | ⏸️ 대기 | |
| 7. 테스트 + 가드 | ⏸️ 대기 | `mandu test:auto` ATE 활용 예정 |
| 8. 배포 | ⏸️ 대기 | 타겟 미정 |

---

## 새 세션이 첫 작업으로 해야 할 것

**Phase 3 (API 슬롯 구현) 재개**. 막힌 지점:

- `app/api/pledges/route.ts` 가 아직 없음. `spec/slots/pledge.slot.ts` 는 자동 생성되어 있으나 라우트에 wire-up 안 됨
- `mandu generate api /api/pledges --methods=GET,POST --ci` 가 **stderr/stdout 없이 exit 1** — silent fail
- 슬롯 파일의 `import contract from "../contracts/pledge.contract"` 가 잘못된 path (실제 contract는 `.mandu/generated/server/contracts/`에 있음)

**우선 살펴볼 스킬들 (이 세션에서 자동 로드됨)**:
1. **`mandu-create-api`** — API 라우트 작성 정확한 가이드
2. **`mandu-fs-routes`** — FS 라우팅 패턴
3. **`mandu-slot`** — 슬롯 비즈니스 로직
4. **`mandu-mcp-create-flow`** — MCP 활용 워크플로

`AGENTS.md` 의 도구 선택 기준 표를 따라 mandu MCP tool / skill 우선 사용.

---

## DB 상태 (즉시 사용 가능)

- **파일**: `D:\workspace\party-pledge-mandu\local.db` (SQLite)
- **연결**: `DATABASE_URL=sqlite://./local.db`
- **테이블**: parties(4) / users(2) / candidates(22) / pledges(24) / votes(0) / comments(0) / __mandu_migrations(1)
- **재시드**: `bunx mandu db seed --env=dev --reset`
- **재마이그레이트**: `bunx mandu db reset --force && bunx mandu db apply`

### 고정 UUID 매핑 (시드에서 사용)

```
parties:    11111111-1111-4000-8000-00000000000{1..4}   (democratic/ppp/rebuilding/reform)
candidates: 22222222-2222-4000-8000-{000000000001..022}  (SPA의 c1~c22 순서)
pledges:    33333333-3333-4000-8000-{000000000001..024}  (SPA의 p1~p24 순서)
users:      44444444-4444-4000-8000-00000000000{1,2}     (admin, test)
```

---

## 알려진 Mandu 버그/회피 (모두 #272까지 fix 완료, 다만 새 마찰점 만나면 일관성 유지)

- `subRegion`, `logoUrl` 같이 `required: false` 인 필드도 DDL emitter가 `NOT NULL` 적용 — seed에서 빈 문자열 제공 필요
- `tags: array` 필드 SQLite binding 안 됨 — seed에서 `JSON.stringify()` 로 감쌈
- 선언적 seed의 `key: "code"` 가 UNIQUE 제약 없으면 동작 안 함 — `key: "id"` (PK) 로 우회
- 모든 `number` → SQLite `REAL` 로 매핑 (정수 컬럼도 REAL — 동작엔 문제 없음)
- FK 컬럼 인덱스 없음 — 성능 최적화 Phase 7 에서 보강 예정
- 슬롯 contract import path 잘못됨 — slot 파일의 `import contract from "../contracts/X.contract"` 가 `.mandu/generated/server/contracts/X.contract.ts` 로 가야 하는데 `spec/contracts/X.contract.ts` 로 해석됨

위 마찰점들은 Phase 5 후반에 일괄 이슈 보고 예정 (메인테이너 본인이라 직접 fix 가능)

---

## 발행한 GitHub 이슈 10건 (모두 fix됨, 참고용)

| # | 핵심 fix |
|---|---|
| 263~265 | `mandu generate resource` 의 filename/subfolder/export shape (cli@0.44.3) |
| 266 | `mandu db plan` silent fail (cli@0.44.3) |
| 267 | tsconfig `*/__generated__/*` invalid pattern (cli@0.44.3) |
| 268 | dev 기본 포트 3000 vs 3333 메시지 불일치 (cli@0.44.3, 이제 3333) |
| 269 | 서브커맨드 `--help` (cli@0.44.3) |
| 270 | `DATABASE_URL=sqlite://` provider 무시 (cli@0.44.3) |
| 271 | `@mandujs/core@0.54.0`의 `fast-glob: catalog:` literal publish — 모든 신규 설치 차단 (core@0.54.1 fix) |
| 272 | #267 fix 후 baseUrl 누락으로 non-relative path 경고 재발 (cli@0.44.4) |

이슈 본문 초안: `D:\workspace\party-pledge-mandu\.issue-drafts\` (10개 .md 파일)

---

## 환경

- OS: Windows 11
- 셸: PowerShell (기본) / Bash (Git Bash via WSL?)
- Bun: 1.3.14
- Node: 22.20.0
- pnpm: 10.4.1 (안 씀)
- 설치된 Mandu 버전: cli@0.44.4 / core@0.54.1 / ate@0.26.0 / edge@0.4.50 / mcp@0.37.1 / skills@0.20.0
- 패키지 매니저: **Bun 전용** (AGENTS.md 가 npm/yarn/pnpm 금지 명시)

---

## 주요 디렉터리 / 파일

```
app/
├── layout.tsx         # Mandu auto-injects html/head/body — body 안 래퍼만
├── page.tsx           # Phase 1 검증 페이지 (정당 컬러 + 폰트 미리보기)
├── globals.css        # Tailwind v4 + 정당 컬러 + MD3 Surface + 폰트 @import
└── api/
    └── health/route.ts  # 유일한 작동 API route. Phase 3에서 pledges/votes/etc 추가 예정

src/
├── client/            # FSD 6 layer (app/entities/features/pages/shared/widgets)
│   └── shared/ui/     # shadcn (Button, Card, Input — 4개만 깔림. 필요시 추가)
├── server/            # Clean Arch 5 layer (api/application/core/domain/infra)
└── shared/            # contracts/types/schema/env/utils/{client,server}

spec/
├── resources/         # 6개 *.resource.ts (party, user, candidate, pledge, vote, comment)
├── slots/             # 6개 *.slot.ts (CRUD 스캐폴드, 비즈니스 로직 비어있음)
├── seeds/             # 4개 *.seed.ts (parties/users/candidates/pledges)
└── db/migrations/     # 0001_auto_*.sql (적용 완료)

.mandu/generated/      # AUTO. 손대지 말 것
├── client/*.client.ts
└── server/{contracts,repos,types}/*.ts

.claude/skills/        # 16개 Mandu Skills (mandu-create-api, mandu-slot, ...)
.mcp.json              # Mandu MCP 자동 등록
AGENTS.md              # 메인테이너 본인 작성 — 도구 우선순위 명시
```

---

## 즉시 시작 가능한 명령어

```bash
bun run dev                    # 개발 서버 (포트 3333, HMR 3334)
                               # 현재 페이지: http://localhost:3333/

bunx mandu info                # 환경/버전 확인
bunx mandu db status           # 마이그레이션 상태
bunx mandu skills:list         # 설치된 Claude skills 목록
bunx mandu mcp                 # MCP 서버 도구 확인

# Phase 3 진행 시도 (silent fail 발생 — skill 참고 필요)
bunx mandu generate api /api/pledges --methods=GET,POST --ci
```

---

## 원본 SPA 데이터 참조

원본 Vite 프로젝트의 데이터 정의는 `D:\workspace\party-pledge-sns\client\src\lib\data.ts` 에 있음. 4개 정당, 22 후보, 24 공약, 17개 광역지역, 동적 직위 탭 로직 (`getPositionTabs`). 검색/필터 함수 (`filterPledges`, `filterCandidates`). Phase 5 클라이언트 마이그레이션 시 함수들 이식 필요.

원본 `Home.tsx` 565줄 — Phase 5 에서 FSD 6 레이어로 분해 예정:
- 헤더 → src/client/widgets/header
- 좌 사이드바 (정당 필터, 분야, 빠른 지역) → src/client/widgets/left-sidebar
- 중앙 피드 (Pledge cards) → src/client/widgets/feed + src/client/entities/pledge
- 우 사이드바 (후보자 랭킹, 인기 공약) → src/client/widgets/right-sidebar
- 모바일 하단 nav → src/client/widgets/mobile-nav
- 투표 / 좋아요 / 필터 → src/client/features/*

---

## 메모리

- `C:\Users\User\.claude\projects\D--workspace-party-pledge-sns\memory\` 에 user_role.md / project_dogfooding.md 저장됨
- 새 세션은 별도 메모리 디렉터리를 가질 것 (`D--workspace-party-pledge-mandu`) — 필요 시 위 내용 복사
