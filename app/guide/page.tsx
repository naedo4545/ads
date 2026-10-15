import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ShoppingBag, Check } from "lucide-react";
import { disclosure } from "@/lib/partners/catalog";
export const metadata = { title: "모아픽 이용 및 파트너스 연결 안내" };
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
          {disclosure} 구매자에게 추가 비용은 발생하지 않습니다. 수수료와 인정
          조건은 쿠팡 파트너스의 정책을 따릅니다.
        </p>
      </section>
      <section>
        <h2>운영자: 실제 상품 연결하기</h2>
        <p>
          Vercel의 이 프로젝트에서{" "}
          <strong>Settings → Environment Variables</strong>에 아래 항목을 등록한
          뒤 새로 배포하세요. 키 값은 채팅이나 GitHub에 올리지 마세요.
        </p>
        <dl className="setup-variables">
          <div>
            <dt>COUPANG_ACCESS_KEY</dt>
            <dd>파트너스 Open API에서 발급한 Access Key</dd>
          </div>
          <div>
            <dt>COUPANG_SECRET_KEY</dt>
            <dd>같이 발급한 Secret Key. Vercel에서 Sensitive로 저장</dd>
          </div>
          <div>
            <dt>COUPANG_SUB_ID</dt>
            <dd>선택 사항. 본인 계정의 유효한 추적 ID</dd>
          </div>
          <div>
            <dt>CRON_SECRET</dt>
            <dd>일일 갱신 요청을 보호하는 충분히 긴 임의의 비밀 문자열</dd>
          </div>
        </dl>
        <p>
          Production에 적용하고 Deployments에서 Redeploy하세요. API 키 두 개가
          등록되면 예시 상품 대신 공식 API 상품이 표시됩니다. 본인 계정으로
          인증해 받은 제휴 링크만 구매 버튼에 사용합니다.
        </p>
        <p>
          쿠팡 파트너스 API에서 호출 IP 등록을 요구하는 경우, 배포 서버의 고정
          출구 IP가 필요할 수 있습니다. 일반 Vercel 서버리스의 IP는 고정이
          아니므로, 계정 정책에 맞는 고정 IP 실행 환경이나 지원되는 네트워크
          구성이 필요합니다. 키가 있어도 IP 승인이 안 되면 실제 연결은 실패할 수
          있습니다.
        </p>
      </section>
      <section>
        <h2>자동 상품 수집과 갱신</h2>
        <ul>
          <li>첫 방문 시 공식 API의 골드박스 상품을 가져옵니다.</li>
          <li>
            상품 검색은 공식 검색 API를 사용하고, 카테고리는 공식 카테고리 추천
            API에서 최대 100개를 요청합니다.
          </li>
          <li>
            화면에서는 12개씩 표시하고 상품 더보기를 누르면 현재 목록을 끝까지
            확인할 수 있습니다. 결과는 최대 1시간 캐시해 호출량을 줄입니다. API
            호출 제한이 적용될 수 있습니다.
          </li>
          <li>
            Vercel Cron이 매일 한국 시간 오전 9시에 캐시를 갱신하고 기본 추천
            목록을 다시 가져옵니다.
          </li>
          <li>
            CRON_SECRET과 배포된 Cron 설정이 있어야 예약 갱신이 작동합니다.
          </li>
        </ul>
        <p>
          사이트에서 표시한 가격과 재고는 조회 시점 정보입니다. 실제 주문 조건은
          쿠팡에서 최종 확인해 주세요. 상품 목록은 최신 API 결과를 표시하며 영구
          상품 DB를 따로 쌓지는 않습니다.
        </p>
      </section>
      <section>
        <h2>광고 · 제휴 관계 표시</h2>
        <p>{disclosure}</p>
        <p>
          상품 목록을 보기 전과 각 상품 상세의 구매 버튼 주변에 위 안내를
          표시하고, 실제 상품 카드에도 ‘광고’를 표시합니다. 구매 링크에는
          sponsored 관계 속성을 적용합니다. 단축 주소나 쿠팡 로고만으로 수수료
          관계를 대신 설명하지 않습니다.
        </p>
        <p>
          ‘최저가’, ‘판매 1위’, 임박한 품절이나 할인율처럼 확인되지 않은 표현은
          사용하지 않습니다. 가격·배송·재고는 쿠팡에서 최종 확인해 주세요.
        </p>
        <p>
          이 표기는 모든 법률·정책 준수를 보증하는 법률 검토를 대신하지
          않습니다. 운영자는 쿠팡 파트너스의 최신 운영정책 및 관련 표시·광고
          기준을 확인해야 합니다.
        </p>
        <a
          className="info-text-link"
          href="https://partners.coupang.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          쿠팡 파트너스 공식 운영정책 확인 <ArrowUpRight size={15} />
        </a>
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
