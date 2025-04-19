FROM node:18-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 먼저 복사하고 설치 (캐싱)
COPY package.json package-lock.json* ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 실행 이미지 생성
FROM node:18-alpine

# 타임존 설정
ENV TZ=Asia/Seoul

WORKDIR /app

# 필요한 파일만 복사
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# 포트 설정
EXPOSE 3000

# 애플리케이션 실행
CMD ["npm", "start"] 