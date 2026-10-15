import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "모아픽 — 잘 고른 하나가 일상을 바꾸니까",
    template: "%s | 모아픽",
  },
  description:
    "쿠팡 파트너스 상품을 모아 소개하는 취향 쇼핑 공간. 상품을 발견하고 찜하고, 쿠팡에서 편하게 쇼핑하세요.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
