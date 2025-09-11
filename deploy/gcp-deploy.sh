#!/bin/bash

# GCP 배포 스크립트
echo "🚀 Starting GCP deployment..."

# 1. GCP 프로젝트 설정
PROJECT_ID="your-gcp-project-id"
REGION="asia-northeast3"  # 서울 리전
SERVICE_NAME="ads-transparency-mvp"

# 2. gcloud CLI 설치 확인
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI not found. Please install it first."
    echo "Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# 3. 프로젝트 설정
echo "📋 Setting up GCP project..."
gcloud config set project $PROJECT_ID

# 4. 필요한 API 활성화
echo "🔧 Enabling required APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# 5. Docker 이미지 빌드 및 푸시
echo "🐳 Building and pushing Docker image..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$SERVICE_NAME

# 6. Cloud Run에 배포
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --memory=2Gi \
  --cpu=2 \
  --max-instances=10

# 7. 배포 완료
echo "✅ Deployment completed!"
echo "🌐 Service URL:"
gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)"
