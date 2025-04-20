# MiniFlix

MiniFlix는 Next.js 기반의 비디오 스트리밍 서비스 프론트엔드로, 클린 아키텍처 패턴을 따릅니다.

## 목차

1. [개요](#개요)
2. [기술 스택](#기술-스택)
3. [아키텍처 구조](#아키텍처-구조)
4. [주요 설계 원칙](#주요-설계-원칙)
5. [API 통신 패턴](#api-통신-패턴)
6. [개발 가이드라인](#개발-가이드라인)
7. [개발 환경 설정](#개발-환경-설정)

## 개요

MiniFlix는 영화와 시리즈를 제공하는 스트리밍 서비스로, 사용자가 콘텐츠를 검색하고, 시청하고, 찜목록에 추가하고, 시청 기록을 관리할 수 있는 기능을 제공합니다.

## 기술 스택

- **프레임워크**: Next.js 13.5.4
- **상태 관리**: 
  - Zustand: 클라이언트 상태 관리
  - React Query(TanStack Query): 서버 상태 관리
- **스타일링**: 
  - Tailwind CSS
  - Styled Components
- **HTTP 클라이언트**: Axios
- **인증**: NextAuth
- **폼 관리**: React Hook Form
- **미디어 재생**: React Player
- **유틸리티**:
  - clsx/tailwind-merge: 클래스 병합 도구
  - path-to-regexp: 경로 매칭
  - qs: 쿼리 문자열 파싱

## 아키텍처 구조

MiniFlix는 클린 아키텍처 패턴을 기반으로 설계되었으며, 각 레이어는 명확한 책임을 가지고 있습니다.

### 1. Presentation 레이어 (src/presentation/)

사용자 인터페이스와 관련된 모든 컴포넌트를 포함합니다.

- **components/**: 아토믹 디자인 패턴에 따른 컴포넌트
  - atoms/: 버튼, 입력 필드 등 기본 UI 요소
  - molecules/: 기본 컴포넌트를 조합한 복합 컴포넌트
  - organisms/: 분자 컴포넌트를 조합한 더 복잡한 UI 블록
  - features/: 특정 기능과 연관된 컴포넌트
- **layouts/**: 페이지 레이아웃 구성요소
- **styles/**: 스타일 관련 파일

### 2. Application 레이어 (src/application/)

비즈니스 로직과 상태 관리를 담당합니다.

- **hooks/**: 커스텀 React 훅
- **store/**: Zustand 기반 상태 관리 로직

### 3. Infrastructure 레이어 (src/infrastructure/)

외부 시스템과의 통신과 기술적 구현을 담당합니다.

- **api/**: API 클라이언트 및 통신 로직 
  - client.ts: Axios 기반 API 클라이언트
  - base_dtos.ts: 데이터 전송 객체 정의
  - auth/: 인증 관련 API
  - content/: 콘텐츠 관련 API
  - genre/: 장르 관련 API
  - user/: 사용자 관련 API
  - wishlist/: 찜목록 관련 API
- **helper/**: 유틸리티 함수
- **client/**: 외부 서비스 클라이언트

### 4. Types (src/types/)

프로젝트 전반에서 사용되는 TypeScript 타입 정의를 포함합니다.

### 5. Pages (src/pages/)

Next.js 라우팅 시스템에 따른 페이지 정의입니다.

- `_app.tsx`: 앱 초기화 및 글로벌 레이아웃
- `_document.tsx`: HTML 문서 구조
- `index.tsx`: 메인 페이지
- `login.tsx`/`signup.tsx`: 인증 페이지
- `movies.tsx`/`series.tsx`: 영화/시리즈 목록
- `search.tsx`: 검색 페이지
- `account.tsx`: 계정 관리
- `content/`: 콘텐츠 상세 페이지
- `watch/`: 콘텐츠 시청 페이지

## 주요 설계 원칙

1. **관심사 분리**: 각 레이어는 명확한 책임을 가지며 독립적으로 작동합니다.
2. **의존성 규칙**: 내부 레이어는 외부 레이어에 의존하지 않습니다.
   - Presentation → Application → Infrastructure
3. **코드 재사용성**: 공통 컴포넌트 및 로직을 재사용하여 중복을 최소화합니다.
4. **테스트 용이성**: 각 레이어를 독립적으로 테스트 가능한 구조를 유지합니다.

## API 통신 패턴

- **Axios 인터셉터**: 토큰 관리 및 에러 처리를 위한 인터셉터 설정
- **React Query**: 서버 상태 관리 및 캐싱, 자동 재요청
- **타입 안전성**: 모든 API 요청 및 응답에 TypeScript 타입 적용
- **에러 처리**: 중앙화된 에러 처리 메커니즘

## 개발 가이드라인

### 컴포넌트 구조

각 컴포넌트 폴더는 기본적으로 다음 세 가지 파일로 구성됩니다:
- `index.tsx`: 컴포넌트 구현
- `types.ts`: 컴포넌트 타입 정의
- `styles.ts`: Styled Components를 사용한 스타일 정의

### 상수 관리

반복적으로 사용되는 상수는 `constants.ts` 파일에 정의하여 사용합니다.

### 성능 최적화

- React 라이프사이클에서 함수들은 가능한 `useCallback`을 사용하여 최적화합니다.
- 불필요한 리렌더링을 방지하기 위해 메모이제이션 기법(`useMemo`, `React.memo`)을 적절히 활용합니다.

## 개발 환경 설정

### 요구 사항

- Node.js: 18.x 이상
- yarn: 패키지 관리 도구로 사용

### 설치 및 실행

```bash
# 의존성 설치
yarn install

# 개발 서버 실행
yarn dev

# 프로덕션 빌드
yarn build

# 프로덕션 서버 실행
yarn start

# 린트 실행
yarn lint

# E2E 테스트 실행
yarn test:e2e
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 필요한 환경 변수를 설정합니다:

```
NEXT_PUBLIC_API_URL=http://api.example.com
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
``` 