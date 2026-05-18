# 공약포럼 — 종합기획서

> Mandu fullstack framework dogfooding 으로 진행 중인 "공약포럼(party-pledge-mandu)" 프로젝트의
> 서비스 정체·기술 아키텍처·진행 현황·SEO 전략·후속 로드맵을 한 문서로 정리합니다.
>
> Last updated: 2026-05-18

---

## 0. 한 줄 요약

**"2026 지방선거 4개 정당 후보의 공약을 Reddit-style 피드로 평가·토론하는 SNS"** 를
Mandu 프레임워크로 구현한 dogfooding 프로젝트입니다.
Vite 7 + React 19 SPA(`party-pledge-sns`)에서 Mandu(`party-pledge-mandu`)로 풀 마이그레이션 진행 중이며
**Phase 0 ~ 8 (환경·토큰·리소스·API·시드·클라이언트·미구현기능·테스트·배포준비) 모두 완료**.

---

## 1. 서비스 정체성

### 1.1 미션
시민이 후보자의 공약을 정당/지역/직위별로 한눈에 비교하고, upvote·댓글로 **투명한 정책 경쟁**을 유도한다.

### 1.2 타겟 사용자
- **1차**: 2026 6월 지방선거(광역단체장·기초단체장·광역의원·기초의원) 유권자 — 자신의 지역구 후보 공약을 비교하려는 사람
- **2차**: 정당 정책위·시민사회 — 공약 반응 모니터링
- **3차**: 언론 — 공약 데이터·여론 인용 소스

### 1.3 핵심 콘텐츠
| 도메인 | 시드 카운트 | 비고 |
|---|---|---|
| 정당 | 4 | 더불어민주당 / 국민의힘 / 조국혁신당 / 개혁신당 (코드·컬러·약어·이니셜 포함) |
| 후보 | 22 | 광역단체장 ~ 기초의원 직위까지. 정당별·지역별 분산 |
| 공약 | 24 | 카테고리(경제/복지/교육/환경/안보/문화/주거/노동/행정), 지역, 직위, upvotes/downvotes/comments 포함 |
| 광역지역 | 17 | 서울특별시 ~ 제주특별자치도 |
| 기초지역 | ~200 | 자치구·자치시·자치군 |
| 직위탭 | 동적 생성 | 지역 선택에 따라 광역단체장·기초단체장·광역의원·기초의원 4단계 자동 |

### 1.4 핵심 기능

| 카테고리 | 기능 | 상태 |
|---|---|---|
| **탐색** | 정당 필터 (4정당 + 전체) | ✅ |
| | 지역 dropdown (광역·기초) | ✅ |
| | 카테고리 필터 (10개) | ✅ |
| | 동적 직위 탭 | ✅ |
| | 정렬 (인기/최신/추천순) | ✅ |
| | 텍스트 검색 (헤더) | ✅ client-side |
| **인터랙션** | upvote / downvote | ✅ (client state, 영속화는 votes API 사용 가능) |
| | 댓글 보기·작성 | ✅ API ready, UI 미연동 |
| | 후보 좋아요 | ✅ client state |
| | 공유·저장·신고 | ⏸️ placeholder |
| **인증** | 이메일 로그인 (mock cookie session) | ✅ admin/test 시드 사용 |
| | 회원가입·OAuth | ⏸️ |
| **랭킹** | 후보자 citizenScore 랭킹 | ✅ |
| | 실시간 인기 공약 | ✅ |
| **SEO** | sitemap·meta·JSON-LD | ❌ (섹션 6 참고) |

---

## 2. 기술 아키텍처

