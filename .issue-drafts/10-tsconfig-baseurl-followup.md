## Context

#267 fix 후속 — `@mandujs/cli@0.44.3` (오늘 11:12 UTC) 의 template tsconfig는 invalid `*/__generated__/*` 패턴은 정리됐으나, 동시에 **다른 TS spec 위반이 새로 드러남**: paths 값이 non-relative인데 `baseUrl` 이 없음.

## Repro

```bash
mkdir test-new && cd test-new
bunx @mandujs/cli@0.44.3 create demo --json
cd demo
bunx mandu info
```

## Actual

```
13 |       "client/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import/*"],
                                      ^
warn: Non-relative path "__MANDU_BLOCKED__/no-direct-generated-import/*" is not allowed when "baseUrl" is not set (did you forget a leading "./"?)
   at tsconfig.json:13:34

14 |       "server/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import/*"],
   (동일)

15 |       "shared/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import/*"],
   (동일)
```

이전 경고 (`Invalid pattern "*/__generated__/*"`) 1건 → 새 경고 (`Non-relative path ... when baseUrl is not set`) 3건. 노이즈 총량은 오히려 증가.

## Cause

`templates/default/tsconfig.json` 현재 상태:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],                                                       // relative ✅
      "client/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import/*"],  // non-relative ❌
      "server/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import/*"],  // non-relative ❌
      "shared/__generated__/*": ["__MANDU_BLOCKED__/no-direct-generated-import/*"]   // non-relative ❌
    }
    // baseUrl 누락
  }
}
```

TS spec: paths value 가 non-relative 라면 `baseUrl` 이 반드시 설정되어 있어야 함. 또는 path를 `./` 로 시작하는 relative 로 바꿔야 함.

## Fix 두 가지 선택지

**선택지 A — `baseUrl` 추가 (1줄)**:

```json
{
  "compilerOptions": {
    "types": ["bun"],
    "baseUrl": ".",
    "paths": { ... }
  }
}
```

검증됨: 우리 프로젝트에 적용 후 경고 0건.

**선택지 B — path를 relative 로**:

```json
{
  "paths": {
    "client/__generated__/*": ["./__MANDU_BLOCKED__/no-direct-generated-import/*"]
  }
}
```

A가 더 안전. 이유:
- `baseUrl: "."` 은 tsconfig 의 표준 선언. 다른 도구도 모두 인식.
- `./__MANDU_BLOCKED__/...` 는 "실제 파일 시스템에 존재하지 않는 경로를 의도적으로 막는다" 라는 가드 의도가 흐려짐. 절대-블록 의미를 보존하려면 baseUrl 사용이 자연스러움.

## 영구 대응 제안

publish 직전 가드:

```bash
# CI step
node -e '
const cfg = require("./templates/default/tsconfig.json");
const paths = cfg.compilerOptions.paths || {};
const hasNonRelative = Object.values(paths).flat()
  .some(p => !p.startsWith("./") && !p.startsWith("../") && !p.startsWith("/"));
const hasBaseUrl = "baseUrl" in (cfg.compilerOptions || {});
if (hasNonRelative && !hasBaseUrl) {
  console.error("tsconfig: non-relative paths require baseUrl");
  process.exit(1);
}
'
```

또는 새 프로젝트 generate 직후 자동으로 `bunx mandu info` 또는 `mandu check` 한 번 실행해서 첫 stderr 비어있는지 검증.

## 영향

매 mandu 명령마다 stderr 첫 3줄이 경고. CI 로그·터미널 가독성·에이전트 첫 인상 모두 저하. 본질적으로 #267 과 같은 등급의 노이즈.

환경: `@mandujs/cli@0.44.3`, Bun 1.3.14, Windows 11.

## 관련

- #267 (선행 fix, 부분 해결)
