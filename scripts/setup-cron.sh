#!/bin/bash

# Cron 스케줄러 설정 스크립트
echo "⏰ Setting up cron scheduler..."

# 프로젝트 경로
PROJECT_PATH="/Users/rawstudio01/Desktop/개발/[광고찾기]/ads-transparency-mvp"

# 1. 크롤러 스케줄 (매일 오전 2시)
CRON_CRAWLER="0 2 * * * cd $PROJECT_PATH && npm run crawl:facebook >> logs/crawler.log 2>&1"

# 2. AI 워커 스케줄 (매일 오전 3시)
CRON_AI_WORKER="0 3 * * * cd $PROJECT_PATH && npm run analyze >> logs/ai-worker.log 2>&1"

# 3. 로그 디렉토리 생성
mkdir -p logs

# 4. 기존 cron 작업 백업
crontab -l > crontab_backup.txt 2>/dev/null || echo "No existing crontab found"

# 5. 새로운 cron 작업 추가
(crontab -l 2>/dev/null; echo "$CRON_CRAWLER"; echo "$CRON_AI_WORKER") | crontab -

echo "✅ Cron scheduler setup completed!"
echo "📋 Scheduled tasks:"
echo "  - Crawler: Daily at 2:00 AM"
echo "  - AI Worker: Daily at 3:00 AM"
echo ""
echo "📁 Logs will be saved to:"
echo "  - logs/crawler.log"
echo "  - logs/ai-worker.log"
echo ""
echo "🔍 To view current cron jobs: crontab -l"
echo "🗑️ To remove cron jobs: crontab -r"
