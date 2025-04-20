package route

import (
	"log"
	"net/http"
	"strconv"

	"backend/config"
	"backend/helper"
	"backend/middleware"
	"backend/model"
	"backend/service"

	"github.com/gin-gonic/gin"
)

// SetupContentRoutes 콘텐츠 관련 라우트 설정
func SetupContentRoutes(router *gin.RouterGroup, cfg *config.Config) {
	contentRoutes := router.Group("/contents")
	{
		// 비로그인 상태에서도 접근 가능한 라우트
		contentRoutes.GET("", middleware.OptionalAuthMiddleware(cfg), handleGetContentList(cfg))
		contentRoutes.GET("/:id", middleware.OptionalAuthMiddleware(cfg), handleGetContentDetail(cfg))
		contentRoutes.GET("/search", middleware.OptionalAuthMiddleware(cfg), handleSearchContents(cfg))
		contentRoutes.GET("/genre/:genreId", middleware.OptionalAuthMiddleware(cfg), handleGetContentsByGenre(cfg))

		// 인증이 필요한 라우트
		contentRoutes.POST("/:id/history", middleware.AuthMiddleware(cfg), handleUpdateViewingHistory(cfg))

		// 스트리밍 관련 라우트
		contentRoutes.GET("/:id/stream", middleware.AuthMiddleware(cfg), handleStreamContent(cfg))
		contentRoutes.POST("/:id/playback", middleware.AuthMiddleware(cfg), handleUpdatePlaybackPosition(cfg))
		contentRoutes.POST("/:id/final-position", middleware.AuthMiddleware(cfg), handleSaveFinalPosition(cfg))
	}
}

// SetupContentRoutesWithMockService 테스트를 위한 콘텐츠 라우트 설정 (모의 서비스 사용)
func SetupContentRoutesWithMockService(router *gin.RouterGroup, cfg *config.Config, mockContentService interface{}) {
	contentRoutes := router.Group("/contents")
	{
		// 스트리밍 관련 라우트 (모의 서비스 사용)
		contentRoutes.GET("/:id/stream", middleware.AuthMiddleware(cfg), handleStreamContentWithMock(cfg, mockContentService))
		contentRoutes.POST("/:id/playback", middleware.AuthMiddleware(cfg), handleUpdatePlaybackPositionWithMock(cfg, mockContentService))
		contentRoutes.POST("/:id/final-position", middleware.AuthMiddleware(cfg), handleSaveFinalPositionWithMock(cfg, mockContentService))
	}
}

// @Summary 콘텐츠 목록 조회
// @Description 모든 콘텐츠 목록 조회 (인증 선택)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param Authorization header string false "Bearer JWT 토큰"
// @Param page query int false "페이지 번호 (기본값: 0)"
// @Param size query int false "페이지당 항목 수 (기본값: 10)"
// @Success 200 {object} model.PagingResponse "콘텐츠 목록"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /contents [get]
func handleGetContentList(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 페이징 파라미터 처리
		page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
		if err != nil || page < 0 {
			page = 0
		}

		size, err := strconv.Atoi(c.DefaultQuery("size", "10"))
		if err != nil || size <= 0 {
			size = 10
		}

		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 인증된 사용자인지 확인
		var userID int64
		if isAuthenticated, exists := c.Get("isAuthenticated"); exists && isAuthenticated.(bool) {
			userID = c.GetInt64("userID")
		}

		// 콘텐츠 목록 조회 (페이징 적용)
		pageInfo, err := model.GetContentList(db.DB, userID, page, size)
		if err != nil {
			log.Printf("콘텐츠 목록 조회 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "콘텐츠 목록 조회 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    pageInfo,
		})
	}
}

