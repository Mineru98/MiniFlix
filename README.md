# MiniFlix

넷플릭스의 핵심 기능을 간소화하여 구현한 웹 기반 스트리밍 서비스입니다.

## 프로젝트 개요

- **서비스명**: MiniFlix
- **서비스 유형**: 웹 기반 스트리밍 서비스
- **목적**: 학습 목적으로 넷플릭스의 핵심 기능을 간소화하여 영화/영상 스트리밍 서비스를 구현.

## 핵심 기능

- 콘텐츠 스트리밍 (로그인한 사용자)
- 콘텐츠 탐색 (검색, 장르별 필터링)
- 회원가입/로그인 기능
- 찜 목록 관리
- 반응형 디자인 (모바일 및 PC 지원)

## 기술 스택

### 프론트엔드
- TypeScript
- React
- Next.js
- Zustand (상태 관리)
- React Query (데이터 페칭)
- TailwindCSS (스타일링)
- Lucide React (아이콘)

### 백엔드
- TypeScript
- Node.js
- Express
- TSOA (API 문서화)
- MySQL2 (데이터베이스)
- Redis (세션 및 캐싱)
- Passport + JWT (인증)
- Multer + Fluent-FFmpeg (미디어 처리)
- Bull (작업 큐)

### 데이터베이스
- MySQL
- Redis

## 프로젝트 구조

```
miniflix/
├── packages/
│   ├── frontend/       # 프론트엔드 애플리케이션 (Next.js)
│   ├── backend/        # 백엔드 API 서버 (Express)
│   ├── common/         # 공통 유틸리티 및 헬퍼 함수
│   └── types/          # 공유 TypeScript 인터페이스 및 타입
├── docker/             # Docker 관련 설정 파일
│   ├── frontend/       # 프론트엔드 Docker 설정
│   ├── backend/        # 백엔드 Docker 설정
│   └── mysql/          # MySQL 초기화 스크립트
└── docker-compose.yml  # 서비스 구성 파일
```

## 시작하기

### 개발 환경

1. 저장소 클론
```bash
git clone https://github.com/your-username/miniflix.git
cd miniflix
```

2. 의존성 설치
```bash
npm install
```

3. 개발 서버 실행
```bash
npm run dev
```

### Docker를 이용한 배포

1. Docker Compose로 애플리케이션 실행
```bash
docker-compose up -d
```

2. 사용 가능한 서비스
   - 프론트엔드: http://localhost:3000
   - 백엔드 API: http://localhost:8000

## 기본 계정

테스트 계정이 초기 설정에 포함되어 있습니다:
- 이메일: test@example.com
- 비밀번호: password123

## 라이센스

이 프로젝트는 [MIT 라이센스](LICENSE)를 따릅니다. 