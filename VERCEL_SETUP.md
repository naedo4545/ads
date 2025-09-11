# Vercel 환경 변수 설정 가이드

## 🔑 필요한 환경 변수

Vercel 대시보드에서 다음 환경 변수들을 설정해주세요:

### 1. Vercel 대시보드 접속
- https://vercel.com/dashboard 접속
- `ads-olive-five` 프로젝트 선택

### 2. 환경 변수 설정
**Settings** → **Environment Variables**에서 다음 변수들을 추가:

```
NEXT_PUBLIC_SUPABASE_URL=https://rwdzyuufpetnpkaertsk.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3ZHp5dXVmcGV0bnBrYWVydHNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MTIzODEsImV4cCI6MjA3MzA4ODM4MX0.YTQJ4oD3NCgjza2VlE667sXpHsMfkbRFN60QUY26eH0

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ3ZHp5dXVmcGV0bnBrYWVydHNrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzUxMjM4MSwiZXhwIjoyMDczMDg4MzgxfQ.placeholder_service_key

OPENAI_API_KEY=your_openai_api_key_here
```

### 3. 환경 변수 적용
- 각 변수 추가 후 **Save** 클릭
- **Redeploy** 버튼을 클릭하여 새로운 배포 시작

### 4. 배포 확인
- 배포 완료 후 https://ads-olive-five.vercel.app/ 접속
- 검색 기능이 정상 작동하는지 확인

## 📋 현재 상태

✅ **완료된 작업:**
- 메인페이지 UI 수정 (광고 수집 관리 버튼 삭제, 마우스 이모티콘 삭제, 섹션 순서 변경)
- OpenAI API 키 적용
- AI 워커 환경 변수 로딩 수정
- 검색 API 최적화
- Vercel 배포 설정

🔄 **진행 중:**
- Vercel 환경 변수 설정 (수동 작업 필요)

## 🎯 다음 단계

1. Vercel 대시보드에서 환경 변수 설정
2. 재배포 실행
3. 사이트 기능 테스트
4. 필요시 추가 데이터 수집 (크롤러 실행)
