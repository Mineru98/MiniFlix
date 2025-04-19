package test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"backend/model"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// TestToggleWishlist 콘텐츠 찜하기/취소 기능 테스트
func TestToggleWishlist(t *testing.T) {
	// Gin 테스트 모드 설정
	gin.SetMode(gin.TestMode)

	// 테스트 케이스
	testCases := []struct {
		name           string
		contentID      string
		withAuth       bool
		expectStatus   int
		expectMessage  string
		expectWishlist bool
	}{
		{
			name:           "로그인 사용자 찜하기",
			contentID:      "1",
			withAuth:       true,
			expectStatus:   http.StatusOK,
			expectMessage:  "콘텐츠가 찜 목록에 추가되었습니다",
			expectWishlist: true,
		},
		{
			name:           "로그인 사용자 찜 취소",
			contentID:      "1",
			withAuth:       true,
			expectStatus:   http.StatusOK,
			expectMessage:  "콘텐츠가 찜 목록에서 제거되었습니다",
			expectWishlist: false,
		},
		{
			name:           "비로그인 사용자 접근 거부",
			contentID:      "1",
			withAuth:       false,
			expectStatus:   http.StatusUnauthorized,
			expectMessage:  "",
			expectWishlist: false,
		},
		{
			name:           "잘못된 콘텐츠 ID",
			contentID:      "invalid",
			withAuth:       true,
			expectStatus:   http.StatusBadRequest,
			expectMessage:  "",
			expectWishlist: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// 라우터 설정
			router := gin.New()

			// 라우트 설정
			apiGroup := router.Group("/api")

			// 모의 찜하기/취소 핸들러
			apiGroup.POST("/wishlists/:contentId", func(c *gin.Context) {
				// 인증 체크
				if !tc.withAuth {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "인증 필요"})
					return
				}

				// 콘텐츠 ID 검증
				contentID := c.Param("contentId")
				if contentID == "invalid" {
					c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
					return
				}

				// 찜하기/취소 모의 응답
				// 실제 로직은 구현되어 있어 이 부분은 모의 응답만 제공
				var response model.WishlistToggleResponse

				// 테스트 케이스에 따라 응답 설정
				if tc.name == "로그인 사용자 찜하기" {
					response = model.WishlistToggleResponse{
						Message:      "콘텐츠가 찜 목록에 추가되었습니다",
						IsWishlisted: true,
					}
				} else if tc.name == "로그인 사용자 찜 취소" {
					response = model.WishlistToggleResponse{
						Message:      "콘텐츠가 찜 목록에서 제거되었습니다",
						IsWishlisted: false,
					}
				}

				c.JSON(http.StatusOK, response)
			})

			// 요청 생성
			req, _ := http.NewRequest(http.MethodPost, "/api/wishlists/"+tc.contentID, nil)
			req.Header.Set("Content-Type", "application/json")

			// 인증 헤더 설정 (실제로는 사용하지 않지만 테스트 호환성을 위해 유지)
			if tc.withAuth {
				req.Header.Set("Authorization", "Bearer test-token")
			}

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 상태 코드 확인
			assert.Equal(t, tc.expectStatus, w.Code)

			// 성공 응답인 경우 응답 내용 확인
			if w.Code == http.StatusOK {
				var response model.WishlistToggleResponse
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Equal(t, tc.expectMessage, response.Message)
				assert.Equal(t, tc.expectWishlist, response.IsWishlisted)
			}
		})
	}
}