// @Summary 콘텐츠 상세 정보 조회
// @Description 특정 콘텐츠의 상세 정보 조회 (인증 선택)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param Authorization header string false "Bearer JWT 토큰"
// @Success 200 {object} model.ApiResponse{data=model.ContentDetailResponse} "콘텐츠 상세 정보"
// @Failure 404 {object} model.ErrorResponse "콘텐츠 없음"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /contents/{id} [get]
func handleGetContentDetail(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 콘텐츠 ID 파싱
		contentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
			return
		}

		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 인증된 사용자인지 확인
		var userID int64
		if isAuthenticated, exists := c.Get("isAuthenticated"); exists && isAuthenticated.(bool) {
			userID = c.GetInt64("userID")
		}

		// 콘텐츠 상세 정보 조회
		content, err := model.GetContentDetail(db.DB, contentID, userID)
		if err != nil {
			log.Printf("콘텐츠 상세 정보 조회 실패: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "콘텐츠를 찾을 수 없습니다"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    content,
		})
	}
}

// @Summary 콘텐츠 검색
// @Description 제목으로 콘텐츠 검색 (인증 선택)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param q query string true "검색어"
// @Param Authorization header string false "Bearer JWT 토큰"
// @Param page query int false "페이지 번호 (기본값: 0)"
// @Param size query int false "페이지당 항목 수 (기본값: 10)"
// @Success 200 {object} model.PagingResponse "검색 결과"
// @Failure 400 {object} model.ErrorResponse "잘못된 요청"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /contents/search [get]
func handleSearchContents(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 검색어 가져오기
		query := c.Query("q")
		if query == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "검색어가 필요합니다"})
			return
		}

		// 페이징 파라미터 처리
		page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
		if err != nil || page < 0 {
			page = 0
		}

		size, err := strconv.Atoi(c.DefaultQuery("size", "10"))
		if err != nil || size <= 0 {
			size = 10
		}

		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 인증된 사용자인지 확인
		var userID int64
		if isAuthenticated, exists := c.Get("isAuthenticated"); exists && isAuthenticated.(bool) {
			userID = c.GetInt64("userID")
		}

		// 검색 쿼리 실행 (페이징 적용)
		pageInfo, err := model.SearchContents(db.DB, query, userID, page, size)
		if err != nil {
			log.Printf("콘텐츠 검색 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "콘텐츠 검색 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    pageInfo,
		})
	}
}

// @Summary 장르별 콘텐츠 조회
// @Description 특정 장르의 콘텐츠 목록 조회 (인증 선택)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param genreId path int true "장르 ID"
// @Param Authorization header string false "Bearer JWT 토큰"
// @Param page query int false "페이지 번호 (기본값: 0)"
// @Param size query int false "페이지당 항목 수 (기본값: 10)"
// @Success 200 {object} model.PagingResponse "장르별 콘텐츠 목록"
// @Failure 400 {object} model.ErrorResponse "잘못된 요청"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /contents/genre/{genreId} [get]
func handleGetContentsByGenre(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 장르 ID 파싱
		genreID, err := strconv.ParseInt(c.Param("genreId"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 장르 ID"})
			return
		}

		// 페이징 파라미터 처리
		page, err := strconv.Atoi(c.DefaultQuery("page", "0"))
		if err != nil || page < 0 {
			page = 0
		}

		size, err := strconv.Atoi(c.DefaultQuery("size", "10"))
		if err != nil || size <= 0 {
			size = 10
		}

		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 인증된 사용자인지 확인
		var userID int64
		if isAuthenticated, exists := c.Get("isAuthenticated"); exists && isAuthenticated.(bool) {
			userID = c.GetInt64("userID")
		}

		// 장르별 콘텐츠 조회 (페이징 적용)
		pageInfo, err := model.GetContentsByGenre(db.DB, genreID, userID, page, size)
		if err != nil {
			log.Printf("장르별 콘텐츠 조회 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "장르별 콘텐츠 조회 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    pageInfo,
		})
	}
}