### 2.1 런타임 스택
- **언어**: TypeScript 5.x (`@typescript/native-preview`)
- **런타임**: Bun 1.3.14 (네이티브 SQL 어댑터 활용)
- **프레임워크**: Mandu (`@mandujs/core@0.54.1`, `@mandujs/cli@0.44.4`, `@mandujs/mcp@0.37.1`)
- **렌더링**: React 19 + 부분 hydration (island bundle 패턴)
- **스타일**: Tailwind CSS v4 (CSS-first 설정) + shadcn/ui (Button/Card/Input)
- **DB**: SQLite (`sqlite://./local.db`, `@mandujs/core/db` 의 Bun.SQL 래퍼)
- **테스트**: `bun test` (smoke), Playwright via ATE (보류)
- **빌드/배포**: mandu build + adapter (docker / cf-pages / vercel / fly / railway / netlify)

### 2.2 디렉터리 구조

```
party-pledge-mandu/
├── app/                              # FS 라우팅 entry
│   ├── layout.tsx                    # body 내부 wrapper (html/head/body는 Mandu가 자동 주입)
│   ├── page.tsx                      # 홈 — HomeApp client island 마운트
│   ├── globals.css                   # Tailwind v4 + MD3 토큰 + Material Symbols
│   └── api/
│       ├── health/route.ts
│       ├── pledges/route.ts          # 공약 list / create
│       ├── parties/route.ts
│       ├── candidates/route.ts
│       ├── users/route.ts
│       ├── votes/route.ts
│       ├── comments/route.ts         # ?pledgeId= 필터 + DESC
│       └── auth/{login,me,logout}/route.ts  # cookie session
├── src/
│   ├── server/
│   │   └── infra/db.ts               # createDb({ url }) 싱글톤
│   ├── shared/                       # client+server 공유 (현재 비어있음)
│   └── client/                       # FSD 6 layer
│       ├── shared/
│       │   ├── ui/                   # shadcn (button/card/input)
│       │   └── lib/                  # types · data · filters · utils
│       ├── entities/
│       │   ├── pledge/PledgeCard.tsx
│       │   └── candidate/CandidateRankRow.tsx
│       ├── features/                 # (현재 island가 다 흡수)
│       ├── pages/                    # (현재 page.tsx 가 직접 마운트)
│       └── widgets/
│           └── home-app/HomeApp.tsx  # 메인 클라이언트 컴포넌트
├── spec/                             # 스펙 정의 (resource·slot·seed·migration)
│   ├── resources/                    # 6개 *.resource.ts
│   ├── slots/                        # 자동 생성 스캐폴드 (현재 미사용)
│   ├── seeds/                        # 4개 declarative seeds
│   └── db/migrations/                # 1 마이그레이션 적용 완료
├── .mandu/generated/                 # readonly, mandu generate 결과
│   └── server/{contracts,types,repos}/*.ts
├── tests/api/smoke.test.ts           # Phase 3+6 회귀 테스트 (bun test)
├── docs/                             # ← 본 문서
└── AGENTS.md                         # 도구 선택 기준 (MCP/skill 우선)
```

### 2.3 데이터 흐름

```
Browser
   │  (1) GET /  
   ▼
[app/page.tsx]               server component (현재는 "use client" 우회)
   │  
   ▼
[HomeApp]                    React island ("use client")
   │  (2) useEffect → fetch
   ▼
[app/api/{resource}/route.ts]
   │  (3) Mandu.filling chain
   ▼
[createXxxRepo(db).findMany()]
   │  (4) tagged-template SQL
   ▼
[SQLite local.db]
```

**현재 우회 (F1)**: 단계 (2) 가 client-side fetch. SSR HTML 에 데이터 없음 → SEO 차단.
**목표**: (1) 단계에서 직접 fetch 호출하여 SSR HTML 에 데이터 inject.

### 2.4 정당 → 후보 → 공약 관계

