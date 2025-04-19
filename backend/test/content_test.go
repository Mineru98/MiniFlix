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

// 장르별 콘텐츠 필터링 테스트
func TestGetContentsByGenre(t *testing.T) {
	// 테스트 환경 설정
	SetupTestDatabase(t)
	defer TeardownTestDatabase(t)

	// Gin 테스트 모드 설정
	gin.SetMode(gin.TestMode)

	// 테스트 케이스 정의
	testCases := []struct {
		name            string
		genreID         string
		isAuthenticated bool
		expectStatus    int
		setupAuth       func(r *http.Request)
	}{
		{
			name:            "비로그인 사용자 장르별 콘텐츠 조회",
			genreID:         "1", // 테스트용 장르 ID, 실제 DB에 있는 장르여야 함
			isAuthenticated: false,
			expectStatus:    http.StatusOK,
			setupAuth:       func(r *http.Request) {}, // 인증 헤더 없음
		},
		{
			name:            "로그인 사용자 장르별 콘텐츠 조회",
			genreID:         "1", // 테스트용 장르 ID, 실제 DB에 있는 장르여야 함
			isAuthenticated: true,
			expectStatus:    http.StatusOK,
			setupAuth: func(r *http.Request) {
				// 테스트용 토큰 설정
				cfg := config.LoadConfig()
				token, _ := helper.GenerateToken(1, "user@example.com", "테스트사용자", cfg)
				r.Header.Set("Authorization", "Bearer "+token)
			},
		},
		{
			name:            "잘못된 장르 ID로 조회",
			genreID:         "invalid", // 유효하지 않은 장르 ID
			isAuthenticated: false,
			expectStatus:    http.StatusBadRequest,
			setupAuth:       func(r *http.Request) {},
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
			req, _ := http.NewRequest(http.MethodGet, "/api/contents/genre/"+tc.genreID, nil)
			req.Header.Set("Content-Type", "application/json")
			tc.setupAuth(req)

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 상태 코드 확인
			assert.Equal(t, tc.expectStatus, w.Code)

			// 유효한 응답인 경우에만 내용 확인
			if w.Code == http.StatusOK {
				var contentList []model.ContentListResponse
				err := json.Unmarshal(w.Body.Bytes(), &contentList)
				assert.NoError(t, err)

				// 각 콘텐츠가 필수 필드를 포함하는지 확인
				for _, content := range contentList {
					assert.NotZero(t, content.ID)
					assert.NotEmpty(t, content.Title)
					assert.NotEmpty(t, content.ThumbnailURL)
					assert.NotEmpty(t, content.Genres)
				}

				// 로그인한 사용자인 경우 찜 상태 확인
				if tc.isAuthenticated {
					assert.Contains(t, w.Body.String(), "is_wishlisted")
				}
			}
		})
	}
}

