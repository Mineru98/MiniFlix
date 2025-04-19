package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/unrolled/secure"
)

// SecureMiddleware 보안 관련 HTTP 헤더 설정 미들웨어
func SecureMiddleware(secureMiddleware *secure.Secure) gin.HandlerFunc {
	return func(c *gin.Context) {
		err := secureMiddleware.Process(c.Writer, c.Request)

		// 에러가 발생했거나 요청이 잘못된 경우
		if err != nil {
			c.Abort()
			return
		}

		// 미들웨어 체인 내에서 다음 핸들러로 이동
		if status := c.Writer.Status(); status > 300 && status < 399 {
			c.Abort()
		}

		c.Next()
	}
} 