```
party (4)
  ├── democratic (UUID ...0001)
  ├── ppp        (UUID ...0002)
  ├── rebuilding (UUID ...0003)
  └── reform     (UUID ...0004)

candidate (22)  ── partyId FK → party
  ├── 서울시장 후보 (홍길동/김철수/이영희/박지민)
  ├── 강남구청장 후보 (최민수/정수진/한미영)
  ├── ...

pledge (24)     ── partyId FK → party, candidateId FK → candidate
  ├── 기본소득 월 30만원 (홍길동, 서울시장)
  ├── 법인세 인하 (김철수, 서울시장)
  └── ...

vote (0)        ── userId × pledgeId → direction(1/-1)
comment (0)     ── userId, pledgeId, body, createdAt
user (2)        ── admin@lamysolution.com / test@example.com
```

고정 UUID 매핑 (시드 재현성):
```
parties:    11111111-1111-4000-8000-00000000000{1..4}
candidates: 22222222-2222-4000-8000-{000000000001..022}
pledges:    33333333-3333-4000-8000-{000000000001..024}
users:      44444444-4444-4000-8000-00000000000{1,2}
```

---

## 3. Phase 진행 현황 (2026-05-18)

| Phase | 결과 | 검증 |
|---|---|---|
| **0** 환경 | ✅ Mandu 이슈 #263 ~ #272 fix (메인테이너 본인 push) | `mandu info` / `mandu db status` |
| **1** 디자인 토큰 | ✅ `globals.css` — 정당 컬러 4종 + MD3 surface 5단계 + Material Symbols | Phase 1 검증 페이지 (구 `page.tsx`) |
| **2** 리소스 정의 | ✅ 6 resource → 6 SQLite 테이블 | `mandu db apply` |
| **3** API 라우트 | ✅ 6 라우트 + health (`Mandu.filling`) | smoke test 시드 카운트 100% 일치 |
| **4** 시드 | ✅ 4 parties / 2 users / 22 candidates / 24 pledges | `bunx mandu db seed --env=dev --reset` |
| **5** 클라이언트 | ✅ Home.tsx 565줄 → FSD 분해 (entities·widgets·shared/lib). 1 island bundle (29.3 KB / 7.5 KB gzip). | dev `GET /` 200, hydration runtime 정상 |
| **6** 미구현 기능 | ✅ comments `?pledgeId=` 필터 + DESC, auth mock (login/me/logout cookie session) | `bun test` 10/10 pass |
| **7** 테스트 | ✅ `bun test tests/api/smoke.test.ts` 10/10 pass / 322ms (ATE는 F11 timeout → smoke로 대체) | guard_check pass |
| **8** 배포 준비 | ✅ `deploy_check` ready, `build` ok, `deploy_preview --target=docker` exit 0 | — |

총 라우트: 1 page + 10 API + 1 island bundle.

---

## 4. dogfooding finding (12건, mandu issue [#273](https://github.com/konamgil/mandu/issues/273))

