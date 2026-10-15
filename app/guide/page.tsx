import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ShoppingBag, Check } from "lucide-react";
import { disclosure } from "@/lib/partners/catalog";
export const metadata = { title: "모아픽 이용안내" };
export default function Guide() {
  return (
    <main className="info-page">
      <Link href="/" className="shop-logo">
        <ShoppingBag size={25} />
        모아픽.
      </Link>
      <Link href="/" className="shop-back">
        <ArrowLeft size={15} /> 쇼핑으로 돌아가기
      </Link>
      <span className="shop-eyebrow">HOW MOAPICK WORKS</span>
      <h1>
        발견은 모아픽에서,
        <br />
        쇼핑은 쿠팡에서.
      </h1>
      <p className="info-lead">
        모아픽은 쿠팡 파트너스의 상품을 모아 소개하는 제휴 쇼핑 사이트입니다.
      </p>
      <section>
        <h2>이렇게 이용하세요</h2>
        <ol>
          <li>카테고리와 검색으로 원하는 상품을 찾아보세요.</li>
          <li>마음에 드는 상품을 눌러 가격과 상품 정보를 확인하세요.</li>
          <li>
            ‘쿠팡에서 가격 확인하기’를 누르면 제휴 링크로 쿠팡에 연결됩니다.
          </li>
          <li>주문·결제·배송·반품은 쿠팡에서 진행합니다.</li>
        </ol>
        <p>
          {disclosure} 제휴 링크 이용으로 구매자에게
          추가 비용이 발생하지 않습니다.
        </p>
      </section>
      <section>
        <h2>가격과 배송 안내</h2>
        <p>
          표시된 가격과 상품 정보는 조회 시점 기준으로, 변경될 수 있습니다.
          찜한 상품의 가격도 저장 당시 정보일 수 있습니다.
          최종 가격·재고·배송비·배송 예정일은 쿠팡에서 확인해 주세요.
        </p>
        <p>
          주문 내역 확인과 취소·교환·반품 문의는 쿠팡에서 진행해 주세요.
        </p>
      </section>
      <section>
        <h2>찜한 상품과 개인정보</h2>
        <p>
          찜 목록은 이 브라우저에만 저장됩니다. 로그인이나 다른 기기와의
          동기화는 제공하지 않습니다. 카드의 하트를 다시 누르거나 브라우저
          사이트 데이터를 지우면 삭제할 수 있습니다.
        </p>
        <Link href="/privacy" className="info-text-link">
          개인정보 처리방침 <ArrowUpRight size={15} />
        </Link>
      </section>
      <section className="info-disclosure">
        <Check size={18} />
        <p>{disclosure}</p>
      </section>
      <Link className="shop-dark-button" href="/">
        상품 둘러보기 <ArrowUpRight size={17} />
      </Link>
    </main>
  );
}
