package route

import (
	"database/sql"
	"log"
	"net/http"

	"backend/config"
	"backend/helper"
	"backend/middleware"
	"backend/model"
	"backend/service"

	"github.com/gin-gonic/gin"
)

// SetupUserRoutes 사용자 관련 라우트 설정
func SetupUserRoutes(router *gin.RouterGroup, cfg *config.Config) {
	userRoutes := router.Group("/users")
	userRoutes.Use(middleware.AuthMiddleware(cfg))
	{
		userRoutes.GET("/profile", handleGetUserProfile(cfg))
		userRoutes.PUT("/profile", handleUpdateUserProfile(cfg))
		userRoutes.GET("/viewing-history", handleGetViewingHistory(cfg))
	}
}

// @Summary 사용자 프로필 조회
// @Description 로그인한 사용자의 프로필 정보 조회 (인증 필요)
// @Tags 사용자
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer JWT 토큰"
// @Success 200 {object} model.ApiResponse{data=model.UserResponse} "사용자 프로필 정보"
// @Failure 401 {object} model.ErrorResponse "인증 필요"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /users/profile [get]
func handleGetUserProfile(cfg *config.Config) gin.HandlerFunc {
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

		// 사용자 정보 조회
		user, err := model.GetUserByID(db.DB, userID)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusNotFound, gin.H{"error": "사용자를 찾을 수 없습니다"})
			} else {
				log.Printf("사용자 정보 조회 실패: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "사용자 정보 조회 실패"})
			}
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    user.ToUserResponse(),
		})
	}
}

// @Summary 사용자 프로필 업데이트
// @Description 로그인한 사용자의 프로필 정보 업데이트 (인증 필요)
// @Tags 사용자
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer JWT 토큰"
// @Param request body model.UpdateProfileRequest true "업데이트할 프로필 정보"
// @Success 200 {object} model.ApiResponse{data=model.UserResponse} "업데이트된 사용자 정보"
// @Failure 400 {object} model.ErrorResponse "유효하지 않은 요청"
// @Failure 401 {object} model.ErrorResponse "인증 필요"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /users/profile [put]
func handleUpdateUserProfile(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 사용자 ID 가져오기
		userID := c.GetInt64("userID")

		// 프로필 업데이트 요청 파싱
		var updateRequest model.UpdateProfileRequest
		if err := c.ShouldBindJSON(&updateRequest); err != nil {
			log.Printf("프로필 업데이트 요청 파싱 실패: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 요청"})
			return
		}

		// 데이터베이스 연결
		db, err := helper.GetDB(cfg)
		if err != nil {
			log.Printf("데이터베이스 연결 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "데이터베이스 연결 실패"})
			return
		}

		// UserService 인스턴스 생성
		userService := service.NewUserService(db)

		// 사용자 정보 업데이트
		if err := userService.UpdateUserInfo(userID, &updateRequest); err != nil {
			if err.Error() == "현재 비밀번호가 일치하지 않습니다" {
				c.JSON(http.StatusForbidden, gin.H{"error": err.Error()})
				return
			}

			log.Printf("사용자 정보 업데이트 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "사용자 정보 업데이트 실패"})
			return
		}

		// 업데이트된 사용자 정보 조회
		updatedUser, err := userService.GetUserByID(userID)
		if err != nil {
			log.Printf("업데이트된 사용자 정보 조회 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "업데이트된 사용자 정보 조회 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    updatedUser.ToUserResponse(),
		})
	}
}

// @Summary 시청 기록 조회
// @Description 로그인한 사용자의 시청 기록 조회 (인증 필요)
// @Tags 사용자
// @Accept json
// @Produce json
// @Param Authorization header string true "Bearer JWT 토큰"
// @Success 200 {object} model.ArrayResponse{data=[]model.ViewingHistoryResponse} "시청 기록 목록"
// @Failure 401 {object} model.ErrorResponse "인증 필요"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /users/viewing-history [get]
func handleGetViewingHistory(cfg *config.Config) gin.HandlerFunc {
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

		// 시청 기록 조회
		historyList, err := model.GetViewingHistory(db.DB, userID)
		if err != nil {
			log.Printf("시청 기록 조회 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "시청 기록 조회 실패"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    historyList,
		})
	}
}
