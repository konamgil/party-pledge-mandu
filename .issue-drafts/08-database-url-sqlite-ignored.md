## Repro

```bash
DATABASE_URL="sqlite://./local.db" bunx mandu db plan --json --verbose
```

## Actual

```json
{
  "changeCount": 0,
  "changes": [],
  "migrationPath": null,
  "provider": "postgres"
}
```

`provider` 가 `"postgres"` — DATABASE_URL의 `sqlite://` scheme 무시됨.

또 다른 변형:

```bash
DATABASE_URL="mysql://user:pass@host/db" bunx mandu db plan --json
# → 동일하게 "provider":"postgres"
```

## Cause (추정)

`commands/db/plan.ts:110`:

```ts
emit(options, {
  changes: [],
  migrationPath: null,
  snapshot: emptySnapshot("postgres"),    // ← 하드코딩
  provider: "postgres",                     // ← 하드코딩
}, "no resources found — nothing to plan");
```

위는 `no resources found` 분기지만, 정상 분기에서도 동일하게 postgres 가 default일 가능성. URL scheme → provider 매핑 로직이 없거나 호출되지 않음.

## 영향

mandujs.com / npm description / 마케팅에는:

> Built-in `Bun.SQL` supporting **Postgres, MySQL, SQLite**

라고 명시. 하지만 실제 `db plan`/`db apply` 흐름이 모두 postgres 가정으로 동작하면 SQLite/MySQL 지원은 사실상 미구현.

특히 로컬 개발 환경에서 SQLite 사용은 핵심 DX — Postgres 컨테이너 띄울 필요 없이 즉시 `mandu db apply` 만으로 시작 가능해야 가치 있음. 이게 안 되면:

- 로컬 개발도 Postgres 강제 → Docker 또는 클라우드 의존
- 첫 사용자 onboarding 비용 큼
- Edge runtime 배포 시 SQLite (D1 등) 옵션 막힘

## 검증 / 제안

1. `DATABASE_URL` 파서 (URL → provider) 존재 여부 확인. 없으면 추가:
   - `sqlite://...` → `sqlite`
   - `mysql://...` → `mysql`
   - `postgres://...` / `postgresql://...` → `postgres`
2. `snapshot.provider` 가 URL 파싱 결과를 받도록 수정
3. provider 별 DDL emit (`@mandujs/core/src/resource/ddl/emit.ts`) 가 모든 3종을 지원하는지 검증
4. README/docs 에 "현재 production-ready 인 provider" 명시 (false advertising 회피)

## 관련

#4 (silent no-changes) 와 연관 가능 — provider 가 부정합한 상태에서 snapshot diff 가 0을 반환할 수도.

환경: `@mandujs/cli@0.44.1`, `@mandujs/core@0.53.3`.