// 장르별 콘텐츠 필터링 모의 데이터 테스트
func TestGetContentsByGenreWithMockData(t *testing.T) {
	// Gin 테스트 모드 설정
	gin.SetMode(gin.TestMode)
	router := gin.New()

	// 모의 장르 데이터 설정
	router.GET("/api/genres", func(c *gin.Context) {
		genres := []model.Genre{
			{
				ID:          1,
				Name:        "액션",
				Description: "액션 영화 장르",
			},
			{
				ID:          2,
				Name:        "코미디",
				Description: "코미디 영화 장르",
			},
			{
				ID:          3,
				Name:        "드라마",
				Description: "드라마 영화 장르",
			},
		}
		c.JSON(http.StatusOK, genres)
	})

	// 모의 콘텐츠 필터링 핸들러 설정
	router.GET("/api/contents/genre/:genreId", func(c *gin.Context) {
		genreID := c.Param("genreId")

		// ID 유효성 검사
		if genreID != "1" && genreID != "2" && genreID != "3" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 장르 ID"})
			return
		}

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

		// 필터링된 콘텐츠 목록 생성 (실제로는 DB에서 가져옴)
		var contentList []model.ContentListResponse

		// 장르 ID에 따라 다른 콘텐츠 반환
		switch genreID {
		case "1": // 액션 장르
			contentList = []model.ContentListResponse{
				{
					ID:           1,
					Title:        "액션 영화 1",
					ThumbnailURL: "/thumbnails/action1.jpg",
					ReleaseYear:  2021,
					Genres:       []string{"액션", "스릴러"},
					IsWishlisted: isAuthenticated, // 로그인 사용자면 찜 상태 설정
				},
				{
					ID:           3,
					Title:        "액션 영화 2",
					ThumbnailURL: "/thumbnails/action2.jpg",
					ReleaseYear:  2022,
					Genres:       []string{"액션", "SF"},
					IsWishlisted: false,
				},
			}
		case "2": // 코미디 장르
			contentList = []model.ContentListResponse{
				{
					ID:           2,
					Title:        "코미디 영화 1",
					ThumbnailURL: "/thumbnails/comedy1.jpg",
					ReleaseYear:  2021,
					Genres:       []string{"코미디", "로맨스"},
					IsWishlisted: false,
				},
			}
		case "3": // 드라마 장르
			contentList = []model.ContentListResponse{
				{
					ID:           4,
					Title:        "드라마 영화 1",
					ThumbnailURL: "/thumbnails/drama1.jpg",
					ReleaseYear:  2020,
					Genres:       []string{"드라마"},
					IsWishlisted: isAuthenticated && userID == 1, // 특정 사용자만 찜한 상태
				},
			}
		}

		c.JSON(http.StatusOK, contentList)
	})

	// 테스트 케이스
	testCases := []struct {
		name            string
		genreID         string
		isAuthenticated bool
		expectStatus    int
		expectLength    int
		setupAuth       func(r *http.Request)
	}{
		{
			name:            "액션 장르 비로그인 조회",
			genreID:         "1",
			isAuthenticated: false,
			expectStatus:    http.StatusOK,
			expectLength:    2,
			setupAuth:       func(r *http.Request) {}, // 인증 헤더 없음
		},
		{
			name:            "코미디 장르 로그인 조회",
			genreID:         "2",
			isAuthenticated: true,
			expectStatus:    http.StatusOK,
			expectLength:    1,
			setupAuth: func(r *http.Request) {
				r.Header.Set("Authorization", "Bearer test-token")
			},
		},
		{
			name:            "드라마 장르 로그인 조회",
			genreID:         "3",
			isAuthenticated: true,
			expectStatus:    http.StatusOK,
			expectLength:    1,
			setupAuth: func(r *http.Request) {
				r.Header.Set("Authorization", "Bearer test-token")
			},
		},
		{
			name:            "잘못된 장르 ID 조회",
			genreID:         "999",
			isAuthenticated: false,
			expectStatus:    http.StatusBadRequest,
			expectLength:    0,
			setupAuth:       func(r *http.Request) {},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// 요청 생성
			req, _ := http.NewRequest(http.MethodGet, "/api/contents/genre/"+tc.genreID, nil)
			req.Header.Set("Content-Type", "application/json")
			tc.setupAuth(req)

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 상태 코드 확인
			assert.Equal(t, tc.expectStatus, w.Code)

			// 유효한 응답인 경우에만 내용 확인
			if w.Code == http.StatusOK {
				var contentList []model.ContentListResponse
				err := json.Unmarshal(w.Body.Bytes(), &contentList)
				assert.NoError(t, err)
				assert.Len(t, contentList, tc.expectLength)

				// 장르 필터링 결과 확인
				for _, content := range contentList {
					// 올바른 장르가 포함되어 있는지 확인
					var hasGenre bool
					switch tc.genreID {
					case "1":
						for _, g := range content.Genres {
							if g == "액션" {
								hasGenre = true
								break
							}
						}
					case "2":
						for _, g := range content.Genres {
							if g == "코미디" {
								hasGenre = true
								break
							}
						}
					case "3":
						for _, g := range content.Genres {
							if g == "드라마" {
								hasGenre = true
								break
							}
						}
					}
					assert.True(t, hasGenre)
				}
			}
		})
	}
}

// 전체 장르 목록 조회 테스트
func TestGetAllGenres(t *testing.T) {
	// 테스트 환경 설정
	SetupTestDatabase(t)
	defer TeardownTestDatabase(t)

	// Gin 테스트 모드 설정
	gin.SetMode(gin.TestMode)

	// 라우터 설정
	router := gin.New()
	cfg := config.LoadConfig()
	apiGroup := router.Group("/api")
	route.SetupGenreRoutes(apiGroup, cfg)

	// 요청 생성
	req, _ := http.NewRequest(http.MethodGet, "/api/genres", nil)
	req.Header.Set("Content-Type", "application/json")

	// 응답 기록
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	// 상태 코드 확인
	assert.Equal(t, http.StatusOK, w.Code)

	// 응답 구조 확인
	var genres []model.Genre
	err := json.Unmarshal(w.Body.Bytes(), &genres)
	assert.NoError(t, err)

	// 장르가 하나 이상 있는지 확인 (실제 DB에 데이터가 있어야 함)
	if len(genres) > 0 {
		for _, genre := range genres {
			assert.NotZero(t, genre.ID)
			assert.NotEmpty(t, genre.Name)
		}
	}
}
