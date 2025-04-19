package route

import (
	"log"
	"net/http"
	"strconv"

	"backend/config"
	"backend/helper"
	"backend/middleware"
	"backend/model"

	"github.com/gin-gonic/gin"
)

// SetupWishlistRoutes 찜 목록 관련 라우트 설정
func SetupWishlistRoutes(router *gin.RouterGroup, cfg *config.Config) {
	wishlistRoutes := router.Group("/wishlists")
	wishlistRoutes.Use(middleware.AuthMiddleware(cfg))
	{
		wishlistRoutes.GET("", handleGetWishlist(cfg))
		wishlistRoutes.POST("/:contentId", handleToggleWishlist(cfg))
	}
}

// @Summary 찜 목록 조회
// @Description 로그인한 사용자의 찜 목록 조회
// @Tags 찜 목록
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer JWT 토큰"
// @Success 200 {array} model.ContentListResponse "찜 목록"
// @Failure 401 {object} map[string]interface{} "인증 실패"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /wishlists [get]
func handleGetWishlist(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// 사용자 ID 가져오기
		userID := c.GetInt64("userID")

		// 찜 목록 조회
		wishlist, err := model.GetWishlist(db.DB, userID)
		if err != nil {
			log.Printf("찜 목록 조회 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "찜 목록 조회 실패"})
			return
		}

		c.JSON(http.StatusOK, wishlist)
	}
}

// @Summary 찜하기/취소
// @Description 콘텐츠 찜하기 또는 찜 취소
// @Tags 찜 목록
// @Accept json
// @Produce json
// @Param contentId path int true "콘텐츠 ID"
// @Param Authorization header string true "Bearer JWT 토큰"
// @Success 200 {object} model.WishlistToggleResponse "찜 상태"
// @Failure 400 {object} map[string]interface{} "요청 데이터 오류"
// @Failure 401 {object} map[string]interface{} "인증 실패"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /wishlists/{contentId} [post]
func handleToggleWishlist(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 콘텐츠 ID 파싱
		contentID, err := strconv.ParseInt(c.Param("contentId"), 10, 64)
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

		// 찜하기/취소
		isWishlisted, err := model.ToggleWishlist(db.DB, userID, contentID)
		if err != nil {
			log.Printf("찜하기/취소 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "찜하기/취소 처리 실패"})
			return
		}

		response := model.WishlistToggleResponse{
			IsWishlisted: isWishlisted,
		}

		if isWishlisted {
			response.Message = "콘텐츠가 찜 목록에 추가되었습니다"
		} else {
			response.Message = "콘텐츠가 찜 목록에서 제거되었습니다"
		}

		c.JSON(http.StatusOK, response)
	}
}
