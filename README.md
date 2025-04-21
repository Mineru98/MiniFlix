# MiniFlix

넷플릭스의 핵심 기능을 간소화하여 구현한 웹 기반 스트리밍 서비스입니다.

## 시스템 설계 기획 문서

### 화면 흐름도
```mermaid
flowchart TB
    %% 노드 정의
    landing["랜딩 페이지<br>(비로그인 상태)"]:::landingPage
    login["로그인 페이지"]:::authPage
    signup["회원가입 페이지"]:::authPage
    home["홈 화면<br>(콘텐츠 목록)"]:::mainPage
    search["검색 결과 화면"]:::contentPage
    genre["장르별 필터링 화면"]:::contentPage
    details["콘텐츠 상세 페이지"]:::contentPage
    player["비디오 플레이어"]:::playerPage
    mypage["마이페이지"]:::userPage
    wishlist["찜 목록"]:::userPage
    account["계정 정보 관리"]:::userPage
    
    %% 연결선 정의
    landing --> login
    landing --> signup
    landing --> home
    
    login --> home
    signup --> login
    
    home --> search
    home --> genre
    home --> details
    home --> mypage
    
    search --> details
    genre --> details
    
    details --> player
    details -- "찜하기/취소" --> details
    
    mypage --> wishlist
    mypage --> account
    
    wishlist --> details
    
    %% 모든 페이지에서 홈으로 돌아갈 수 있음
    search --> home
    genre --> home
    details --> home
    player --> home
    wishlist --> home
    account --> home
    
    %% 스타일 정의
    classDef landingPage fill:#3E2723,color:#FFF,stroke:#8D6E63,stroke-width:2px
    classDef authPage fill:#0D47A1,color:#FFF,stroke:#1976D2,stroke-width:2px
    classDef mainPage fill:#B71C1C,color:#FFF,stroke:#E53935,stroke-width:2px
    classDef contentPage fill:#2E7D32,color:#FFF,stroke:#4CAF50,stroke-width:2px
    classDef playerPage fill:#4A148C,color:#FFF,stroke:#7B1FA2,stroke-width:2px
    classDef userPage fill:#E65100,color:#FFF,stroke:#FF9800,stroke-width:2px
```

### ERD

```mermaid
erDiagram
    Users ||--o{ Wishlists : "저장"
    Users ||--o{ ViewingHistories : "시청"
    Contents ||--o{ Wishlists : "저장됨"
    Contents ||--o{ ViewingHistories : "시청됨"
    Contents ||--o{ ContentGenres : "분류됨"
    Genres ||--o{ ContentGenres : "분류"
    
    Users {
        bigint id PK "사용자 고유 식별자"
        varchar(100) email "사용자 이메일(로그인 ID)"
        varchar(255) password_hash "암호화된 비밀번호"
        varchar(50) name "사용자 이름"
        timestamp created_at "가입일시"
        timestamp updated_at "정보 수정일시"
        bit(1) is_active "계정 활성화 상태"
    }
    
    Contents {
        bigint id PK "콘텐츠 고유 식별자"
        varchar(200) title "콘텐츠 제목"
        text description "콘텐츠 설명"
        varchar(255) thumbnail_url "썸네일 이미지 경로"
        varchar(255) video_url "비디오 파일 경로"
        int duration "영상 길이(초)"
        int release_year "출시 연도"
        timestamp created_at "등록일시"
        timestamp updated_at "수정일시"
    }
    
    Genres {
        bigint id PK "장르 고유 식별자"
        varchar(50) name "장르명"
        varchar(200) description "장르 설명"
    }
    
    ContentGenres {
        bigint id PK "매핑 고유 식별자"
        bigint content_id FK "콘텐츠 ID"
        bigint genre_id FK "장르 ID"
    }
    
    Wishlists {
        bigint id PK "찜 목록 고유 식별자"
        bigint user_id FK "사용자 ID"
        bigint content_id FK "콘텐츠 ID"
        timestamp created_at "찜한 일시"
    }
    
    ViewingHistories {
        bigint id PK "시청 기록 고유 식별자"
        bigint user_id FK "사용자 ID"
        bigint content_id FK "콘텐츠 ID"
        int watch_duration "시청 시간(초)"
        int last_position "마지막 시청 위치(초)"
        timestamp watched_at "시청 일시"
        bit(1) is_completed "시청 완료 여부"
    }
```

