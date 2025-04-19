package test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"backend/config"
	"backend/helper"
	"backend/middleware"
	"backend/model"
)

// TestGetUserProfile 계정 정보 조회 API 테스트
func TestGetUserProfile(t *testing.T) {
	// 테스트 모드 설정
	gin.SetMode(gin.TestMode)

	// 설정 로드
	cfg := &config.Config{
		JWTSecret:      "test_jwt_secret",
		JWTExpireHours: 24,
	}

	// 테스트 라우터 설정
	r := gin.Default()

	// 테스트에 사용할 사용자 정보
	testUser := &model.User{
		ID:        1,
		Email:     "test@example.com",
		Password:  "hashedpassword",
		Name:      "테스트사용자",
		CreatedAt: time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC),
		UpdatedAt: time.Date(2023, 1, 1, 0, 0, 0, 0, time.UTC),
		IsActive:  true,
	}

	// 모킹된 서비스 설정
	mockService := new(MockUserService)
	mockService.On("GetUserByID", int64(1)).Return(testUser, nil)

	// JWT 토큰 생성
	token, _ := helper.GenerateToken(testUser.ID, testUser.Name, testUser.Email, cfg)

	// 테스트 라우트 설정
	group := r.Group("/api/users")
	group.Use(func(c *gin.Context) {
		// 인증 미들웨어를 모방하여 컨텍스트에 사용자 ID 설정
		c.Set("userID", int64(1))
		c.Next()
	})

	// 핸들러 설정
	group.GET("/profile", func(c *gin.Context) {
		// 데이터베이스 대신 모킹된 서비스 사용
		userID := c.GetInt64("userID")
		user, err := mockService.GetUserByID(userID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "사용자 정보 조회 실패"})
			return
		}
		c.JSON(http.StatusOK, user.ToUserResponse())
	})

	// 테스트 요청 생성
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/users/profile", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(w, req)

	// 응답 검증
	assert.Equal(t, http.StatusOK, w.Code)

	// 응답 파싱
	var response model.UserResponse
	json.Unmarshal(w.Body.Bytes(), &response)

	// 반환된 사용자 정보 검증
	assert.Equal(t, testUser.ID, response.ID)
	assert.Equal(t, testUser.Email, response.Email)
	assert.Equal(t, testUser.Name, response.Name)
	assert.Equal(t, testUser.IsActive, response.IsActive)

	// 모킹 검증
	mockService.AssertExpectations(t)
}

// TestGetUserProfileUnauthorized 인증되지 않은 계정 정보 조회 API 테스트
func TestGetUserProfileUnauthorized(t *testing.T) {
	// 테스트 모드 설정
	gin.SetMode(gin.TestMode)

	// 설정 로드
	cfg := &config.Config{
		JWTSecret:      "test_jwt_secret",
		JWTExpireHours: 24,
	}

	// 테스트 라우터 설정
	r := gin.Default()

	// 인증 미들웨어 설정
	userRoutes := r.Group("/api/users")
	userRoutes.Use(middleware.AuthMiddleware(cfg))
	userRoutes.GET("/profile", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "인증 성공"})
	})

	// 인증 헤더 없는 요청 생성
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/users/profile", nil)
	r.ServeHTTP(w, req)

	// 인증 실패 검증
	assert.Equal(t, http.StatusUnauthorized, w.Code)

	// 잘못된 토큰으로 요청
	w = httptest.NewRecorder()
	req, _ = http.NewRequest("GET", "/api/users/profile", nil)
	req.Header.Set("Authorization", "Bearer invalid_token")
	r.ServeHTTP(w, req)

	// 인증 실패 검증
	assert.Equal(t, http.StatusUnauthorized, w.Code)
}
