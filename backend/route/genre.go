package route

import (
	"log"
	"net/http"

	"backend/config"
	"backend/helper"

	"github.com/gin-gonic/gin"
)

// SetupGenreRoutes 장르 관련 라우트 설정
func SetupGenreRoutes(router *gin.RouterGroup, cfg *config.Config) {
	genreRoutes := router.Group("/genres")
	{
		genreRoutes.GET("", handleGetAllGenres(cfg))
	}
}

// @Summary 모든 장르 목록 조회
// @Description 모든 장르 정보 목록 조회
// @Tags 장르
// @Accept json
// @Produce json
// @Success 200 {array} model.Genre "장르 목록"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /genres [get]
func handleGetAllGenres(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 장르 목록 조회
		rows, err := db.Query("SELECT id, name, description FROM Genres ORDER BY name")
		if err != nil {
			log.Printf("장르 목록 조회 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "장르 목록 조회 실패"})
			return
		}
		defer rows.Close()

		genres := []gin.H{}
		for rows.Next() {
			var id int64
			var name, description string
			if err := rows.Scan(&id, &name, &description); err != nil {
				log.Printf("장르 정보 처리 실패: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "장르 정보 처리 실패"})
				return
			}
			genres = append(genres, gin.H{
				"id":          id,
				"name":        name,
				"description": description,
			})
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    genres,
		})
	}
}
