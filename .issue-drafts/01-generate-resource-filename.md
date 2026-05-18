## Repro

```bash
bunx @mandujs/cli create demo
cd demo
bunx mandu generate resource party --fields="name:string!,color:string!" --ci
```

## Actual

```
✅ Created schema: spec\resources\party\schema.ts

❌ Error: Invalid resource schema file: "...\spec\resources\party\schema.ts".
   Must end with ".resource.ts"
```

generate 단계와 validator/parser 단계가 같은 명령 안에서 충돌. 첫 사용자가 매번 만나는 막다른 길.

## Cause

- `node_modules/@mandujs/cli/src/commands/generate-resource.ts` → 파일명을 `schema.ts` 로 출력
- `node_modules/@mandujs/core/src/resource/parser.ts:44`:

```ts
if (!filePath.endsWith(".resource.ts")) {
  throw new Error(`Invalid resource schema file: "${filePath}". Must end with ".resource.ts"`);
}
```

generator와 parser의 컨벤션이 어긋남.

## Fix

generate-resource 의 출력 파일명을 `<resourceName>.resource.ts` 로 변경.

기존 컨벤션과 일관성:
- `spec/seeds/*.seed.ts`
- `spec/resources/*.resource.ts` (목표)

## 관련 후속

이 버그 우회 후에도 #2(서브폴더 위치)와 #3(export 형태)가 연쇄 발생.
환경: `@mandujs/cli@0.44.1`, Bun 1.3.6, Windows 11.
