# Vercel 스케줄링 설정 가이드

Vercel에서는 서버리스 함수의 실행 시간이 제한되어 있어, 크롤러와 AI 워커를 직접 스케줄링하기 어렵습니다.

## 추천 방법들:

### 1. GitHub Actions (무료)
- GitHub 저장소에 워크플로우 설정
- 매일 정해진 시간에 크롤러/AI 워커 실행
- 무료로 월 2,000분 제공

### 2. Uptime Robot (무료)
- Vercel API 엔드포인트를 주기적으로 호출
- 5분 간격으로 무료 모니터링
- 간단한 크롤링 트리거로 활용 가능

### 3. Cron-job.org (무료)
- 외부 cron 서비스
- HTTP 요청으로 Vercel API 호출
- 월 1,000회 무료

### 4. Railway/Render (유료)
- 별도 서버에서 크롤러/AI 워커 실행
- 더 안정적이고 제한이 적음

## GitHub Actions 예시:

```yaml
# .github/workflows/crawler.yml
name: Daily Crawler
on:
  schedule:
    - cron: '0 2 * * *'  # 매일 오전 2시
jobs:
  crawl:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Crawler
        run: |
          curl -X POST https://your-vercel-app.vercel.app/api/crawl
```

## Vercel API 엔드포인트 생성:

크롤러와 AI 워커를 API 엔드포인트로 만들어서 외부에서 호출할 수 있도록 설정하는 것을 권장합니다.
