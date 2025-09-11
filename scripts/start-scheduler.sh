#!/bin/bash

# 스케줄러 시작 스크립트
echo "🚀 Starting ads-transparency scheduler..."

# 1. 로그 디렉토리 생성
mkdir -p logs

# 2. Docker Compose로 스케줄러 시작
echo "📦 Starting Docker Compose scheduler..."
docker-compose -f docker-compose.scheduler.yml --profile scheduler up -d

# 3. 상태 확인
echo "📊 Checking service status..."
docker-compose -f docker-compose.scheduler.yml ps

echo "✅ Scheduler started successfully!"
echo ""
echo "📋 Available commands:"
echo "  - View logs: docker-compose -f docker-compose.scheduler.yml logs -f"
echo "  - Stop scheduler: docker-compose -f docker-compose.scheduler.yml down"
echo "  - Restart scheduler: docker-compose -f docker-compose.scheduler.yml restart"
echo ""
echo "📁 Logs location:"
echo "  - Application: logs/app.log"
echo "  - Crawler: logs/crawler.log"
echo "  - AI Worker: logs/ai-worker.log"