### 기능별 시나리오 시퀀스 다이어그램

#### 회원가입 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(200, 150, 255, 0.1)
        Note over Client, DB: 회원가입 프로세스
        Client->>API: 회원가입 요청<br>(이메일, 비밀번호, 이름)
        
        API->>API: 요청 데이터 유효성 검증<br>(이메일 형식, 비밀번호 강도 등)
        
        API->>DB: 이메일 중복 확인 쿼리
        DB-->>API: 중복 여부 결과 반환
        
        alt 이메일 중복인 경우
            API-->>Client: 409 Conflict<br>(이미 사용 중인 이메일)
        else 유효성 검증 실패
            API-->>Client: 400 Bad Request<br>(유효하지 않은 입력 데이터)
        else 가입 가능한 경우
            API->>API: 비밀번호 해싱
            API->>DB: Users 테이블에 사용자 정보 저장<br>(email, password_hash, name, created_at, is_active=1)
            DB-->>API: 저장 결과
            API-->>Client: 201 Created<br>(회원가입 성공 메시지)
            Client->>Client: 로그인 페이지로 리다이렉트
        end
    end
```

#### 로그인 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(150, 200, 255, 0.1)
        Note over Client, DB: 로그인 프로세스
        Client->>API: 로그인 요청<br>(이메일, 비밀번호)
        
        API->>DB: 사용자 정보 조회<br>(Users 테이블에서 email로 검색)
        DB-->>API: 사용자 정보 반환<br>(id, password_hash, name, is_active)
        
        alt 사용자 없음
            API-->>Client: 401 Unauthorized<br>(존재하지 않는 사용자)
        else 계정 비활성화
            API-->>Client: 403 Forbidden<br>(비활성화된 계정)
        else 사용자 존재
            API->>API: 비밀번호 해시 검증
            
            alt 비밀번호 불일치
                API-->>Client: 401 Unauthorized<br>(비밀번호 불일치)
            else 로그인 성공
                API->>API: JWT 토큰 생성<br>(사용자 ID, 이름 등의 정보 포함)
                API-->>Client: 200 OK<br>(JWT 토큰, 사용자 기본 정보)
                Client->>Client: 토큰 저장 (localStorage/쿠키)
                Client->>Client: 홈 화면으로 리다이렉트
            end
        end
    end
```


#### 홈 화면 콘텐츠 로드 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(150, 255, 150, 0.1)
        Note over Client, DB: 홈 화면 콘텐츠 로드 프로세스
        Client->>Client: 홈 화면 접근
        
        alt 로그인 상태인 경우
            Client->>API: 인증된 콘텐츠 목록 요청<br>(JWT 토큰 포함)
            API->>API: JWT 토큰 검증
            
            alt 토큰 유효
                API->>DB: 콘텐츠 목록 조회<br>(Contents 테이블)
                DB-->>API: 콘텐츠 기본 정보 반환<br>(id, title, thumbnail_url, release_year 등)
                
                API->>DB: 사용자별 찜 목록 조회<br>(Wishlists 테이블)
                DB-->>API: 사용자의 찜한 콘텐츠 ID 목록
                
                API->>API: 콘텐츠에 찜 상태 정보 추가
                API-->>Client: 200 OK<br>(콘텐츠 목록 + 찜 상태)
            else 토큰 무효
                API-->>Client: 401 Unauthorized
                Client->>Client: 로그인 페이지로 리다이렉트
            end
        else 비로그인 상태
            Client->>API: 비인증 콘텐츠 목록 요청
            API->>DB: 콘텐츠 목록 조회<br>(Contents 테이블)
            DB-->>API: 콘텐츠 기본 정보 반환<br>(id, title, thumbnail_url, release_year 등)
            API-->>Client: 200 OK<br>(콘텐츠 목록, 찜 상태 없음)
        end
        
        Client->>Client: 콘텐츠 그리드 형태로 표시
    end
