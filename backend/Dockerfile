FROM golang:1.20-alpine AS builder

# 필요한 패키지 설치
RUN apk update && apk add --no-cache git ca-certificates tzdata && update-ca-certificates

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 먼저 복사하고 다운로드 (캐싱)
COPY go.mod go.sum ./
RUN go mod download

# 소스 코드 복사
COPY . .

# 스웨거 문서 생성
RUN go install github.com/swaggo/swag/cmd/swag@latest
RUN swag init

# 애플리케이션 빌드
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o miniflix .

# 실행 이미지 생성
FROM alpine:latest

# 타임존 설정
RUN apk --no-cache add ca-certificates tzdata
ENV TZ=Asia/Seoul

WORKDIR /root/

# 필요한 디렉토리 생성
RUN mkdir -p ./assets/media ./assets/thumbnails ./config

# 바이너리 복사
COPY --from=builder /app/miniflix .
COPY --from=builder /app/config/config.json ./config/

# 데이터베이스 스크립트 복사
COPY db/ ./db/

# 포트 설정
EXPOSE 8080

# 애플리케이션 실행
CMD ["./miniflix"] 