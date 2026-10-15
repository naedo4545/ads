# Google Ads Transparency Center 광고 아카이브 MVP

Google Ads Transparency Center에서 광고 메타데이터를 크롤링하고 AI 분석을 통해 검색 가능한 아카이브를 구축하는 프로젝트입니다.

## 주요 기능

- **광고 크롤링**: Google Ads Transparency Center에서 광고 메타데이터 수집
- **AI 분석**: OCR(이미지), ASR(영상), 텍스트 임베딩, 키워드 생성
- **하이브리드 검색**: Full-text + 벡터 검색 결합
- **현대적 UI**: Next.js 14 + TypeScript + Tailwind CSS

## 기술 스택

- **프론트엔드**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **백엔드**: Supabase (PostgreSQL + pgvector)
- **크롤러**: Playwright (Node.js)
- **AI**: OpenAI, PaddleOCR, Whisper
- **배포**: Docker, Cloud Scheduler

## 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   ```bash
   cp env.example .env.local
   # .env.local 파일에 실제 API 키 입력
   ```

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **크롤러 실행**
   ```bash
   npm run crawl
   ```

5. **AI 분석 워커 실행**
   ```bash
   npm run analyze
   ```

## 프로젝트 구조

```
ads-transparency-mvp/
├── app/                    # Next.js App Router
│   ├── api/               # API 라우트
│   ├── search/            # 검색 페이지
│   ├── detail/            # 상세 페이지
│   └── collection/        # 컬렉션 페이지
├── crawler/               # Playwright 크롤러
├── lib/                   # 유틸리티 함수
├── types/                 # TypeScript 타입 정의
└── prisma/                # 데이터베이스 스키마
```

## 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 서비스 롤 키
- `OPENAI_API_KEY`: OpenAI API 키
- `CRAWLER_DELAY`: 크롤러 지연 시간 (ms)
- `AI_WORKER_BATCH_SIZE`: AI 분석 배치 크기

## 라이선스

MIT License

## adlib 사이트

웹 화면은 외부 DB 없이 사용할 수 있는 예시 크리에이티브 아카이브입니다.
직접 제작한 가상 브랜드 광고 8개를 제공하며, 실제 수집 광고로 표시하지 않습니다.

- `/`: 발견하기, 브랜드·키워드 검색, 카테고리·플랫폼 필터, 정렬
- `/search`: 광고 탐색 (`?q=morrow`와 같은 검색 링크 지원)
- `/detail/stride`: 광고 상세, 북마크 저장
- `/collection`: 이 브라우저에 저장한 개인 컬렉션

컬렉션은 브라우저 localStorage에 저장됩니다. 로그인·기기 간 동기화는 제공하지 않습니다.
기존 Supabase API와 수집/AI 워커는 별도이며, 해당 서비스에는 유효한 DB 연결과 자격 증명이 필요합니다.

### 클라우드 개발 실행

```bash
cd /workspace/ads
npm ci --cache /workspace/.npm --no-audit --no-fund
NODE_USE_ENV_PROXY=1 npm run dev -- --hostname 0.0.0.0
```

### 프로덕션 실행

```bash
NODE_USE_ENV_PROXY=1 npm run build
mkdir -p .next/standalone/.next/static
cp -R .next/static/. .next/standalone/.next/static/
HOSTNAME=0.0.0.0 PORT=3100 NODE_USE_ENV_PROXY=1 node .next/standalone/server.js
```

### 화면 기능 검증

프로덕션 서버 실행 후 시스템 Chromium이 있는 환경에서 실행합니다.

```bash
SITE_TEST_URL=http://127.0.0.1:3100 CHROMIUM_PATH=/usr/bin/chromium node scripts/test-site.cjs
```

홈 화면, 검색·필터·정렬, 저장과 유지·삭제, 상세와 잘못된 ID 처리, 검색 단축키,
모바일 메뉴와 가로 넘침, 브라우저 실행 오류를 검사합니다.
