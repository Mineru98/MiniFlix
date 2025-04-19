package route

import (
	"database/sql"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"backend/config"
	"backend/helper"
	"backend/model"
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

		// 이메일 중복 확인
		var count int
		err = db.QueryRow("SELECT COUNT(*) FROM Users WHERE email = ?", req.Email).Scan(&count)
		if err != nil {
			log.Printf("이메일 중복 확인 실패: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "이메일 중복 확인 실패"})
			return
		}

		if count > 0 {
			c.JSON(http.StatusConflict, gin.H{"error": "이미 등록된 이메일입니다"})
			return
		}

		// 사용자 생성
		user, err := model.CreateUser(db.DB, &req)
		if err != nil {
			log.Printf("사용자 생성 실패: %v", err)
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

		// 사용자 조회
		user, err := model.GetUserByEmail(db.DB, req.Email)
		if err != nil {
			if err == sql.ErrNoRows {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "이메일 또는 비밀번호가 올바르지 않습니다"})
			} else {
				log.Printf("사용자 조회 실패: %v", err)
				c.JSON(http.StatusInternalServerError, gin.H{"error": "로그인 처리 실패"})
			}
			return
		}

		// 계정 활성화 상태 확인
		if !user.IsActive {
			c.JSON(http.StatusForbidden, gin.H{"error": "비활성화된 계정입니다"})
			return
		}

		// 비밀번호 확인
		if !model.CheckPasswordHash(req.Password, user.Password) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "이메일 또는 비밀번호가 올바르지 않습니다"})
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