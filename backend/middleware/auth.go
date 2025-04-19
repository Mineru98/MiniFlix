package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/imgeunseog/miniflix/backend/config"
	"github.com/imgeunseog/miniflix/backend/helper"
)

// AuthMiddleware JWT 인증 미들웨어
func AuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Authorization 헤더에서 토큰 추출
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "인증 필요"})
			return
		}

		// Bearer 토큰 형식 확인
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "인증 형식 오류"})
			return
		}

		// 토큰 유효성 검증
		claims, err := helper.ValidateToken(parts[1], cfg)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "유효하지 않은 토큰", "details": err.Error()})
			return
		}

		// 인증 정보를 컨텍스트에 저장
		c.Set("userID", claims.UserID)
		c.Set("userName", claims.Name)
		c.Set("userEmail", claims.Email)

		c.Next()
	}
}

// OptionalAuthMiddleware 선택적 인증 미들웨어 (비로그인 사용자도 접근 가능)
func OptionalAuthMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Authorization 헤더에서 토큰 추출
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// 토큰이 없어도 계속 진행
			c.Next()
			return
		}

		// Bearer 토큰 형식 확인
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
			// 형식이 맞지 않아도 계속 진행
			c.Next()
			return
		}

		// 토큰 유효성 검증
		claims, err := helper.ValidateToken(parts[1], cfg)
		if err != nil {
			// 토큰이 유효하지 않아도 계속 진행
			c.Next()
			return
		}

		// 인증 정보를 컨텍스트에 저장
		c.Set("userID", claims.UserID)
		c.Set("userName", claims.Name)
		c.Set("userEmail", claims.Email)
		c.Set("isAuthenticated", true)

		c.Next()
	}
} 