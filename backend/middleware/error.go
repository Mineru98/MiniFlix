package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// ErrorHandler 전역 에러 핸들러 미들웨어
func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		// 에러가 있는 경우 처리
		if len(c.Errors) > 0 {
			// 첫 번째 에러 사용
			err := c.Errors.Last()
			
			// 이미 응답이 전송된 경우 처리하지 않음
			if c.Writer.Status() != http.StatusOK {
				return
			}

			// 에러 타입에 따라 응답
			switch err.Type {
			case gin.ErrorTypeBind:
				// 바인딩 에러 (요청 데이터 검증 실패)
				c.JSON(http.StatusBadRequest, gin.H{
					"error": "요청 데이터가 유효하지 않습니다",
					"details": err.Error(),
				})
			default:
				// 기타 에러
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "서버 내부 오류",
					"details": err.Error(),
				})
			}
		}
	}
} 