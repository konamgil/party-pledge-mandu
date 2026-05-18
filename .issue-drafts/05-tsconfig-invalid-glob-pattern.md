## Repro

```bash
bunx @mandujs/cli create demo
cd demo
bunx mandu dev   # 또는 어떤 명령이든
```

## Actual

매 mandu 명령마다 stderr 첫 줄:

```
13 |       "*/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import"]
           ^
warn: Invalid pattern "*/__generated__/*", must have at most one "*" character
   at D:\workspace\party-pledge-mandu\tsconfig.json:13:7
```

## Cause

`templates/default/tsconfig.json:13` 의 paths:

```json
{
  "compilerOptions": {
    "paths": {
      "*/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import"]
    }
  }
}
```

TypeScript `paths` 매핑 사양: **각 패턴에 와일드카드 `*` 1개만** 허용. `*/__generated__/*` 처럼 2개 들어가면 Bun 의 TS 파서가 reject.

## 영향

- 빌드/런타임은 동작하지만 **모든 명령에 경고 노이즈**가 첫 줄에 출력 → CI 로그 가독성 저하, 에이전트가 stderr 첫 줄을 에러로 오해할 가능성
- Mandu의 "에이전트가 코딩해도 아키텍처 안 무너진다" 가치 제안에서 generated 임포트 차단은 핵심 가드. 그런데 이 가드를 켜는 메커니즘 자체가 invalid pattern.

## Fix

선택지 A — 패턴 분리 (layer별):

```json
{
  "paths": {
    "client/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import/*"],
    "server/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import/*"],
    "shared/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import/*"]
  }
}
```

선택지 B — TS paths 대신 oxlint rule 로 이전 (`@mandujs/oxlint-plugin-fsd` 가 이미 있음 → 거기에 추가).

B가 더 깔끔. paths는 alias 용도지 import-blocking 용도가 아님. 의미적으로도 lint 가드가 자연스러움.

환경: `@mandujs/cli@0.44.1`, Bun 1.3.6.
