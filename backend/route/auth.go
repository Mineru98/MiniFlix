package route

import (
	"log"
	"net/http"

	"backend/config"
	"backend/helper"
	"backend/model"
	"backend/service"

	"github.com/gin-gonic/gin"
)

// SetupAuthRoutes 인증 관련 라우트 설정
func SetupAuthRoutes(router *gin.RouterGroup, cfg *config.Config) {
	authRoutes := router.Group("/auth")
	{
		authRoutes.POST("/register", handleRegister(cfg))
		authRoutes.POST("/login", handleLogin(cfg))
	}
}

// @Summary 회원가입
// @Description 새 사용자 등록
// @Tags 인증
// @Accept json
// @Produce json
// @Param user body model.UserRegisterRequest true "사용자 등록 정보"
// @Success 201 {object} model.UserResponse "등록된 사용자 정보"
// @Failure 400 {object} map[string]interface{} "요청 데이터 오류"
// @Failure 409 {object} map[string]interface{} "이메일 중복"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /auth/register [post]
func handleRegister(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req model.UserRegisterRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 요청 데이터", "details": err.Error()})
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

		// 사용자 등록
		user, err := userService.Register(&req)
		if err != nil {
			// 이메일 중복 오류 처리
			if err.Error() == "이미 등록된 이메일입니다" {
				c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
				return
			}

			log.Printf("사용자 등록 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "사용자 등록 실패"})
			return
		}

		// 응답 반환
		c.JSON(http.StatusCreated, user.ToUserResponse())
	}
}

// @Summary 로그인
// @Description 사용자 로그인 및 토큰 발급
// @Tags 인증
// @Accept json
// @Produce json
// @Param credentials body model.UserLoginRequest true "로그인 정보"
// @Success 200 {object} map[string]interface{} "토큰 및 사용자 정보"
// @Failure 400 {object} map[string]interface{} "요청 데이터 오류"
// @Failure 401 {object} map[string]interface{} "인증 실패"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /auth/login [post]
func handleLogin(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req model.UserLoginRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 요청 데이터", "details": err.Error()})
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

		// 로그인 검증
		user, err := userService.ValidateLogin(&req)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		// JWT 토큰 생성
		token, err := helper.GenerateToken(user.ID, user.Name, user.Email, cfg)
		if err != nil {
			log.Printf("토큰 생성 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "토큰 생성 실패"})
			return
		}

		// 응답 반환
		c.JSON(http.StatusOK, gin.H{
			"token": token,
			"user":  user.ToUserResponse(),
		})
	}
}
