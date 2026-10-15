import Link from "next/link";
export const metadata = { title: "개인정보 처리방침 | 모아픽" };
export default function Privacy() {
  return (
    <main className="info-page">
      <Link href="/" className="shop-logo">
        모아픽.
      </Link>
      <Link href="/" className="shop-back">
        ← 쇼핑으로 돌아가기
      </Link>
      <span className="shop-eyebrow">PRIVACY</span>
      <h1>개인정보 처리방침</h1>
      <p className="info-lead">
        모아픽에서 사용하는 데이터와 저장 방식을 안내합니다.
      </p>
      <section>
        <h2>브라우저 저장 정보</h2>
        <p>
          찜한 상품의 이름·가격·이미지 주소·상품 식별자와 조회 키워드를 사용자의
          브라우저 localStorage에 저장합니다. 이 정보는 찜 기능 제공에 사용하며,
          별도 사용자 계정 서버로 보내지 않습니다. 이 사이트는 회원가입,
          이름·전화번호·주소·결제정보 입력을 요구하지 않습니다.
        </p>
      </section>
      <section>
        <h2>검색 및 서비스 요청</h2>
        <p>
          입력한 검색어는 상품 조회를 위해 사이트 서버 및 쿠팡 파트너스 API에
          전달됩니다. 상품 조회 응답은 성능과 API 호출 제한을 위해 서버에 일정
          시간 캐시합니다. 비밀번호, 전화번호, 주소 등 개인정보를 검색어에 넣지
          마세요. 호스팅 사업자가 서비스 제공 및 보안을 위해 접속 IP 등 통신
          기록을 처리할 수 있습니다.
        </p>
      </section>
      <section>
        <h2>쿠팡 이동과 제휴 추적</h2>
        <p>
          쿠팡 이동 버튼은 쿠팡 파트너스 추적 링크로 연결됩니다. 이동 이후의
          개인정보 처리·쿠키·결제·배송은 쿠팡의 정책이 적용됩니다. 모아픽은
          쿠팡에서 이루어진 결제정보를 직접 수집하지 않습니다.
        </p>
      </section>
      <section>
        <h2>삭제 방법</h2>
        <p>
          상품의 하트를 다시 눌러 찜을 해제하거나, 브라우저 설정에서 이 사이트의
          저장 데이터를 삭제하세요. API 검색 캐시는 최대 1시간 단위로
          갱신됩니다.
        </p>
      </section>
      <p>시행일: 2026년 10월 15일</p>
      <Link href="/guide" className="shop-dark-button">
        사이트 이용 안내
      </Link>
    </main>
  );
}
