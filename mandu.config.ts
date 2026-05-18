/**
 * Mandu 프로젝트 설정.
 *
 * - server.port 명시: 3333 이 외부 node 프로세스로 점유되어 있어, 안정성을 위해 4000 으로 고정.
 *   재현 가능한 dev 환경 보장 — 매번 fallback 으로 다른 포트 잡히는 문제 회피.
 */
export default {
  server: {
    port: 5000,
  },
};
