# 모아픽 — 쿠팡 파트너스 쇼핑 플랫폼

쿠팡 파트너스 공식 API로 상품을 가져와 소개하고, 본인 계정에 귀속된 제휴 링크를 통해 쿠팡으로 연결하는 Next.js 사이트입니다. 결제·배송·반품은 쿠팡에서 이루어집니다.

## 기능

- 홈 추천 상품, 상품 검색, 카테고리별 최대 100개 추천 요청, 가격 정렬
- 12개씩 상품 더보기, 추가 상품에도 동일한 계정 제휴 링크 적용
- 상품 상세, 쿠팡 제휴 링크 이동, 브라우저별 찜 목록
- 상품 이미지·조회 시점 가격·갱신 시각 표시
- 서버 전용 HMAC 인증, 일반 상품 URL의 파트너스 딥링크 변환
- 상품 목록 1시간 캐시, 매일 한국 시간 오전 9시 Vercel Cron 갱신
- 파트너스 수수료 안내와 개인정보 처리방침
- 키 미설정 시 명확히 구분된 예시 상품. 예시에는 구매 링크가 없습니다.

## Vercel 연결

기존 `naedo4545/ads` GitHub 저장소에 연결된 Vercel 프로젝트를 사용합니다. 별도의 Supabase는 필요 없습니다.

Vercel 프로젝트 **Settings → Environment Variables**에 등록하세요.

| 이름 | 용도 |
| --- | --- |
| `COUPANG_ACCESS_KEY` | 쿠팡 파트너스 Open API Access Key. 필수 |
| `COUPANG_SECRET_KEY` | Secret Key. 필수. Sensitive로 저장 |
| `COUPANG_SUB_ID` | 계정에서 발급/등록한 유효한 추적 ID. 선택 |
| `CRON_SECRET` | 예약 갱신 요청을 인증하는 충분히 긴 임의의 비밀 문자열 |

키를 채팅·GitHub·`NEXT_PUBLIC_` 변수에 넣지 마세요. **Production**에 적용한 뒤 **Deployments → Redeploy**가 필요합니다. 실제 키가 있어도 API 권한, IP 승인, 호출량 제한에 따라 연결이 실패할 수 있습니다.

쿠팡 계정이 호출 IP 등록을 요구하면 서버의 고정 출구 IP가 필요할 수 있습니다. 일반 Vercel 서버리스는 출구 IP가 고정되지 않으므로 계정 정책에 맞는 네트워크나 고정 IP 서버 구성이 필요합니다. 테스트하지 않은 연결을 정상이라고 판단하지 마세요.

## 개발 실행

Node.js 24.19.0, npm 11.9.0에서 검증했습니다.

```bash
cd /workspace/ads
npm ci --cache /workspace/.npm --no-audit --no-fund
NODE_USE_ENV_PROXY=1 npm run dev -- --hostname 0.0.0.0
```

로컬에서 실제 API를 사용하려면 `env.example`에 나열된 변수를 기존 로컬 환경 파일을 덮어쓰지 않고 안전하게 설정하세요. 환경 파일은 커밋하지 마세요.

## 프로덕션 실행

```bash
NODE_USE_ENV_PROXY=1 npm run build
mkdir -p .next/standalone/.next/static
cp -R .next/static/. .next/standalone/.next/static/
HOSTNAME=0.0.0.0 PORT=3100 NODE_USE_ENV_PROXY=1 node .next/standalone/server.js
```

Vercel에서는 Next.js 프레임워크 설정을 사용하면 됩니다.

## 자동 수집의 범위

- 기본 목록은 공식 골드박스 API, 검색은 공식 상품 검색 API, 카테고리는 공식 bestcategories API(최대 100개 요청)를 사용합니다.
- 쿠팡의 전체 상품을 무제한 수집하는 기능은 아닙니다. 더보기는 조회된 목록을 12개씩 표시합니다.
- 일반 상품 URL의 딥링크 변환은 50개씩 나눠 처리합니다. 추가 상품과 상세 이동에도 제휴 링크 및 카테고리 조회 문맥이 유지됩니다.
- 검색은 1회 최대 10개 결과를 요청합니다. 결과 개수는 쿠팡 API 응답에 따릅니다.
- 최초 방문/검색 시 상품을 가져오고, 같은 계정·검색어 결과를 최대 1시간 캐시합니다.
- Vercel Cron이 `/api/cron/products`를 매일 00:00 UTC(한국 09:00)에 호출해 기존 캐시를 무효화하고 기본 추천 상품을 다시 가져옵니다.
- `CRON_SECRET`이 있어야 예약 호출이 인증됩니다. 비밀 값이 없는 호출은 상품을 갱신하지 않습니다.
- 영구 상품 DB나 과거 가격 기록은 저장하지 않습니다. 과거 찜 상품이 최신 추천 목록에서 사라지면 상세 정보를 다시 찾지 못할 수 있습니다.
- 상품 가격·재고·수수료율·인정 조건은 쿠팡 정책 및 실제 주문 시점 정보를 따릅니다. 고정 3% 수익을 보장하지 않습니다.
- 실계정 인증 오류나 API 제한은 예시 데이터로 감추지 않고 화면에 오류와 재시도를 표시합니다.

## 검증

```bash
node --import tsx --test tests/partners.test.ts
npx tsc --noEmit --pretty false
NODE_USE_ENV_PROXY=1 npm run build
# 서버 실행 후, Chromium이 설치된 환경
SITE_TEST_URL=http://127.0.0.1:3100 CHROMIUM_PATH=/usr/bin/chromium node scripts/test-site.cjs
```

단위 테스트는 고정 HMAC 벡터, API 응답 파싱, 계정별 딥링크 변환, 비제휴/악성 링크 차단, 오류 처리를 검증합니다. 외부 API는 모의 응답을 사용하며, 실제 계정·상품·수익 귀속은 키 연결 후 별도로 확인해야 합니다.

이전 광고 아카이브의 공개 API와 화면은 교체했습니다. 기존 크롤러·AI 워커 파일은 이 쇼핑몰 실행에 사용하지 않습니다.

광고 표시는 첫 화면 수수료 안내, 실제 상품 카드의 광고 배지, 상세 구매 주변 및 모바일 구매 바에 제공합니다. 최신 쿠팡 공식 안내는 이번 작업 환경에서 접속 차단으로 직접 재확인하지 못했으며, 법률·정책 적합성 전체를 보증하지 않습니다.

뷰티·여성패션·남성패션·스포츠/레저는 독립 카테고리입니다. 홈에서 분야별 바로가기를 제공합니다. 카테고리 추천 응답이 빈 목록이면 해당 분야의 공식 검색 API를 사용하며, 화면에 검색 상품임을 안내합니다. 인증·네트워크 오류는 예시 상품으로 숨기지 않습니다.