```


#### 콘텐츠 검색 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(255, 200, 150, 0.1)
        Note over Client, DB: 콘텐츠 검색 프로세스
        Client->>Client: 검색어 입력
        Client->>API: 검색 요청<br>(검색어, JWT 토큰(선택적))
        
        alt 로그인 상태인 경우
            API->>API: JWT 토큰 검증
        end
        
        API->>DB: 제목 기반 콘텐츠 검색<br>(Contents 테이블에서 title LIKE '%검색어%')
        DB-->>API: 검색 결과 반환
        
        alt 로그인 상태인 경우
            API->>DB: 사용자별 찜 목록 조회<br>(Wishlists 테이블)
            DB-->>API: 사용자의 찜한 콘텐츠 ID 목록
            API->>API: 검색 결과에 찜 상태 정보 추가
        end
        
        alt 검색 결과 있음
            API-->>Client: 200 OK<br>(검색 결과 콘텐츠 목록)
        else 검색 결과 없음
            API-->>Client: 200 OK<br>(빈 배열)
        end
        
        Client->>Client: 검색 결과 표시
    end
```


#### 장르별 필터링 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(255, 150, 200, 0.1)
        Note over Client, DB: 장르별 필터링 프로세스
        
        Client->>API: 장르 목록 요청
        API->>DB: 장르 정보 조회<br>(Genres 테이블)
        DB-->>API: 장르 목록 반환<br>(id, name)
        API-->>Client: 200 OK<br>(장르 목록)
        
        Client->>Client: 장르 필터 UI 표시
        Client->>Client: 장르 선택
        
        Client->>API: 장르별 콘텐츠 요청<br>(genre_id, JWT 토큰(선택적))
        
        alt 로그인 상태인 경우
            API->>API: JWT 토큰 검증
        end
        
        API->>DB: 장르별 콘텐츠 조회<br>(Contents JOIN ContentGenres WHERE genre_id=선택장르)
        DB-->>API: 필터링된 콘텐츠 목록 반환
        
        alt 로그인 상태인 경우
            API->>DB: 사용자별 찜 목록 조회<br>(Wishlists 테이블)
            DB-->>API: 사용자의 찜한 콘텐츠 ID 목록
            API->>API: 검색 결과에 찜 상태 정보 추가
        end
        
        API-->>Client: 200 OK<br>(필터링된 콘텐츠 목록)
        Client->>Client: 필터링된 콘텐츠 표시
    end
```


#### 콘텐츠 상세 정보 조회 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(200, 255, 200, 0.1)
        Note over Client, DB: 콘텐츠 상세 정보 조회 프로세스
        Client->>Client: 콘텐츠 썸네일 클릭
        Client->>API: 콘텐츠 상세 정보 요청<br>(content_id, JWT 토큰(선택적))
        
        alt 로그인 상태인 경우
            API->>API: JWT 토큰 검증
        end
        
        API->>DB: 콘텐츠 상세 정보 조회<br>(Contents 테이블 JOIN ContentGenres JOIN Genres)
        DB-->>API: 콘텐츠 상세 정보 반환<br>(id, title, description, thumbnail_url, video_url, duration, release_year, 장르 목록)
        
        alt 로그인 상태인 경우
            API->>DB: 찜 상태 확인<br>(Wishlists 테이블)
            DB-->>API: 찜 여부 반환
            
            API->>DB: 시청 기록 조회<br>(ViewingHistories 테이블)
            DB-->>API: 최근 시청 정보 반환<br>(last_position)
        end
        
        API-->>Client: 200 OK<br>(콘텐츠 상세 정보, 찜 상태, 시청 위치(선택적))
        
        Client->>Client: 콘텐츠 상세 페이지 렌더링<br>(찜하기 버튼, 재생 버튼 등)
    end
```