// @Summary 콘텐츠 스트리밍
// @Description 특정 콘텐츠의 스트리밍 URL 조회 (인증 필요)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Success 200 {object} model.ApiResponse{data=model.StreamingResponse} "스트리밍 정보"
// @Failure 400 {object} model.ErrorResponse "유효하지 않은 콘텐츠 ID"
// @Failure 401 {object} model.ErrorResponse "인증 필요"
// @Failure 404 {object} model.ErrorResponse "콘텐츠 없음"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /contents/{id}/stream [get]
func handleStreamContent(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 콘텐츠 ID 파싱
		contentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
			return
		}

		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 사용자 ID 가져오기
		userID := c.GetInt64("userID")

		// 콘텐츠 서비스 생성
		contentService := service.NewContentService(db.DB)

		// 스트리밍 URL 조회
		response, err := contentService.GetStreamingURL(contentID, userID)
		if err != nil {
			log.Printf("스트리밍 URL 조회 실패: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "콘텐츠를 찾을 수 없습니다"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    response,
		})
	}
}

// @Summary 재생 위치 업데이트
// @Description 콘텐츠 시청 중 재생 위치 업데이트 (인증 필요)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Param position body model.PlaybackPositionRequest true "재생 위치 정보"
// @Success 200 {object} model.ApiResponse "업데이트 성공"
// @Failure 400 {object} model.ErrorResponse "유효하지 않은 요청"
// @Failure 401 {object} model.ErrorResponse "인증 필요"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /contents/{id}/playback [post]
func handleUpdatePlaybackPosition(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 콘텐츠 ID 파싱
		contentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
			return
		}

		// 요청 데이터 파싱
		var req model.PlaybackPositionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 요청 데이터", "details": err.Error()})
			return
		}

		// 요청 데이터와 URL 경로의 콘텐츠 ID 일치 확인
		if req.ContentID != contentID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "요청 데이터와 URL 경로의 콘텐츠 ID가 일치하지 않습니다"})
			return
		}

		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 사용자 ID 가져오기
		userID := c.GetInt64("userID")

		// 콘텐츠 서비스 생성
		contentService := service.NewContentService(db.DB)

		// 재생 위치 업데이트
		if err := contentService.UpdatePlaybackPosition(userID, &req); err != nil {
			log.Printf("재생 위치 업데이트 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "재생 위치 업데이트 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"message": "재생 위치가 업데이트되었습니다",
			},
		})
	}
}

// @Summary 최종 시청 위치 저장
// @Description 콘텐츠 시청 종료 시 최종 위치 저장 (인증 필요)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Param position body model.FinalPositionRequest true "최종 위치 정보"
// @Success 200 {object} model.ApiResponse "저장 성공"
// @Failure 400 {object} model.ErrorResponse "유효하지 않은 요청"
// @Failure 401 {object} model.ErrorResponse "인증 필요"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /contents/{id}/final-position [post]
func handleSaveFinalPosition(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 콘텐츠 ID 파싱
		contentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
			return
		}

		// 요청 데이터 파싱
		var req model.FinalPositionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 요청 데이터", "details": err.Error()})
			return
		}

		// 요청 데이터와 URL 경로의 콘텐츠 ID 일치 확인
		if req.ContentID != contentID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "요청 데이터와 URL 경로의 콘텐츠 ID가 일치하지 않습니다"})
			return
		}

		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 사용자 ID 가져오기
		userID := c.GetInt64("userID")

		// 콘텐츠 서비스 생성
		contentService := service.NewContentService(db.DB)

		// 최종 재생 위치 저장
		if err := contentService.SaveFinalPosition(userID, &req); err != nil {
			log.Printf("최종 재생 위치 저장 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "최종 재생 위치 저장 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"message": "최종 재생 위치가 저장되었습니다",
			},
		})
	}
}

