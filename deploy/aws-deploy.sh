#!/bin/bash

# AWS 배포 스크립트
echo "🚀 Starting AWS deployment..."

# 1. AWS 설정
AWS_REGION="ap-northeast-2"  # 서울 리전
ECR_REPOSITORY="ads-transparency-mvp"
ECS_CLUSTER="ads-transparency-cluster"
ECS_SERVICE="ads-transparency-service"

# 2. AWS CLI 설치 확인
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install it first."
    echo "Visit: https://aws.amazon.com/cli/"
    exit 1
fi

# 3. ECR 리포지토리 생성
echo "📦 Creating ECR repository..."
aws ecr create-repository --repository-name $ECR_REPOSITORY --region $AWS_REGION || echo "Repository already exists"

# 4. ECR 로그인
echo "🔐 Logging into ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com

# 5. Docker 이미지 빌드 및 푸시
echo "🐳 Building and pushing Docker image..."
ECR_URI=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY

docker build -t $ECR_REPOSITORY .
docker tag $ECR_REPOSITORY:latest $ECR_URI:latest
docker push $ECR_URI:latest

# 6. ECS 클러스터 생성
echo "🏗️ Creating ECS cluster..."
aws ecs create-cluster --cluster-name $ECS_CLUSTER --region $AWS_REGION || echo "Cluster already exists"

# 7. ECS 태스크 정의 생성
echo "📋 Creating ECS task definition..."
cat > task-definition.json << EOF
{
  "family": "$ECR_REPOSITORY",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "$ECR_REPOSITORY",
      "image": "$ECR_URI:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$ECR_REPOSITORY",
          "awslogs-region": "$AWS_REGION",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
EOF

aws ecs register-task-definition --cli-input-json file://task-definition.json --region $AWS_REGION

# 8. 배포 완료
echo "✅ AWS deployment completed!"
echo "🌐 Check your ECS service in the AWS console"
