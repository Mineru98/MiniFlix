package test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"

	"backend/config"
	"backend/model"
	"backend/route"
)

// DB 모킹을 위한 인터페이스 정의
type MockDB struct {
	mock.Mock
}

func (m *MockDB) Exec(query string, args ...interface{}) (interface{}, error) {
	called := m.Called(query, args)
	return called.Get(0), called.Error(1)
}

func (m *MockDB) QueryRow(query string, args ...interface{}) interface{} {
	called := m.Called(query, args)
	return called.Get(0)
}

// 회원가입 테스트
func TestRegister(t *testing.T) {
	// 테스트 케이스
	testCases := []struct {
		name           string
		requestBody    model.UserRegisterRequest
		emailExists    bool
		expectStatus   int
		expectResponse interface{}
	}{
		{
			name: "유효한 회원가입",
			requestBody: model.UserRegisterRequest{
				Email:    "test@example.com",
				Password: "password123",
				Name:     "테스트 사용자",
			},
			emailExists:  false,
			expectStatus: http.StatusCreated,
		},
		{
			name: "이미 존재하는 이메일",
			requestBody: model.UserRegisterRequest{
				Email:    "existing@example.com",
				Password: "password123",
				Name:     "기존 사용자",
			},
			emailExists:  true,
			expectStatus: http.StatusConflict,
		},
		{
			name: "유효하지 않은 이메일",
			requestBody: model.UserRegisterRequest{
				Email:    "invalid-email",
				Password: "password123",
				Name:     "유효하지 않은 이메일 사용자",
			},
			emailExists:  false,
			expectStatus: http.StatusBadRequest,
		},
		{
			name: "너무 짧은 비밀번호",
			requestBody: model.UserRegisterRequest{
				Email:    "short@example.com",
				Password: "12345",
				Name:     "짧은 비밀번호 사용자",
			},
			emailExists:  false,
			expectStatus: http.StatusBadRequest,
		},
	}

	// 각 테스트 케이스 실행
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Gin 테스트 모드 설정
			gin.SetMode(gin.TestMode)
			router := gin.New()

			// 설정 초기화
			cfg := &config.Config{
				// 테스트용 설정
				DBHost:     "localhost",
				DBPort:     "3306",
				DBUser:     "testuser",
				DBPassword: "testpassword",
				DBName:     "testdb",
			}

			// API 그룹 설정
			apiGroup := router.Group("/api")
			route.SetupAuthRoutes(apiGroup, cfg)

			// 요청 본문 생성
			requestJSON, _ := json.Marshal(tc.requestBody)
			req, _ := http.NewRequest(http.MethodPost, "/api/auth/register", bytes.NewBuffer(requestJSON))
			req.Header.Set("Content-Type", "application/json")

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 응답 확인
			assert.Equal(t, tc.expectStatus, w.Code)

			// 상태 코드에 따른 추가 검증
			if w.Code == http.StatusCreated {
				var response model.UserResponse
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Equal(t, tc.requestBody.Email, response.Email)
				assert.Equal(t, tc.requestBody.Name, response.Name)
				assert.True(t, response.IsActive)
			} else if w.Code == http.StatusConflict {
				var response map[string]string
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Contains(t, response["error"], "이미 등록된 이메일")
			}
		})
	}
}