// @Summary 시청 기록 업데이트
// @Description 콘텐츠 시청 기록 추가/업데이트 (인증 필요)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Param history body model.ViewingHistoryRequest true "시청 기록 정보"
// @Success 200 {object} model.ApiResponse "업데이트 성공"
// @Failure 400 {object} model.ErrorResponse "유효하지 않은 요청"
// @Failure 401 {object} model.ErrorResponse "인증 필요"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /contents/{id}/history [post]
func handleUpdateViewingHistory(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 콘텐츠 ID 파싱
		contentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
			return
		}

		// 요청 데이터 파싱
		var req model.ViewingHistoryRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 요청 데이터", "details": err.Error()})
			return
		}

		// 요청 데이터와 URL 경로의 콘텐츠 ID 일치 확인
		if req.ContentID != contentID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "요청 데이터와 URL 경로의 콘텐츠 ID가 일치하지 않습니다"})
			return
		}

		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 사용자 ID 가져오기
		userID := c.GetInt64("userID")

		// 시청 기록 업데이트
		if err := model.UpdateViewingHistory(db.DB, userID, &req); err != nil {
			log.Printf("시청 기록 업데이트 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "시청 기록 업데이트 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"message": "시청 기록이 업데이트되었습니다",
			},
		})
	}
}

// 모의 서비스를 사용하는 스트리밍 핸들러
func handleStreamContentWithMock(cfg *config.Config, mockService interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 콘텐츠 ID 파싱
		contentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
			return
		}

		// 사용자 ID 가져오기
		userID := c.GetInt64("userID")

		// 모의 서비스 메서드 호출
		contentService, ok := mockService.(interface {
			GetStreamingURL(contentID int64, userID int64) (*model.StreamingResponse, error)
		})
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "모의 서비스 유형 오류"})
			return
		}

		// 스트리밍 URL 조회
		response, err := contentService.GetStreamingURL(contentID, userID)
		if err != nil {
			log.Printf("스트리밍 URL 조회 실패: %v", err)
			c.JSON(http.StatusNotFound, gin.H{"error": "콘텐츠를 찾을 수 없습니다"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    response,
		})
	}
}

// 모의 서비스를 사용하는 재생 위치 업데이트 핸들러
func handleUpdatePlaybackPositionWithMock(cfg *config.Config, mockService interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 콘텐츠 ID 파싱
		contentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
			return
		}

		// 요청 데이터 파싱
		var req model.PlaybackPositionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 요청 데이터", "details": err.Error()})
			return
		}

		// 요청 데이터와 URL 경로의 콘텐츠 ID 일치 확인
		if req.ContentID != contentID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "요청 데이터와 URL 경로의 콘텐츠 ID가 일치하지 않습니다"})
			return
		}

		// 사용자 ID 가져오기
		userID := c.GetInt64("userID")

		// 모의 서비스 메서드 호출
		contentService, ok := mockService.(interface {
			UpdatePlaybackPosition(req *model.PlaybackPositionRequest, userID int64) error
		})
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "모의 서비스 유형 오류"})
			return
		}

		// 재생 위치 업데이트
		if err := contentService.UpdatePlaybackPosition(&req, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "재생 위치 업데이트 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"message": "재생 위치가 업데이트되었습니다",
			},
		})
	}
}

// 모의 서비스를 사용하는 최종 재생 위치 저장 핸들러
func handleSaveFinalPositionWithMock(cfg *config.Config, mockService interface{}) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 콘텐츠 ID 파싱
		contentID, err := strconv.ParseInt(c.Param("id"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 콘텐츠 ID"})
			return
		}

		// 요청 데이터 파싱
		var req model.FinalPositionRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 요청 데이터", "details": err.Error()})
			return
		}

		// 요청 데이터와 URL 경로의 콘텐츠 ID 일치 확인
		if req.ContentID != contentID {
			c.JSON(http.StatusBadRequest, gin.H{"error": "요청 데이터와 URL 경로의 콘텐츠 ID가 일치하지 않습니다"})
			return
		}

		// 사용자 ID 가져오기
		userID := c.GetInt64("userID")

		// 모의 서비스 메서드 호출
		contentService, ok := mockService.(interface {
			SaveFinalPosition(req *model.FinalPositionRequest, userID int64) error
		})
		if !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "모의 서비스 유형 오류"})
			return
		}

		// 최종 재생 위치 저장
		if err := contentService.SaveFinalPosition(&req, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "최종 재생 위치 저장 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"message": "최종 재생 위치가 저장되었습니다",
			},
		})
	}
}
