# MiniFlix E2E 테스트

## 개요

이 디렉토리는 MiniFlix 프론트엔드 애플리케이션의 End-to-End 테스트를 포함하고 있습니다. Playwright를 사용하여 사용자 관점에서 주요 기능을 테스트합니다.

## 테스트 실행 방법

```bash
# 모든 E2E 테스트 실행
npm run test:e2e

# UI 모드로 테스트 실행
npm run test:e2e:ui

# 디버그 모드로 테스트 실행
npm run test:e2e:debug

# 로그인 관련 테스트만 실행
npm run test:login
```

## 테스트 구조

* `login.spec.ts` - 로그인 기능 테스트
* 추가 테스트 파일은 기능별로 추가 예정

## 테스트 환경

* 테스트는 Chromium, Firefox, WebKit 브라우저에서 실행됩니다.
* 모바일 환경 테스트도 포함되어 있습니다.
* 각 테스트는 독립적으로 실행되며, 테스트 간 상태 공유는 없습니다.

## 모킹 전략

API 요청은 Playwright의 네트워크 요청 가로채기 기능을 사용하여 모킹합니다. 이를 통해 백엔드 서버 없이도 프론트엔드 기능을 테스트할 수 있습니다.

## CI/CD 통합

GitHub Actions 워크플로우에서 모든 PR 및 main 브랜치 푸시에 대해 E2E 테스트가 실행됩니다. 