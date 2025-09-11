#!/bin/bash

# Vercel 배포 스크립트
echo "🚀 Starting Vercel deployment..."

# 1. Vercel CLI 설치 확인
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# 2. Vercel 로그인 확인
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# 3. 환경 변수 설정 확인
echo "📋 Checking environment variables..."
echo "Make sure you have set the following in Vercel dashboard:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - OPENAI_API_KEY"
echo ""

# 4. 프로덕션 빌드 테스트
echo "🔨 Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# 5. Vercel에 배포
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Vercel deployment completed!"
echo "🌐 Your app is now live on Vercel!"