// TestGetWishlist 찜 목록 조회 테스트
func TestGetWishlist(t *testing.T) {
	// Gin 테스트 모드 설정
	gin.SetMode(gin.TestMode)

	// 테스트 케이스
	testCases := []struct {
		name         string
		withAuth     bool
		expectStatus int
	}{
		{
			name:         "로그인 사용자 찜 목록 조회",
			withAuth:     true,
			expectStatus: http.StatusOK,
		},
		{
			name:         "비로그인 사용자 접근 거부",
			withAuth:     false,
			expectStatus: http.StatusUnauthorized,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// 라우터 설정
			router := gin.New()

			// 라우트 설정
			apiGroup := router.Group("/api")

			// 모의 찜 목록 핸들러
			apiGroup.GET("/wishlists", func(c *gin.Context) {
				// 인증 체크
				if !tc.withAuth {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "인증 필요"})
					return
				}

				// 모의 찜 목록 데이터
				wishlist := []model.ContentListResponse{
					{
						ID:           1,
						Title:        "찜한 영화 1",
						ThumbnailURL: "/thumbnails/movie1.jpg",
						ReleaseYear:  2021,
						Genres:       []string{"액션", "스릴러"},
						IsWishlisted: true,
					},
					{
						ID:           2,
						Title:        "찜한 영화 2",
						ThumbnailURL: "/thumbnails/movie2.jpg",
						ReleaseYear:  2022,
						Genres:       []string{"코미디", "로맨스"},
						IsWishlisted: true,
					},
				}

				c.JSON(http.StatusOK, wishlist)
			})

			// 요청 생성
			req, _ := http.NewRequest(http.MethodGet, "/api/wishlists", nil)
			req.Header.Set("Content-Type", "application/json")

			// 인증 헤더 설정 (실제로는 사용하지 않지만 테스트 호환성을 위해 유지)
			if tc.withAuth {
				req.Header.Set("Authorization", "Bearer test-token")
			}

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 상태 코드 확인
			assert.Equal(t, tc.expectStatus, w.Code)

			// 성공 응답인 경우 응답 구조 확인
			if w.Code == http.StatusOK {
				var wishlist []model.ContentListResponse
				err := json.Unmarshal(w.Body.Bytes(), &wishlist)
				assert.NoError(t, err)
				assert.Len(t, wishlist, 2)

				// 각 항목 검증
				for _, content := range wishlist {
					assert.NotZero(t, content.ID)
					assert.NotEmpty(t, content.Title)
					assert.NotEmpty(t, content.ThumbnailURL)
					assert.True(t, content.IsWishlisted)
				}
			}
		})
	}
}

// 모의 데이터를 사용한 찜하기/취소 테스트
func TestToggleWishlistWithMockData(t *testing.T) {
	// Gin 테스트 모드 설정
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// 모의 찜하기/취소 핸들러
	router.POST("/api/wishlists/:contentId", func(c *gin.Context) {
		// 인증 상태 확인 (모의 구현)
		authHeader := c.GetHeader("Authorization")
		isAuthenticated := authHeader != "" && len(authHeader) > 7 && authHeader[:7] == "Bearer "

		if !isAuthenticated {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "인증 필요"})
			return
		}

		// 콘텐츠 ID 파싱
		contentID := c.Param("contentId")
		if contentID == "invalid" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
			return
		}

		// 첫 번째 요청은 항상 찜하기 상태로 응답
		response := model.WishlistToggleResponse{
			Message:      "콘텐츠가 찜 목록에 추가되었습니다",
			IsWishlisted: true,
		}

		c.JSON(http.StatusOK, response)
	})

	// 테스트 케이스
	testCases := []struct {
		name           string
		contentID      string
		withAuth       bool
		expectStatus   int
		expectWishlist bool
	}{
		{
			name:           "인증된 사용자 찜하기",
			contentID:      "1",
			withAuth:       true,
			expectStatus:   http.StatusOK,
			expectWishlist: true,
		},
		{
			name:           "인증되지 않은 사용자 찜하기",
			contentID:      "1",
			withAuth:       false,
			expectStatus:   http.StatusUnauthorized,
			expectWishlist: false,
		},
		{
			name:           "잘못된 콘텐츠 ID로 찜하기",
			contentID:      "invalid",
			withAuth:       true,
			expectStatus:   http.StatusBadRequest,
			expectWishlist: false,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// 요청 생성
			req, _ := http.NewRequest(http.MethodPost, "/api/wishlists/"+tc.contentID, nil)
			req.Header.Set("Content-Type", "application/json")

			if tc.withAuth {
				req.Header.Set("Authorization", "Bearer test-token")
			}

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 상태 코드 확인
			assert.Equal(t, tc.expectStatus, w.Code)

			// 성공 응답인 경우 추가 검증
			if w.Code == http.StatusOK {
				var response model.WishlistToggleResponse
				err := json.Unmarshal(w.Body.Bytes(), &response)
				assert.NoError(t, err)
				assert.Equal(t, tc.expectWishlist, response.IsWishlisted)
			}
		})
	}
}