#### 콘텐츠 재생 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    participant Storage as 미디어 스토리지
    
    rect rgba(150, 255, 255, 0.1)
        Note over Client, Storage: 콘텐츠 재생 프로세스
        Client->>Client: 재생 버튼 클릭
        
        alt 비로그인 상태
            Client->>Client: 로그인 페이지로 리다이렉트<br>(시청 불가 알림)
        else 로그인 상태
            Client->>API: 콘텐츠 재생 요청<br>(content_id, JWT 토큰)
            
            API->>API: JWT 토큰 검증
            
            alt 토큰 유효
                API->>DB: 콘텐츠 정보 조회<br>(Content 테이블)
                DB-->>API: 콘텐츠 정보 반환<br>(video_url)
                
                API->>DB: 이전 시청 기록 조회<br>(ViewingHistories 테이블)
                DB-->>API: 마지막 시청 위치 반환<br>(last_position)
                
                API-->>Client: 200 OK<br>(스트리밍 URL, 마지막 시청 위치)
                
                Client->>Storage: 비디오 스트림 요청<br>(JWT 토큰 포함)
                Storage-->>Client: 비디오 스트림
                
                Client->>Client: 비디오 플레이어 초기화<br>(마지막 시청 위치부터 재생)
                
                loop 주기적으로 재생 위치 저장 (30초마다)
                    Client->>API: 재생 위치 업데이트<br>(content_id, current_position, JWT 토큰)
                    API->>DB: ViewingHistories 테이블 업데이트/생성<br>(user_id, content_id, last_position, watch_duration)
                    DB-->>API: 업데이트 결과
                    API-->>Client: 200 OK
                end
                
                Client->>Client: 재생 종료<br>(일시정지, 창 닫기 등)
                
                Client->>API: 최종 재생 위치 저장<br>(content_id, final_position, watch_duration, is_completed, JWT 토큰)
                API->>DB: ViewingHistories 테이블 업데이트<br>(last_position, watch_duration, is_completed)
                DB-->>API: 업데이트 결과
                API-->>Client: 200 OK
            else 토큰 무효
                API-->>Client: 401 Unauthorized
                Client->>Client: 로그인 페이지로 리다이렉트
            end
        end
    end
```


#### 콘텐츠 찜하기/취소 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(255, 255, 150, 0.1)
        Note over Client, DB: 콘텐츠 찜하기/취소 프로세스
        Client->>Client: 찜하기 버튼 클릭
        
        alt 비로그인 상태
            Client->>Client: 로그인 페이지로 리다이렉트
        else 로그인 상태
            Client->>API: 찜하기 토글 요청<br>(content_id, JWT 토큰)
            
            API->>API: JWT 토큰 검증
            
            alt 토큰 유효
                API->>DB: 현재 찜 상태 확인<br>(Wishlists 테이블)
                DB-->>API: 찜 상태 결과
                
                alt 이미 찜한 경우 (찜 취소)
                    API->>DB: Wishlists 테이블에서 삭제<br>(user_id, content_id)
                    DB-->>API: 삭제 결과
                    API-->>Client: 200 OK<br>(찜 취소 성공, 새로운 상태: false)
                else 찜하지 않은 경우 (찜하기)
                    API->>DB: Wishlists 테이블에 추가<br>(user_id, content_id, created_at)
                    DB-->>API: 추가 결과
                    API-->>Client: 201 Created<br>(찜하기 성공, 새로운 상태: true)
                end
                
                Client->>Client: UI 업데이트<br>(찜하기 버튼 상태 변경)
            else 토큰 무효
                API-->>Client: 401 Unauthorized
                Client->>Client: 로그인 페이지로 리다이렉트
            end
        end
    end
```


#### 찜 목록 조회 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(200, 200, 255, 0.1)
        Note over Client, DB: 찜 목록 조회 프로세스
        Client->>Client: 마이페이지 - 찜 목록 클릭
        Client->>API: 찜 목록 요청<br>(JWT 토큰)
        
        API->>API: JWT 토큰 검증
        
        alt 토큰 유효
            API->>DB: 사용자의 찜 목록 조회<br>(Wishlists JOIN Contents WHERE user_id)
            DB-->>API: 찜한 콘텐츠 목록 반환<br>(콘텐츠 id, title, thumbnail_url 등)
            
            alt 찜 목록 있음
                API-->>Client: 200 OK<br>(찜한 콘텐츠 목록)
            else 찜 목록 없음
                API-->>Client: 200 OK<br>(빈 배열)
            end
            
            Client->>Client: 찜 목록 화면 렌더링
        else 토큰 무효
            API-->>Client: 401 Unauthorized
            Client->>Client: 로그인 페이지로 리다이렉트
        end
    end
