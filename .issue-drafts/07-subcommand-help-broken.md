## Repro

```bash
bunx mandu create --help
bunx mandu db --help
bunx mandu db plan --help
bunx mandu generate --help
bunx mandu generate resource --help
```

## Actual

모두 **메인 help 전체**가 출력됨 (전체 commands 목록 + global options + 동일한 examples). 서브커맨드별 옵션·플래그·예제는 표시되지 않음.

비교:

```bash
bunx mandu db        # (인자 없음) → "mandu db — manage schema migrations" + 서브커맨드 목록 + flags 정상 출력
bunx mandu db --help # → main help fallback
```

즉, **인자 없이 실행**하면 서브커맨드별 도움말이 나오지만, **`--help` 플래그**를 명시하면 main 으로 가버림.

또한:

```bash
bunx mandu generate apply --ci
# → "Usage: bunx mandu generate <resource|page|api|feature|both>"
#   "Unknown subcommand 'apply' for generate."
```

잘못된 subcommand 입력 시에는 generate-context 도움말이 나옴. 즉 라우터는 context 인지 가능. `--help` 플래그 라우팅만 안 됨.

## 영향

`AGENTS.md` 자체가 "도구 선택 기준" 표를 갖고 있고, 에이전트가 막혔을 때 `--help` 로 fallback 권장 흐름이 깔려 있음. 그 fallback이 **모든 서브커맨드에서 무효**.

특히 generate / db / contract / scaffold / mcp 등 옵션이 많은 서브커맨드일수록 타격.

## Fix

CLI 라우터가 `<command>` 다음의 `--help` / `-h` 를 가로채서 해당 서브커맨드의 help renderer를 호출하도록 수정.

각 서브커맨드는 이미 인자 없이 호출 시 자체 help 를 출력할 수 있으니 (위 `mandu db` 예) 그 코드를 재사용 가능.

환경: `@mandujs/cli@0.44.1`.
