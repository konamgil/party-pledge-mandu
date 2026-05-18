## Repro

#1, #2, #3 모두 수동 우회 — 즉, `spec/resources/party.resource.ts` 가 정확한 위치·이름·default export 갖춘 상태.

```ts
// spec/resources/party.resource.ts
import { defineResource } from "@mandujs/core";

export default defineResource({
  name: "party",
  fields: {
    name: { type: "string", required: true },
    color: { type: "string", required: true },
  },
  options: {
    description: "Party management API",
    tags: ["party"],
    endpoints: { list: true, get: true, create: true, update: true, delete: true },
  },
});
```

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

`mandu db status --json` 도 모든 배열 비어 있음 — applied 0 / pending 0.

## Expected

applied snapshot 부재 → `diffSnapshots(null, nextSnapshot)` 가 `CREATE TABLE party (...)` 1건 생성해야 함. 새 migration 파일이 `spec/db/migrations/0001_auto_*.sql` 로 emit 되어야 함.

## 코드 경로 추적

- `commands/db/plan.ts:105` `discoverResourceFiles` → 파일 찾음 (else면 "no resources found" 메시지 출력, 안 떴음)
- `commands/db/plan.ts:115` `parseResourceSchemas(files)` → 예외 없음 (예외였으면 "Resource parse failed" 출력)
- `commands/db/plan.ts:125` `snapshotFromResources(parsed)` → 결과 알 수 없음
- `commands/db/plan.ts:156` `diffSnapshots(appliedSnapshot, nextSnapshot)` → 0 changes 반환

→ `snapshotFromResources` 또는 `diffSnapshots` 중 어디선가 silent drop.

가설:
1. `parsed[0].definition.fields` 의 `{ type: "string", required: true }` 형태가 `snapshotFromResources` 에서 인식 안 됨 (예: 다른 키 이름 기대 — `{ type: "text" }` 등)
2. `validateResourceDefinition` 가 통과시키는 형태와 `snapshotFromResources` 가 받는 형태가 어긋남
3. provider 가 항상 "postgres" 인 점 (DATABASE_URL 무시 — 별도 #8로 보고) 도 이 silent fail에 연관 가능

## 검증 필요 / 제안

- `plan.ts` 의 verbose 모드에서 `nextSnapshot.tables` JSON 덤프 추가
- `snapshotFromResources` 에 dropped-field 경고 emit
- field type alias 표 문서화 (`string`, `text`, `varchar` 중 어느 게 canonical?)

환경: `@mandujs/cli@0.44.1`, `@mandujs/core@0.53.3`.
