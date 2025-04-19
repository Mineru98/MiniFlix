package route

import (
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"backend/config"
	"backend/helper"
	"backend/middleware"
	"backend/model"
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

		c.JSON(http.StatusOK, contentList)
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

		c.JSON(http.StatusOK, content)
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

		c.JSON(http.StatusOK, contentList)
	}
}

// @Summary 장르별 콘텐츠 조회
// @Description 특정 장르의 콘텐츠 목록 조회 (인증 선택)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param genreId path int true "장르 ID"
// @Param Authorization header string false "Bearer JWT 토큰"
// @Success 200 {array} model.ContentListResponse "콘텐츠 목록"
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

		c.JSON(http.StatusOK, contentList)
	}
}

// @Summary 시청 기록 업데이트
// @Description 콘텐츠 시청 기록 저장 (인증 필요)
// @Tags 콘텐츠
// @Accept json
// @Produce json
// @Param id path int true "콘텐츠 ID"
// @Param history body model.ViewingHistoryRequest true "시청 기록 정보"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Success 200 {object} map[string]interface{} "성공 메시지"
// @Failure 400 {object} map[string]interface{} "요청 데이터 오류"
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

		c.JSON(http.StatusOK, gin.H{"message": "시청 기록이 업데이트되었습니다"})
	}
} 