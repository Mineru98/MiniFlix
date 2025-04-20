package test

import (
	"os"
	"testing"

	"backend/config"
	"backend/model"

	"github.com/stretchr/testify/mock"
)

// MockUserService는 UserService를 모킹하기 위한 구조체
type MockUserService struct {
	mock.Mock
}

func (m *MockUserService) Register(req *model.RegisterRequest) (*model.User, error) {
	args := m.Called(req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserService) CheckEmailExists(email string) (bool, error) {
	args := m.Called(email)
	return args.Bool(0), args.Error(1)
}

func (m *MockUserService) ValidateLogin(req *model.LoginRequest) (*model.User, error) {
	args := m.Called(req)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserService) GetUserByEmail(email string) (*model.User, error) {
	args := m.Called(email)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserService) GetUserByID(id int64) (*model.User, error) {
	args := m.Called(id)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.User), args.Error(1)
}

func (m *MockUserService) UpdateUserInfo(id int64, req *model.UpdateProfileRequest) error {
	args := m.Called(id, req)
	return args.Error(0)
}

// 테스트용 에러 구현체
type mockError struct {
	message string
}

func (e *mockError) Error() string {
	return e.message
}

// SetupTestDatabase 테스트용 데이터베이스 설정
func SetupTestDatabase(t *testing.T) {
	// 테스트 환경 변수 설정
	os.Setenv("APP_ENV", "test")
	// 모의 데이터베이스 사용 설정
	os.Setenv("MOCK_DB", "true")

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
