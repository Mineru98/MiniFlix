package main

import (
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"github.com/unrolled/secure"

	"backend/config"
	_ "backend/docs" // Swagger 문서 임포트
	"backend/helper"
	"backend/middleware"
	"backend/route"
)

func setupSwagger(r *gin.Engine) {
	r.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusFound, "/docs/index.html")
	})

	r.GET("/docs/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
}

// @title MiniFlix API
// @version 1.0
// @description MiniFlix 웹 기반 스트리밍 서비스 API
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.miniflix.io/support
// @contact.email support@miniflix.io

// @license.name MIT
// @license.url https://github.com/Mineru98/MiniFlix/blob/main/LICENSE.txt

// @host localhost:8080
// @BasePath /api
func main() {
	// 개발 환경에서는 .env 파일 로드
	if os.Getenv("GO_ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("Warning: .env 파일을 찾을 수 없습니다.")
		}
	}

	// 설정 로드
	cfg := config.LoadConfig()

	// 설정 수동 확인 (최소한의 설정만 로그에 출력)
	log.Printf("서버 포트: %s", cfg.ServerPort)
	log.Printf("데이터베이스: %s@%s:%s/%s", cfg.DBUser, cfg.DBHost, cfg.DBPort, cfg.DBName)

	// 릴리즈 모드 설정
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	// 라우터 설정
	router := setupRouter(cfg)

	// API 라우트 설정
	apiGroup := router.Group("/api")
	{
		// 인증 라우트
		route.SetupAuthRoutes(apiGroup, cfg)

		// 인증이 필요한 라우트
		authenticatedGroup := apiGroup.Group("")
		authenticatedGroup.Use(middleware.AuthMiddleware(cfg))
		{
			// 사용자 라우트
			route.SetupUserRoutes(authenticatedGroup, cfg)

			// 콘텐츠 라우트
			route.SetupContentRoutes(authenticatedGroup, cfg)

			// 찜 목록 라우트
			route.SetupWishlistRoutes(authenticatedGroup, cfg)

			// 장르 라우트
			route.SetupGenreRoutes(authenticatedGroup, cfg)
		}

		// Swagger API 문서 설정
		apiGroup.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))
	}

	// 서버 시작
	go func() {
		log.Printf("서버 시작: http://localhost:%s", cfg.ServerPort)
		if err := router.Run(":" + cfg.ServerPort); err != nil {
			log.Fatalf("서버 시작 실패: %v", err)
		}
	}()

	// 종료 신호 처리
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	// 정상 종료 처리
	log.Println("서버 종료 중...")
	helper.CloseDB()
	log.Println("서버가 정상적으로 종료되었습니다.")
}

// setupRouter 라우터 설정
func setupRouter(cfg *config.Config) *gin.Engine {
	// 기본 라우터 생성
	router := gin.Default()

	GIN_MODE := os.Getenv("GIN_MODE")
	if GIN_MODE != "release" {
		setupSwagger(router)
		// CORS 설정
		router.Use(cors.New(cors.Config{
			AllowOrigins: []string{
				"http://localhost:8080", "http://localhost:3000",
				"http://127.0.0.1:8080", "http://127.0.0.1:3000",
			},
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
			AllowCredentials: true,
		}))
	} else {
		// 기본 라우트
		router.GET("/", func(c *gin.Context) {
			c.JSON(200, gin.H{
				"message": "MiniFlix API 서비스가 실행 중입니다.",
			})
		})
		// CORS 설정
		router.Use(cors.New(cors.Config{
			// AllowOrigins: []string{
			// 	"http://" + HOST_IP + "", "http://" + HOST_IP + ":8080", "http://" + HOST_IP + ":3000",
			// 	"https://sunglim-fe.bokji24.com", "https://sunglim-be.bokji24.com",
			// },
			AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
			AllowHeaders:     []string{"Origin", "Authorization", "Content-Type"},
			AllowCredentials: true,
		}))
	}

	// 보안 설정
	secureMiddleware := secure.New(secure.Options{
		SSLRedirect:           false,
		FrameDeny:             true,
		ContentTypeNosniff:    true,
		BrowserXssFilter:      true,
		ContentSecurityPolicy: "default-src 'self'",
	})
	router.Use(func(c *gin.Context) {
		err := secureMiddleware.Process(c.Writer, c.Request)
		if err != nil {
			log.Printf("보안 미들웨어 오류: %v", err)
			c.Abort()
			return
		}
		c.Next()
	})

	// CORS 설정
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Gzip 압축 설정
	router.Use(gzip.Gzip(gzip.DefaultCompression))

	// 정적 파일 제공 (비디오, 이미지 등)
	router.Static("/assets", "./assets")

	// 상태 확인 라우트
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "UP",
		})
	})

	return router
}
