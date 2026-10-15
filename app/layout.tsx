export const metadata = {
  title: "adlib. — 다음 아이디어를 발견하세요",
  description:
    "좋은 광고를 발견하고, 마음에 드는 크리에이티브를 모으는 나만의 광고 아카이브. 브랜드와 카테고리별 영감을 만나보세요.",
};

import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">{children}</body>
    </html>
  );
}