| ID | 분류 | 요약 | 영향 |
|---|---|---|---|
| **F1** | Critical | `app/page.tsx` 에서 `@/server/*` import 차단 → SSR data fetch 경로 부재 | SEO 최대 차단점 |
| F2 | Docs | `mandu-hydration` skill 의 `island("visible", Component)` 표기 오류 | API 사용법 혼란 |
| F3 | Docs | island vs partial 차이 미명시 (inline 사용 불가) | partial 시도 시 마커 누락 |
| F4 | Docs | slot generator 주석 `Pattern: /api/partys` pluralization 오류 | 가독성 |
| F5 | Bug | dev 기본 포트 3000 regression (#268 fix 이후) | `PORT=3333 bun run dev` 우회 |
| F6 | Bug | HMR이 route dispatch table 갱신 안 함 (cold restart 필요) | DX 저하 |
| F7 | Bug | `mandu generate api` silent fail (기존 보고) | 라우트 직접 작성 우회 |
| F8 | DX | `react-refresh` peerDep 미설치 시 친절한 가이드 없음 | 자동 install hint 필요 |
| F9 | Bug | `mandu_kitchen_errors` MCP 의 hardcoded port 3333 | 진단 불가 |
| F10 | Bug | `ctx.error(status, msg)` 가 status 인자 무시하고 400 반환 | 명시적 `Response` 우회 |
| F11 | Bug | `mandu_ate_auto_pipeline` Playwright run 10분 timeout | `bun test` smoke 로 대체 |
| F12 | Bug | `mandu_deploy_plan` heuristic 이 sqlite 의존 API 를 edge 로 오인 | apply 전 수동 검수 필요 |

**메인테이너 본인이 fix 대상** — Phase 9 이후 일괄 처리 예정.

---

## 5. SEO 전략 (Phase 9 — 현재 최우선)

### 5.1 목표

| 키워드 카테고리 | 노출 타겟 | 현재 상태 |
|---|---|---|
| 인물 검색 — "홍길동 서울시장 공약" | 후보 상세 페이지 | ❌ 페이지 부재 |
| 정책 검색 — "기본소득 30만원" | 공약 상세 페이지 | ❌ 페이지 부재 |
| 지역 검색 — "강남구 공약" | 지역 페이지 | ❌ 페이지 부재 |
| 정당 검색 — "민주당 서울 공약" | 정당 페이지 | ❌ 페이지 부재 |
| 브랜드 — "공약포럼" | 홈 (`/`) | ❌ SSR 빈 HTML |

### 5.2 차단 요소

1. **데이터가 SSR HTML 에 없음** — `app/page.tsx` 가 `"use client"` 단일 island. Googlebot이 받는 HTML 에 공약 제목·후보 이름 0개. 키워드 매칭 자체가 불가.
2. **개별 URL 부재** — 모든 콘텐츠가 `/` 단일 페이지의 client filter. `/pledges/[id]`, `/candidates/[id]` 같은 indexable URL 0개.
3. **메타데이터 부재** — `<title>`, `<meta description>`, OG 태그, `sitemap.xml`, `robots.txt`, JSON-LD 다 미설정.

### 5.3 Phase 9 — SSR 복귀 (A)

#### 작업
- `app/page.tsx` 에서 `"use client"` 제거 → `async function HomePage()`
- internal fetch 사용 (Guard 룰은 `import` 만 검사하므로 fetch 호출은 통과):
  ```typescript
  const [parties, candidates, pledges] = await Promise.all([
    fetch(`${process.env.MANDU_INTERNAL_URL ?? "http://localhost:3333"}/api/parties?limit=100`).then(r => r.json()),
    fetch(`${process.env.MANDU_INTERNAL_URL ?? "http://localhost:3333"}/api/candidates?limit=100`).then(r => r.json()),
    fetch(`${process.env.MANDU_INTERNAL_URL ?? "http://localhost:3333"}/api/pledges?limit=100`).then(r => r.json()),
  ]);
  return <HomeApp initialParties={parties.data} initialCandidates={candidates.data} initialPledges={pledges.data} />;
  ```
- `HomeApp.tsx` 파일 1번째 줄에 `"use client"` 디렉티브 추가, props 받는 시그니처로 복원, useEffect fetch 제거

#### 리스크
- Mandu가 server page에서 client component 에 props 전달 시 직렬화 메커니즘 제공하는지 미검증. 작동 안 하면 partial/slot 패턴 재시도.

#### F1 정식 fix 후 (메인테이너 작업)
- internal fetch 대신 `import { db } from "@/server/infra/db"` + `createXxxRepo(db).findMany()` 직접 호출. TCP round-trip 제거, 동일 프로세스 메모리 호출로 더 빠름.

### 5.4 Phase 9 — 개별 라우트 추가 (B)

추가할 라우트:

```
app/
├── pledges/
│   └── [id]/page.tsx         ← 공약 상세
├── candidates/
│   └── [id]/page.tsx         ← 후보 상세 (해당 후보의 공약 list 포함)
├── parties/
│   └── [code]/page.tsx       ← 정당 페이지 (정당 소개 + 소속 후보 + 공약 모음)
└── regions/
    ├── [region]/
    │   ├── page.tsx          ← 광역지역 (서울/경기/...)
    │   └── [subRegion]/
    │       └── page.tsx      ← 기초지역 (강남구/수원시/...)
```

각 페이지 패턴:
1. server component (`async function PageName({ params })`)
2. `params.id` 등으로 internal fetch (`/api/pledges/${id}` — 추가 필요한 API)
3. `useSeoMeta({ title, description, ogImage })` — 동적 메타
4. JSX 렌더 (정적 콘텐츠 — 댓글·투표는 island 분리)

**필요한 신규 API** (현재 list/create 만 있음):
- `GET /api/pledges/[id]` — 개별 공약 조회
- `GET /api/candidates/[id]` — 개별 후보 + 그 후보의 공약 list
- `GET /api/parties/[code]` — code 기반 정당 조회 + 소속 후보·공약 모음

### 5.5 Phase 9 — SEO 도구 활용 (C)

mandu MCP 도구 활용:

| 도구 | 목적 | 출력 |
|---|---|---|
| `mandu_seo_sitemap` | sitemap.xml 자동 생성 | `app/sitemap.xml/route.ts` 또는 정적 파일 |
| `mandu_seo_robots` | robots.txt | `app/robots.txt/route.ts` |
| `mandu_seo_jsonld` | structured data 생성 | 각 페이지에 `<script type="application/ld+json">` 주입 |
| `mandu_seo_analyze` | title/meta 누락 점검 | 리포트 |
| `mandu_seo_preview` | Google Rich Result preview | 미리보기 |
| `mandu_seo_write` | meta 일괄 작성 | 페이지별 useSeoMeta 코드 |

**JSON-LD 스키마 매핑**:
- 공약 → `schema:Article` (헤드라인, 게시일, 저자, body)
- 후보 → `schema:Person` (이름, 직책, 소속정당, image)
- 정당 → `schema:Organization` (로고, 설명, 소속 인물 list)
- 사이트 → `schema:WebSite` (검색 기능 — sitelinks search box)

**메타 패턴**:
```typescript
// app/pledges/[id]/page.tsx
import { useSeoMeta } from "@mandujs/core/client";
// SSR 시 head 주입
useSeoMeta({
  title: `${pledge.title} — ${pledge.candidateName} | 공약포럼`,
  description: pledge.summary.slice(0, 160),
  ogTitle: pledge.title,
  ogDescription: pledge.summary.slice(0, 200),
  ogType: "article",
  twitterCard: "summary_large_image",
});
```

### 5.6 예상 효과

SSR 복귀 + 라우트 50+ 추가 + sitemap 등록 후:
- Googlebot 인덱싱 가능 URL: 1 → **~70개** (공약 24 + 후보 22 + 정당 4 + 광역 17 + 기초 ~200 일부)
- 검색 매칭 키워드: 0 → 후보 이름·공약 제목·정당명·지역명·카테고리 다 매칭
- Rich result 노출: 공약 카드, 인물 카드, 사이트 검색 박스

---

## 6. 후속 로드맵

### Phase 9 — SEO (위 섹션 5)

| 단계 | 작업 | 추정 |
|---|---|---|
| A | SSR 복귀 (page.tsx server + fetch + HomeApp props) | 30분 |
| B | 개별 라우트 5종 + 신규 API 3종 | 60분 |
| C | sitemap·robots·JSON-LD·useSeoMeta | 30분 |

### Phase 10 — UX·기능 완성

- 댓글 UI (모달 또는 상세 페이지 inline)
- 투표 영속화 (POST /api/votes — 현재 client state 만)
- 후보 좋아요 영속화
- 회원가입 (admin/test 시드 외 일반 사용자)
- OAuth (카카오·네이버)
- 알림 시스템 (placeholder 해소)
- 공약 제안 폼

### Phase 11 — 성능·운영

- FK 인덱스 (HANDOFF 명시한 마찰점)
- 이미지 자산 (`logoUrl`) Mandu Image 컴포넌트 활용
- ISR / 캐싱 — `mandu_runtime_config` 의 cache 옵션
- Kitchen DevTools 활용 (메모리, slow query)
- ATE auto-pipeline 재시도 (F11 fix 후)

### Phase 12 — 배포

- 타겟 결정 (현재 미정): Cloudflare Pages / Vercel / Fly / Bun on VPS 후보
- DB 분리 (SQLite → Postgres on prod) — `DATABASE_URL` 변경만으로 가능
- 환경변수 관리 (.env 정식 작성)
- CI/CD (현재 `.github/workflows` 비어있음)

---

## 7. 의사결정 메모

| 결정사항 | 선택 | 근거 |
|---|---|---|
| 패키지 매니저 | Bun 전용 | AGENTS.md 명시, Mandu Bun.SQL 의존 |
| 마이그레이션 전략 | 옵션 B (풀 마이그레이션) | dogfooding 목적 |
| 클라이언트 상태 | 단일 큰 island (HomeApp) | 세분 island 의 상태 공유 mandu 패턴 부재 |
| DB 어댑터 | SQLite | 시드/검증 용이, Postgres 전환은 Phase 12 |
| 인증 방식 | mock cookie session | password-less, 데모 목적. 정식 auth 는 Phase 10 |
| 테스트 | `bun test` smoke | ATE Playwright 는 F11 timeout |
| 배포 타겟 | 미정 (docker preview 까지만) | 메인테이너 결정 영역 |
| F1 우회 | client-side fetch (현재) → internal fetch (Phase 9-A) → 직접 import (F1 fix 후) | 3단계 점진적 개선 |

---

## 8. 참고 문서

- `D:\workspace\party-pledge-mandu\HANDOFF.md` — 세션 핸드오프 문서 (Phase 0~3 진행 시점 기준)
- `D:\workspace\party-pledge-mandu\AGENTS.md` — 도구 선택 기준 (MCP/skill 우선)
- 원본 SPA: `D:\workspace\party-pledge-sns\client\src\` (Vite + React 19)
- konamgil/mandu issue [#273](https://github.com/konamgil/mandu/issues/273) — dogfooding finding 12건
- 메모리 — `C:\Users\User\.claude\projects\D--workspace-party-pledge-mandu\memory\`
  - `user_role.md` — 사용자(메인테이너) 정체
  - `project_status.md` — 진행 상황 스냅샷
  - `mandu_conventions.md` — Mandu 작업 규칙

---

## 9. Glossary

| 용어 | 정의 |
|---|---|
| **Filling** | Mandu의 핸들러 체인 API (`Mandu.filling().get().post()`) |
| **Island** | 페이지 단위 client bundle. inline JSX 불가 (`partial` 사용) |
| **Partial** | 페이지 내 inline client region. `partial({ component })` → `.Render` 사용 |
| **Slot** | 서버 데이터 로더 (`spec/slots/*.slot.ts`). 현재 placeholder만 존재 |
| **Repo factory** | `.mandu/generated/server/repos/*.repo.ts` 의 `createXxxRepo(db)` |
| **FSD** | Feature-Sliced Design (`src/client/{app,entities,features,pages,shared,widgets}`) |
| **Clean Arch** | `src/server/{api,application,core,domain,infra}` 5 layer |
| **Guard** | Mandu의 import/layer 룰 런타임 검증 (`mandu_guard_check`) |
| **ATE** | Auto Test Engine — Playwright 기반 자동 E2E (`mandu_ate_*`) |
| **MD3** | Material Design 3 surface system (5단계 container) |
| **직위 탭** | 지역 선택에 따라 광역단체장·기초단체장·광역의원·기초의원 자동 생성 |

---

> 이 문서는 mandu_docs_search 로 검색 가능합니다 (`docs/PLAN.md` slug).
