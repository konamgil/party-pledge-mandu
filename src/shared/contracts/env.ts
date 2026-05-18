/**
 * Client/server safe environment variable access.
 *
 * - Mandu bundler 가 client bundle 에 server-only 코드를 포함시킬 때 (F23) browser 에서
 *   `process is not defined` ReferenceError 발생.
 * - 이 helper 는 typeof process 가드로 browser 환경에서 fallback 반환.
 */
export function env(key: string, fallback = ""): string {
  if (typeof process === "undefined" || !process.env) return fallback;
  return process.env[key] ?? fallback;
}
