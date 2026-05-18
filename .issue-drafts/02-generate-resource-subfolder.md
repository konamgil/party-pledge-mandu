## Repro

#1 우회 후:

```bash
# (위 generate가 만든 schema.ts 를 *.resource.ts 로 rename)
mv spec/resources/party/schema.ts spec/resources/party/party.resource.ts
bunx mandu db plan --ci
```

## Actual

```
db plan: no resources found — nothing to plan
```

## Cause

- generate-resource 가 `spec/resources/<resourceName>/...` **서브폴더**에 생성
- `node_modules/@mandujs/cli/src/commands/db/plan.ts:204`:

```ts
const glob = new Glob("*.resource.ts");
```

→ resourcesDir **직속**만 스캔, 서브폴더 무시.

## Fix

선택지 A — planner 변경:

```ts
const glob = new Glob("**/*.resource.ts");
```

선택지 B — generator 변경: `spec/resources/<resourceName>.resource.ts` 평탄 출력.

B를 추천. 이유:
- seed 컨벤션과 일관 (`spec/seeds/*.seed.ts`)
- 한 리소스에 부수 파일이 늘어나기 전까지는 평탄 구조가 더 가벼움
- 관련 산출물(migrations, contracts, slots)은 이미 별도 디렉터리에 분리되어 있음

환경: `@mandujs/cli@0.44.1`.
