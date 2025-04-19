package test

import (
	"os"
	"testing"

	"backend/config"
)

// SetupTestDatabase 테스트용 데이터베이스 설정
func SetupTestDatabase(t *testing.T) {
	// 테스트 환경 변수 설정
	os.Setenv("APP_ENV", "test")

	// 테스트에 필요한 설정 값을 환경 변수로 직접 설정
	os.Setenv("DB_HOST", "localhost")
	os.Setenv("DB_PORT", "3308")
	os.Setenv("DB_USER", "miniflix")
	os.Setenv("DB_PASSWORD", "miniflix")
	os.Setenv("DB_NAME", "miniflix") // 실제 존재하는 DB 사용
	os.Setenv("JWT_SECRET", "miniflix-test-secret-key")

	// 설정 로드
	cfg := config.LoadConfig()

	// 여기서 필요한 경우 테스트 데이터베이스 초기화 작업 수행
	// 예: 테이블 생성, 테스트 데이터 삽입 등
	t.Logf("테스트 데이터베이스 설정 완료: %s@%s:%s/%s",
		cfg.DBUser, cfg.DBHost, cfg.DBPort, cfg.DBName)
}

// TeardownTestDatabase 테스트 후 데이터베이스 정리
func TeardownTestDatabase(t *testing.T) {
	// 여기서 필요한 경우 테스트 데이터베이스 정리 작업 수행
	// 예: 테이블 비우기, 테스트 데이터 삭제 등
	t.Log("테스트 데이터베이스 정리 완료")
}
