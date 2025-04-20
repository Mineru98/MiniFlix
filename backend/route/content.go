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
// @Success 200 {array} model.ContentListResponse "콘텐츠 목록"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /contents [get]
func handleGetContentList(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
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

		// 콘텐츠 목록 조회
		contentList, err := model.GetContentList(db.DB, userID)
		if err != nil {
			log.Printf("콘텐츠 목록 조회 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "콘텐츠 목록 조회 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    contentList,
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
// @Success 200 {object} model.ContentDetailResponse "콘텐츠 상세 정보"
// @Failure 404 {object} map[string]interface{} "콘텐츠 없음"
// @Failure 500 {object} map[string]interface{} "서버 오류"
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
// @Success 200 {array} model.ContentListResponse "검색 결과"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /contents/search [get]
func handleSearchContents(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 검색어 가져오기
		query := c.Query("q")
		if query == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "검색어가 필요합니다"})
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

		// 검색 쿼리 실행
		rows, err := db.Query(`
			SELECT 
				c.id, c.title, c.thumbnail_url, c.release_year
			FROM 
				Contents c
			WHERE 
				c.title LIKE ?
			ORDER BY 
				c.release_year DESC, c.title ASC
		`, "%"+query+"%")
		if err != nil {
			log.Printf("콘텐츠 검색 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "콘텐츠 검색 실패"})
			return
		}
		defer rows.Close()

		contentList := []model.ContentListResponse{}
		contentIDs := []int64{}

		// 기본 콘텐츠 정보 읽기
		for rows.Next() {
			var content model.ContentListResponse
			if err := rows.Scan(&content.ID, &content.Title, &content.ThumbnailURL, &content.ReleaseYear); err != nil {
				log.Printf("검색 결과 처리 실패: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "검색 결과 처리 실패"})
				return
			}
			contentList = append(contentList, content)
			contentIDs = append(contentIDs, content.ID)
		}

		// 각 콘텐츠의 장르 정보 조회
		for i, contentID := range contentIDs {
			genreRows, err := db.Query(`
				SELECT 
					g.name
				FROM 
					Genres g
				JOIN 
					ContentGenres cg ON g.id = cg.genre_id
				WHERE 
					cg.content_id = ?
			`, contentID)
			if err != nil {
				log.Printf("장르 정보 조회 실패: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "장르 정보 조회 실패"})
				return
			}

			var genres []string
			for genreRows.Next() {
				var genreName string
				if err := genreRows.Scan(&genreName); err != nil {
					genreRows.Close()
					log.Printf("장르 정보 처리 실패: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "장르 정보 처리 실패"})
					return
				}
				genres = append(genres, genreName)
			}
			genreRows.Close()
			contentList[i].Genres = genres
		}

		// 로그인한 사용자가 있는 경우 찜 정보 조회
		if userID > 0 {
			for i, contentID := range contentIDs {
				var count int
				err := db.QueryRow(`
					SELECT 
						COUNT(*)
					FROM 
						Wishlists
					WHERE 
						user_id = ? AND content_id = ?
				`, userID, contentID).Scan(&count)

				if err != nil {
					log.Printf("찜 상태 조회 실패: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "찜 상태 조회 실패"})
					return
				}

				contentList[i].IsWishlisted = count > 0
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    contentList,
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
// @Success 200 {array} model.ContentListResponse "장르별 필터링된 콘텐츠 목록"
// @Failure 400 {object} map[string]interface{} "잘못된 장르 ID"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /contents/genre/{genreId} [get]
func handleGetContentsByGenre(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 장르 ID 파싱
		genreID, err := strconv.ParseInt(c.Param("genreId"), 10, 64)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 장르 ID"})
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

		// 장르별 콘텐츠 조회
		rows, err := db.Query(`
			SELECT 
				c.id, c.title, c.thumbnail_url, c.release_year
			FROM 
				Contents c
			JOIN 
				ContentGenres cg ON c.id = cg.content_id
			WHERE 
				cg.genre_id = ?
			ORDER BY 
				c.release_year DESC, c.title ASC
		`, genreID)
		if err != nil {
			log.Printf("장르별 콘텐츠 조회 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "장르별 콘텐츠 조회 실패"})
			return
		}
		defer rows.Close()

		contentList := []model.ContentListResponse{}
		contentIDs := []int64{}

		// 기본 콘텐츠 정보 읽기
		for rows.Next() {
			var content model.ContentListResponse
			if err := rows.Scan(&content.ID, &content.Title, &content.ThumbnailURL, &content.ReleaseYear); err != nil {
				log.Printf("콘텐츠 정보 처리 실패: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "콘텐츠 정보 처리 실패"})
				return
			}
			contentList = append(contentList, content)
			contentIDs = append(contentIDs, content.ID)
		}

		// 각 콘텐츠의 장르 정보 조회
		for i, contentID := range contentIDs {
			genreRows, err := db.Query(`
				SELECT 
					g.name
				FROM 
					Genres g
				JOIN 
					ContentGenres cg ON g.id = cg.genre_id
				WHERE 
					cg.content_id = ?
			`, contentID)
			if err != nil {
				log.Printf("장르 정보 조회 실패: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "장르 정보 조회 실패"})
				return
			}

			var genres []string
			for genreRows.Next() {
				var genreName string
				if err := genreRows.Scan(&genreName); err != nil {
					genreRows.Close()
					log.Printf("장르 정보 처리 실패: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "장르 정보 처리 실패"})
					return
				}
				genres = append(genres, genreName)
			}
			genreRows.Close()
			contentList[i].Genres = genres
		}

		// 로그인한 사용자가 있는 경우 찜 정보 조회
		if userID > 0 {
			for i, contentID := range contentIDs {
				var count int
				err := db.QueryRow(`
					SELECT 
						COUNT(*)
					FROM 
						Wishlists
					WHERE 
						user_id = ? AND content_id = ?
				`, userID, contentID).Scan(&count)

				if err != nil {
					log.Printf("찜 상태 조회 실패: %v", err)
					c.JSON(http.StatusInternalServerError, gin.H{"error": "찜 상태 조회 실패"})
					return
				}

				contentList[i].IsWishlisted = count > 0
			}
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    contentList,
		})
	}
}

// @Summary 콘텐츠 스트리밍 요청
// @Description 콘텐츠 스트리밍을 위한 정보 조회 (인증 필요)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Success 200 {object} model.StreamingResponse "스트리밍 정보"
// @Failure 401 {object} map[string]interface{} "인증 실패"
// @Failure 404 {object} map[string]interface{} "콘텐츠 없음"
// @Failure 500 {object} map[string]interface{} "서버 오류"
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
// @Description 콘텐츠 재생 중 주기적으로 위치 업데이트 (인증 필요)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Param request body model.PlaybackPositionRequest true "재생 위치 정보"
// @Success 200 {object} map[string]interface{} "업데이트 성공"
// @Failure 400 {object} map[string]interface{} "유효하지 않은 요청"
// @Failure 401 {object} map[string]interface{} "인증 실패"
// @Failure 500 {object} map[string]interface{} "서버 오류"
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

// @Summary 최종 재생 위치 저장
// @Description 콘텐츠 시청 종료 시 최종 위치 저장 (인증 필요)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Param request body model.FinalPositionRequest true "최종 재생 위치 정보"
// @Success 200 {object} map[string]interface{} "저장 성공"
// @Failure 400 {object} map[string]interface{} "유효하지 않은 요청"
// @Failure 401 {object} map[string]interface{} "인증 실패"
// @Failure 500 {object} map[string]interface{} "서버 오류"
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
// @Description 시청 기록 업데이트 (인증 필요)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Param request body model.ViewingHistoryRequest true "시청 기록 정보"
// @Success 200 {object} map[string]interface{} "업데이트 성공"
// @Failure 400 {object} map[string]interface{} "유효하지 않은 요청"
// @Failure 401 {object} map[string]interface{} "인증 실패"
// @Failure 500 {object} map[string]interface{} "서버 오류"
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