```


#### 계정 정보 조회 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(255, 200, 200, 0.1)
        Note over Client, DB: 계정 정보 조회 프로세스
        Client->>Client: 마이페이지 - 계정 정보 클릭
        Client->>API: 계정 정보 요청<br>(JWT 토큰)
        
        API->>API: JWT 토큰 검증
        
        alt 토큰 유효
            API->>DB: 사용자 정보 조회<br>(Users 테이블)
            DB-->>API: 사용자 정보 반환<br>(email, name, created_at)
            API-->>Client: 200 OK<br>(사용자 정보)
            Client->>Client: 계정 정보 화면 렌더링
        else 토큰 무효
            API-->>Client: 401 Unauthorized
            Client->>Client: 로그인 페이지로 리다이렉트
        end
    end
```



#### 계정 정보 수정 시나리오

```mermaid
sequenceDiagram
    autonumber
    participant Client as 클라이언트(브라우저)
    participant API as 백엔드 API 서버
    participant DB as 데이터베이스
    
    rect rgba(200, 255, 255, 0.1)
        Note over Client, DB: 계정 정보 수정 프로세스
        Client->>Client: 계정 정보 수정 폼 작성<br>(이름 또는 비밀번호)
        Client->>API: 계정 정보 수정 요청<br>(변경할 정보, 현재 비밀번호, JWT 토큰)
        
        API->>API: JWT 토큰 검증
        
        alt 토큰 유효
            API->>DB: 현재 비밀번호 확인<br>(Users 테이블)
            DB-->>API: 저장된 password_hash 반환
            
            API->>API: 현재 비밀번호 검증
            
            alt 비밀번호 일치
                API->>API: 새 정보 유효성 검증
                
                alt 새 비밀번호 변경 요청 포함
                    API->>API: 새 비밀번호 해싱
                end
                
                API->>DB: Users 테이블 업데이트<br>(name, password_hash(선택적), updated_at)
                DB-->>API: 업데이트 결과
                API-->>Client: 200 OK<br>(수정 성공 메시지)
                
                Client->>Client: 성공 알림 표시
                Client->>Client: 업데이트된 정보 표시
            else 비밀번호 불일치
                API-->>Client: 403 Forbidden<br>(현재 비밀번호 불일치)
                Client->>Client: 오류 메시지 표시
            end
        else 토큰 무효
            API-->>Client: 401 Unauthorized
            Client->>Client: 로그인 페이지로 리다이렉트
        end
    end
```

## 주요 기능

- 콘텐츠 스트리밍: 영화 및 드라마 클립을 웹에서 시청
- 콘텐츠 탐색: 홈 화면에서 콘텐츠 목록 확인, 검색 및 장르별 필터링
- 회원 기능: 회원가입, 로그인, 마이페이지
- 찜 목록: 관심 있는 콘텐츠 저장 및 관리
- 반응형 디자인: PC와 모바일에서 모두 사용 가능한 UI

## 기술 스택

### 프론트엔드
- TypeScript
- React
- Next.js
- Zustand (상태 관리)
- React Query (서버 상태 관리)
- TailwindCSS (스타일링)
- Axios (HTTP 클라이언트)

### 백엔드
- Golang
- Gin 프레임워크
- MySQL 데이터베이스
- JWT 인증
- Swagger API 문서

## 부가 설정

- [swag 바이너리 설치](https://github.com/swaggo/swag/releases/tag/v1.16.3)

## 실행 방법

### Docker Compose 실행

```bash
# 전체 서비스 실행
docker-compose up

# 백그라운드로 실행
docker-compose up -d

# 서비스 중지
docker-compose down
```

### 개발 환경 설정

```bash
# 프론트엔드 개발 서버 실행
cd frontend
yarn
yarn dev

# 백엔드 개발 서버 실행
cd backend
go mod tidy
./swag init && go run main.go    
```

## 접속 정보

- 프론트엔드: http://localhost:3000
- 백엔드 API: http://localhost:8080
- Swagger API 문서: http://localhost:8080/swagger/index.html
