package test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"backend/config"
	"backend/helper"
	"backend/model"
	"backend/route"
)

// 콘텐츠 목록 로드 시나리오 테스트
func TestGetContentList(t *testing.T) {
	// 테스트 환경 설정
	SetupTestDatabase(t)
	defer TeardownTestDatabase(t)

	// Gin 테스트 모드 설정
	gin.SetMode(gin.TestMode)

	// 테스트 케이스 정의
	testCases := []struct {
		name            string
		isAuthenticated bool
		expectStatus    int
		setupAuth       func(r *http.Request)
	}{
		{
			name:            "비로그인 사용자 콘텐츠 목록 조회",
			isAuthenticated: false,
			expectStatus:    http.StatusOK,
			setupAuth:       func(r *http.Request) {}, // 인증 헤더 없음
		},
		{
			name:            "로그인 사용자 콘텐츠 목록 조회",
			isAuthenticated: true,
			expectStatus:    http.StatusOK,
			setupAuth: func(r *http.Request) {
				// 테스트용 토큰 설정
				cfg := config.LoadConfig()
				token, _ := helper.GenerateToken(1, "user@example.com", "테스트사용자", cfg)
				r.Header.Set("Authorization", "Bearer "+token)
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// 라우터 설정
			router := gin.New()
			cfg := config.LoadConfig()
			apiGroup := router.Group("/api")
			route.SetupContentRoutes(apiGroup, cfg)

			// 요청 생성
			req, _ := http.NewRequest(http.MethodGet, "/api/contents", nil)
			req.Header.Set("Content-Type", "application/json")
			tc.setupAuth(req)

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 상태 코드 확인
			assert.Equal(t, tc.expectStatus, w.Code)

			// 응답 구조 확인
			if w.Code == http.StatusOK {
				var contentList []model.ContentListResponse
				err := json.Unmarshal(w.Body.Bytes(), &contentList)
				assert.NoError(t, err)

				// 응답 내용 확인
				// 주의: 실제 테스트 DB에 데이터가 있어야 정확한 테스트 가능
				if len(contentList) > 0 {
					for _, content := range contentList {
						// 필수 필드 확인
						assert.NotZero(t, content.ID)
						assert.NotEmpty(t, content.Title)
						assert.NotEmpty(t, content.ThumbnailURL)

						// 로그인 사용자일 경우 찜 상태 필드가 존재해야 함
						if tc.isAuthenticated {
							// IsWishlisted 필드가 존재하는지만 확인
							// 실제 값은 데이터베이스 상태에 따라 다를 수 있음
							assert.Contains(t, w.Body.String(), "is_wishlisted")
						}
					}
				}
			}
		})
	}
}

// 모의 콘텐츠 데이터로 테스트하는 함수
func TestGetContentListWithMockData(t *testing.T) {
	// Gin 테스트 모드 설정
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// 모의 핸들러 설정
	router.GET("/api/contents", func(c *gin.Context) {
		// 인증 상태 확인
		userID := int64(0)
		isAuthenticated := false

		// Authorization 헤더 검사
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer " {
			isAuthenticated = true
			userID = 1 // 테스트용 사용자 ID
			c.Set("userID", userID)
			c.Set("isAuthenticated", true)
		}

		// 모의 콘텐츠 데이터 생성
		contentList := []model.ContentListResponse{
			{
				ID:           1,
				Title:        "테스트 영화 1",
				ThumbnailURL: "/thumbnails/movie1.jpg",
				ReleaseYear:  2021,
				Genres:       []string{"액션", "스릴러"},
				IsWishlisted: isAuthenticated, // 로그인 사용자면 찜 상태 설정
			},
			{
				ID:           2,
				Title:        "테스트 영화 2",
				ThumbnailURL: "/thumbnails/movie2.jpg",
				ReleaseYear:  2022,
				Genres:       []string{"코미디", "로맨스"},
				IsWishlisted: false,
			},
		}

		c.JSON(http.StatusOK, contentList)
	})

	// 테스트 케이스
	testCases := []struct {
		name             string
		isAuthenticated  bool
		expectStatus     int
		expectWishlisted bool
		setupAuth        func(r *http.Request)
	}{
		{
			name:             "비로그인 사용자 콘텐츠 목록 조회",
			isAuthenticated:  false,
			expectStatus:     http.StatusOK,
			expectWishlisted: false,
			setupAuth:        func(r *http.Request) {}, // 인증 헤더 없음
		},
		{
			name:             "로그인 사용자 콘텐츠 목록 조회",
			isAuthenticated:  true,
			expectStatus:     http.StatusOK,
			expectWishlisted: true, // 첫 번째 콘텐츠는 항상 찜 상태
			setupAuth: func(r *http.Request) {
				r.Header.Set("Authorization", "Bearer test-token")
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// 요청 생성
			req, _ := http.NewRequest(http.MethodGet, "/api/contents", nil)
			req.Header.Set("Content-Type", "application/json")
			tc.setupAuth(req)

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 상태 코드 확인
			assert.Equal(t, tc.expectStatus, w.Code)

			// 응답 구조 확인
			var contentList []model.ContentListResponse
			err := json.Unmarshal(w.Body.Bytes(), &contentList)
			assert.NoError(t, err)
			assert.Len(t, contentList, 2)

			// 첫 번째 콘텐츠의 찜 상태 확인
			if tc.isAuthenticated {
				assert.Equal(t, tc.expectWishlisted, contentList[0].IsWishlisted)
			} else {
				assert.False(t, contentList[0].IsWishlisted)
			}
		})
	}
}
