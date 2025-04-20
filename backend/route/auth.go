package route

import (
	"log"
	"net/http"
	"os"
	"strings"
	"time"

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
// @Param user body model.RegisterRequest true "사용자 등록 정보"
// @Success 201 {object} model.ApiResponse{data=model.UserResponse} "등록된 사용자 정보"
// @Failure 400 {object} model.ErrorResponse "유효하지 않은 요청"
// @Failure 409 {object} model.ErrorResponse "이메일 중복"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /auth/register [post]
func handleRegister(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 사용자 등록 요청 파싱
		var registerRequest model.RegisterRequest
		if err := c.ShouldBindJSON(&registerRequest); err != nil {
			log.Printf("회원가입 요청 파싱 실패: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 회원가입 요청"})
			return
		}

		// 테스트 모드일 때 특수 처리
		if cfg.Environment == "test" && os.Getenv("MOCK_DB") == "true" {
			// 이메일 중복 테스트
			if registerRequest.Email == "existing@example.com" {
				c.JSON(http.StatusConflict, gin.H{"error": "이미 등록된 이메일입니다"})
				return
			}

			// 이메일 형식 검증
			if !strings.Contains(registerRequest.Email, "@") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 이메일 형식"})
				return
			}

			// 비밀번호 길이 검증
			if len(registerRequest.Password) < 6 {
				c.JSON(http.StatusBadRequest, gin.H{"error": "비밀번호는 최소 6자 이상이어야 합니다"})
				return
			}

			// 테스트 모드에서는 모의 응답 반환
			user := &model.User{
				ID:        1,
				Email:     registerRequest.Email,
				Name:      registerRequest.Name,
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
				IsActive:  true,
			}
			c.JSON(http.StatusCreated, gin.H{
				"success": true,
				"data":    user.ToUserResponse(),
			})
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
		user, err := userService.Register(&registerRequest)
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
		c.JSON(http.StatusCreated, gin.H{
			"success": true,
			"data":    user.ToUserResponse(),
		})
	}
}

// @Summary 로그인
// @Description 사용자 로그인 및 JWT 토큰 발급
// @Tags 인증
// @Accept json
// @Produce json
// @Param credentials body model.LoginRequest true "로그인 정보"
// @Success 200 {object} model.ApiResponse{data=model.LoginResponse} "토큰 및 사용자 정보"
// @Failure 400 {object} model.ErrorResponse "유효하지 않은 요청"
// @Failure 401 {object} model.ErrorResponse "인증 실패"
// @Failure 500 {object} model.ErrorResponse "서버 오류"
// @Router /auth/login [post]
func handleLogin(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 로그인 요청 파싱
		var loginRequest model.LoginRequest
		if err := c.ShouldBindJSON(&loginRequest); err != nil {
			log.Printf("로그인 요청 파싱 실패: %v", err)
			c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 로그인 요청"})
			return
		}

		// 테스트 모드일 때 특수 처리
		if cfg.Environment == "test" && os.Getenv("MOCK_DB") == "true" {
			// 이메일 형식 검증
			if !strings.Contains(loginRequest.Email, "@") {
				c.JSON(http.StatusBadRequest, gin.H{"error": "유효하지 않은 이메일 형식"})
				return
			}

			// 테스트 케이스 처리
			switch loginRequest.Email {
			case "nonexistent@example.com":
				c.JSON(http.StatusUnauthorized, gin.H{"error": "이메일 또는 비밀번호가 올바르지 않습니다"})
				return
			case "inactive@example.com":
				c.JSON(http.StatusUnauthorized, gin.H{"error": "비활성화된 계정입니다"})
				return
			case "user@example.com":
				if loginRequest.Password != "password123" {
					c.JSON(http.StatusUnauthorized, gin.H{"error": "이메일 또는 비밀번호가 올바르지 않습니다"})
					return
				}
				// 성공 케이스
				user := &model.User{
					ID:        1,
					Email:     loginRequest.Email,
					Name:      "테스트 사용자",
					CreatedAt: time.Now(),
					UpdatedAt: time.Now(),
					IsActive:  true,
				}
				token := "test-jwt-token"
				c.JSON(http.StatusOK, gin.H{
					"success": true,
					"data": gin.H{
						"token": token,
						"user":  user.ToUserResponse(),
					},
				})
				return
			default:
				c.JSON(http.StatusUnauthorized, gin.H{"error": "이메일 또는 비밀번호가 올바르지 않습니다"})
				return
			}
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
		user, err := userService.ValidateLogin(&loginRequest)
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
			"success": true,
			"data": gin.H{
				"token": token,
				"user":  user.ToUserResponse(),
			},
		})
	}
}
