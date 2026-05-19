/**
 * Root Layout
 *
 * - html/head/body 태그는 Mandu SSR이 자동으로 생성합니다
 * - 여기서는 body 내부의 공통 래퍼만 정의합니다
 * - CSS는 Mandu가 자동으로 주입합니다: /.mandu/client/globals.css
 * - Material Symbols 폰트 로드 직후 fade-in 트리거를 위해 inline script 주입
 */

interface RootLayoutProps {
  children: React.ReactNode;
}

const FONTS_READY_SCRIPT = `
(function () {
  if (typeof document === "undefined" || !document.fonts) return;
  document.fonts.ready.then(function () {
    document.documentElement.classList.add("fonts-loaded");
  });
})();
`;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Google Fonts CDN 핸드셰이크 조기 시작 */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* 폰트 로드 완료 시 html.fonts-loaded 클래스 추가 → 아이콘 fade-in */}
      <script dangerouslySetInnerHTML={{ __html: FONTS_READY_SCRIPT }} />
      {children}
    </div>
  );
}
