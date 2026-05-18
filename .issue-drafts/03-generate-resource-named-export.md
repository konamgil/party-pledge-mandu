## Repro

#1, #2 우회 후:

```bash
mv spec/resources/party/party.resource.ts spec/resources/party.resource.ts
bunx mandu db plan --ci
```

## Actual

```
error: Resource parse failed: Failed to parse resource schemas:
  ...\spec\resources\party.resource.ts:
  Error: Failed to import resource schema "...\party.resource.ts":
    Resource schema file "...\party.resource.ts" must export a default ResourceDefinition
```

## Cause

generate-resource 템플릿 출력:

```ts
export const PartyResource = defineResource({ ... });
```

parser는 default export 만 읽음 — `@mandujs/core/src/resource/parser.ts:57`:

```ts
const module = await import(filePath);
definition = module.default;

if (!definition) {
  throw new Error(`Resource schema file "${filePath}" must export a default ResourceDefinition`);
}
```

## Fix

generate-resource 템플릿을 `export default defineResource(...)` 로 변경.

```ts
import { defineResource } from "@mandujs/core";

export default defineResource({
  name: "party",
  fields: { ... },
  options: { ... },
});
```

## Note

#1, #2, #3 은 모두 같은 명령 (`mandu generate resource`) 의 출력이 다른 모듈의 입력 컨벤션과 어긋난 문제. generator와 parser/planner 사이의 통합 테스트가 비어 있는 듯.

`__tests__/generate-resource.test.ts` 가 존재하지만 생성된 파일을 실제 parser로 다시 읽는 round-trip 시나리오를 포함해야 회귀 방지 가능.

환경: `@mandujs/cli@0.44.1`.
