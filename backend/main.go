package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/imgeunseog/miniflix/backend/config"
	_ "github.com/imgeunseog/miniflix/backend/docs"
	"github.com/imgeunseog/miniflix/backend/middleware"
	"github.com/imgeunseog/miniflix/backend/route"
	"github.com/unrolled/secure"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
)

// @title           MiniFlix API
// @version         1.0
// @description     MiniFlix 웹 기반 스트리밍 서비스 API
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.url    http://www.miniflix.io/support
// @contact.email  support@miniflix.io

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8080
// @BasePath  /api/v1

// @securityDefinitions.apikey Bearer
// @in header
// @name Authorization
// @description Bearer 스키마를 사용한 JWT 인증
func main() {
	// 설정 로드
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("설정을 로드할 수 없습니다: %v", err)
	}

	// Gin 모드 설정
	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// 라우터 생성
	r := gin.Default()

	// 미들웨어 설정
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CorsAllowOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))
	r.Use(gzip.Gzip(gzip.DefaultCompression))
	r.Use(middleware.ErrorHandler())

	// 보안 설정
	secureConfig := secure.New(secure.Options{
		FrameDeny:             true,
		ContentTypeNosniff:    true,
		BrowserXssFilter:      true,
		ContentSecurityPolicy: "default-src 'self'",
		ReferrerPolicy:        "strict-origin-when-cross-origin",
	})
	r.Use(middleware.SecureMiddleware(secureConfig))

	// API 경로 설정
	v1 := r.Group("/api/v1")
	{
		route.SetupAuthRoutes(v1, cfg)
		route.SetupContentRoutes(v1, cfg)
		route.SetupUserRoutes(v1, cfg)
		route.SetupGenreRoutes(v1, cfg)
		route.SetupWishlistRoutes(v1, cfg)
	}

	// 스웨거 문서 경로 설정
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// 정적 파일 제공 (영상 및 이미지 파일)
	r.Static("/media", "./assets/media")
	r.Static("/thumbnails", "./assets/thumbnails")

	// 서버 시작
	log.Printf("서버가 %s:%s 에서 시작됩니다...\n", cfg.Host, cfg.Port)
	if err := r.Run(cfg.Host + ":" + cfg.Port); err != nil {
		log.Fatalf("서버 시작 실패: %v", err)
	}
} 