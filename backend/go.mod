module github.com/imgeunseog/miniflix/backend

go 1.20

require (
	github.com/gin-contrib/cors v1.4.0
	github.com/gin-contrib/gzip v0.0.6
	github.com/gin-contrib/sessions v0.0.5
	github.com/gin-gonic/gin v1.9.1
	github.com/go-playground/validator/v10 v10.14.1
	github.com/go-sql-driver/mysql v1.7.1
	github.com/golang-jwt/jwt/v5 v5.0.0
	github.com/jmoiron/sqlx v1.3.5
	github.com/stretchr/testify v1.8.4
	github.com/swaggo/files v1.0.1
	github.com/swaggo/gin-swagger v1.6.0
	github.com/swaggo/swag v1.16.1
	github.com/u2takey/ffmpeg-go v0.5.0
	github.com/unrolled/secure v1.13.0
	golang.org/x/crypto v0.10.0
)

require (
	// 여기에 간접 의존성이 자동으로 추가됩니다.
	// go mod tidy 실행 시 정리됩니다.
) 