## 🚨 Severity: 모든 신규 / 업데이트 설치 차단

`@mandujs/core@0.54.0` (오늘 10:51 UTC publish) 의 npm metadata 가 미해결 `catalog:` 참조를 dependencies 에 포함:

```bash
$ npm view @mandujs/core@0.54.0 dependencies
{
  chokidar: '^5.0.0',
  'fast-glob': 'catalog:',        ← ❌
  glob: '^13.0.0',
  minimatch: '^10.1.1',
  zod: '^3.23.8'
}
```

`catalog:` 는 Bun/pnpm 워크스페이스 catalog 참조 — **publish 시 실제 버전으로 resolve** 되어야 함. literal `catalog:` 로 npm registry 에 올라간 상태.

## Repro

```bash
mkdir test && cd test && bun init -y
bun add @mandujs/core@latest
```

또는:

```bash
bun add @mandujs/cli@latest    # cli@0.44.2 → @mandujs/core@^0.54.0 끌어옴
```

또는 기존 프로젝트에서:

```bash
bunx mandu upgrade
```

## Actual

```
bun add v1.3.14
Resolving dependencies
Resolved, downloaded and extracted [19]
error: fast-glob@catalog: failed to resolve
error: fast-glob@catalog: failed to resolve
```

## 영향 범위

`@mandujs/cli@0.44.2` (오늘 10:58 UTC publish) 도 영향:
- dependencies: `@mandujs/core: ^0.54.0` → 동일 실패
- `bunx @mandujs/cli create demo` 신규 프로젝트 생성 시 cli@latest 가 깔리는데 0.44.2 = 차단

즉, **2026-05-17 10:51 UTC 이후 publish 된 latest 체인 전체가 설치 불가**. dist-tag `latest` 가 0.44.2 / 0.54.0 을 가리키는 한 새 사용자 onboarding 자체가 깨짐.

## 원인 추정

workspace package.json 에는 `"fast-glob": "catalog:"` 로 적혀 있고, Bun catalog 가 root `package.json` 의 `workspaces.catalog` 또는 `catalog` 필드에서 실제 버전을 lookup 함.

publish 파이프라인이 이 resolve 를 거치지 않고 그대로 발행된 것으로 보임. Bun 의 `bun publish` 는 (현재 버전 기준) catalog 자동 resolve 를 안 하는 것으로 알려져 있음.

## 즉시 대응

**선택지 A — 0.54.0 unpublish + 0.54.1 재발행**:
```bash
npm unpublish @mandujs/core@0.54.0
# package.json 에 "fast-glob": "^3.3.2" 등 실버전 박은 뒤
bun publish
```
(unpublish는 24시간 이내만 가능 — 11:51 UTC 전에 처리 필요)

**선택지 B — dist-tag 롤백**:
```bash
npm dist-tag add @mandujs/core@0.53.3 latest
npm dist-tag add @mandujs/cli@0.44.1 latest
```
이러면 신규 설치는 안전한 0.53.3/0.44.1 로 fallback. 그 다음 catalog 문제 fix 후 0.54.1 재발행.

B가 빠르고 덜 위험. unpublish 는 신뢰성 신호가 나쁨.

## 영구 대응 (publish 파이프라인)

1. publish 전 `bun publish --pack` 또는 동등 단계에서 package.json의 catalog 참조를 root catalog 사전에서 lookup → 실버전 치환
2. CI 에 `npm pack && tar -xzOf <name>.tgz package/package.json | jq '.dependencies' | grep -F catalog:` 같은 가드 추가 → 발견 시 publish 차단
3. `oxlint-plugin-fsd` 처럼 자체 lint 룰로 publish 직전 catalog 누수 검사

## 확인된 누수 패키지 (직접)

```bash
$ npm view @mandujs/core@0.54.0 dependencies
{ ..., 'fast-glob': 'catalog:', ... }        # ❌ literal catalog

$ npm view @mandujs/ate@1.0.0 dependencies
{ 'fast-glob': 'catalog:', 'ts-morph': '^26.0.0' }   # ❌ literal catalog (1.0 stable에 누수)
```

## 전이 영향 패키지

```bash
$ npm view @mandujs/cli@0.44.2 dependencies     # core@^0.54.0, ate@^1.0.0
$ npm view @mandujs/mcp@0.37.0 dependencies     # core@^0.54.0, ate@^1.0.0
$ npm view @mandujs/edge@0.4.49 dependencies    # core@^0.54.0
```

즉, **오늘 publish 된 latest 체인 6개 모두** 설치 불가.

`@mandujs/skills@0.20.0` 는 dependencies 가 비어있어 자체는 안전하나, peer/devDeps 확인 권장.

환경: Bun 1.3.14, Windows 11. 영향 1시간 이내, 즉시 대응 권장.