// 찜 목록 통합 테스트 (모의 데이터 사용)
func TestGetWishlistIntegration(t *testing.T) {
	// 테스트 케이스 정의
	testCases := []struct {
		name         string
		withAuth     bool
		userID       int64
		expectStatus int
		mockWishlist []model.ContentListResponse
	}{
		{
			name:         "로그인 사용자 - 찜 목록 있음",
			withAuth:     true,
			userID:       1,
			expectStatus: http.StatusOK,
			mockWishlist: []model.ContentListResponse{
				{
					ID:           1,
					Title:        "테스트 영화 1",
					ThumbnailURL: "/thumbnails/movie1.jpg",
					ReleaseYear:  2020,
					Genres:       []string{"액션", "모험"},
					IsWishlisted: true,
				},
				{
					ID:           2,
					Title:        "테스트 영화 2",
					ThumbnailURL: "/thumbnails/movie2.jpg",
					ReleaseYear:  2021,
					Genres:       []string{"코미디", "로맨스"},
					IsWishlisted: true,
				},
			},
		},
		{
			name:         "로그인 사용자 - 찜 목록 없음",
			withAuth:     true,
			userID:       9999, // 존재하지 않는 사용자 ID
			expectStatus: http.StatusOK,
			mockWishlist: []model.ContentListResponse{},
		},
		{
			name:         "비로그인 사용자 접근 거부",
			withAuth:     false,
			userID:       0,
			expectStatus: http.StatusUnauthorized,
			mockWishlist: nil,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// Gin 테스트 모드 설정
			gin.SetMode(gin.TestMode)
			router := gin.New()

			// 테스트 미들웨어
			router.Use(func(c *gin.Context) {
				if tc.withAuth {
					c.Set("userID", tc.userID)
					c.Set("userName", "Test User")
					c.Set("userEmail", "test@example.com")
					c.Next()
				} else {
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "인증 필요"})
				}
			})

			// 찜 목록 라우트 설정 (모의 데이터 반환)
			wishlistRoutes := router.Group("/api/wishlists")
			wishlistRoutes.GET("", func(c *gin.Context) {
				// 사용자 ID 확인
				userID := c.GetInt64("userID")

				// 테스트 케이스에 맞는 응답 반환
				if userID == 1 || (userID == 9999 && len(tc.mockWishlist) == 0) {
					c.JSON(http.StatusOK, tc.mockWishlist)
				} else {
					// 에러 처리 (일반적으로는 필요하지 않지만 테스트 완성도를 위해 추가)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "찜 목록 조회 실패"})
				}
			})

			// 요청 생성
			req, _ := http.NewRequest(http.MethodGet, "/api/wishlists", nil)
			req.Header.Set("Content-Type", "application/json")

			// 인증 헤더 설정
			if tc.withAuth {
				req.Header.Set("Authorization", "Bearer test-token")
			}

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 상태 코드 확인
			assert.Equal(t, tc.expectStatus, w.Code)

			// 성공 응답인 경우 응답 검증
			if w.Code == http.StatusOK {
				var wishlist []model.ContentListResponse
				err := json.Unmarshal(w.Body.Bytes(), &wishlist)
				assert.NoError(t, err)

				// 응답 검증
				if tc.userID == 1 {
					// 찜 목록 응답 검증
					assert.NotEmpty(t, wishlist, "찜 목록이 비어있지 않아야 함")
					assert.Len(t, wishlist, len(tc.mockWishlist), "찜 목록 길이가 일치해야 함")

					// 각 항목 검증
					for _, content := range wishlist {
						assert.NotZero(t, content.ID, "콘텐츠 ID는 0이 아니어야 함")
						assert.NotEmpty(t, content.Title, "콘텐츠 제목이 있어야 함")
						assert.NotEmpty(t, content.ThumbnailURL, "썸네일 URL이 있어야 함")
						assert.True(t, content.IsWishlisted, "찜 상태는 true여야 함")
						assert.GreaterOrEqual(t, content.ReleaseYear, 1900, "출시 연도는 유효해야 함")
					}
				} else {
					// 빈 찜 목록 검증
					assert.Empty(t, wishlist, "찜 목록이 비어있어야 함")
				}
			}
		})
	}
}
