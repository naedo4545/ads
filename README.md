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
