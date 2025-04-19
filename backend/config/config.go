package config

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// Config 애플리케이션 설정 구조체
type Config struct {
	Environment      string   `json:"environment"`        // 실행 환경 (development, production)
	Host             string   `json:"host"`               // 서버 호스트
	Port             string   `json:"port"`               // 서버 포트
	ServerPort       string   `json:"server_port"`        // 서버 포트 (Port와 동일, 호환성 유지)
	JWTSecret        string   `json:"jwt_secret"`         // JWT 시크릿 키
	JWTExpireHours   int      `json:"jwt_expire_hours"`   // JWT 만료 시간(시간)
	DBHost           string   `json:"db_host"`            // 데이터베이스 호스트
	DBPort           string   `json:"db_port"`            // 데이터베이스 포트
	DBUser           string   `json:"db_user"`            // 데이터베이스 사용자
	DBPassword       string   `json:"db_password"`        // 데이터베이스 비밀번호
	DBName           string   `json:"db_name"`            // 데이터베이스 이름
	CorsAllowOrigins []string `json:"cors_allow_origins"` // CORS 허용 출처
	MediaPath        string   `json:"media_path"`         // 미디어 파일 경로
	ThumbnailPath    string   `json:"thumbnail_path"`     // 썸네일 이미지 경로
}

// LoadConfig 환경에 따른 설정 파일 로드
func LoadConfig() *Config {
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development" // 기본값은 개발 환경
	}

	// 테스트 모드에서는 기본 설정을 바로 반환
	if env == "test" && os.Getenv("MOCK_DB") == "true" {
		config := getDefaultConfig()
		overrideConfigFromEnv(&config)
		config.Environment = env
		config.ServerPort = config.Port
		return &config
	}

	configFile := fmt.Sprintf("config/config.%s.json", env)
	if _, err := os.Stat(configFile); errors.Is(err, os.ErrNotExist) {
		// config.json을 대안으로 시도
		configFile = "config/config.json"
	}

	// Dockerfile에서 실행 시 상대 경로 문제 해결
	if _, err := os.Stat(configFile); errors.Is(err, os.ErrNotExist) {
		// 프로젝트 루트에서 상대 경로로 시도
		dir, err := filepath.Abs(filepath.Dir(os.Args[0]))
		if err != nil {
			panic(fmt.Sprintf("경로 확인 실패: %v", err))
		}
		configFile = filepath.Join(dir, configFile)
	}

	// 파일을 열거나 기본 설정 생성
	var config Config
	file, err := os.Open(configFile)
	if err != nil {
		fmt.Printf("경고: 설정 파일을 열 수 없습니다: %v, 기본 설정을 사용합니다\n", err)
		config = getDefaultConfig()
	} else {
		defer file.Close()
		decoder := json.NewDecoder(file)
		if err := decoder.Decode(&config); err != nil {
			fmt.Printf("경고: 설정 파일 디코딩 실패: %v, 기본 설정을 사용합니다\n", err)
			config = getDefaultConfig()
		}
	}

	// 환경 변수로 설정 덮어쓰기
	overrideConfigFromEnv(&config)

	// 환경 설정
	config.Environment = env

	// ServerPort 설정 (Port와 동일하게 유지)
	config.ServerPort = config.Port

	return &config
}

// getDefaultConfig 기본 설정값 반환
func getDefaultConfig() Config {
	return Config{
		Environment:      "development",
		Host:             "localhost",
		Port:             "8080",
		ServerPort:       "8080",
		JWTSecret:        "miniflix_secret_key",
		JWTExpireHours:   24,
		DBHost:           "localhost",
		DBPort:           "3308",
		DBUser:           "miniflix",
		DBPassword:       "miniflix",
		DBName:           "miniflix",
		CorsAllowOrigins: []string{"*"},
		MediaPath:        "./assets/media",
		ThumbnailPath:    "./assets/thumbnails",
	}
}

// 환경 변수에서 설정 값 덮어쓰기
func overrideConfigFromEnv(config *Config) {
	if env := os.Getenv("APP_ENV"); env != "" {
		config.Environment = env
	}
	if host := os.Getenv("HOST"); host != "" {
		config.Host = host
	}
	if port := os.Getenv("PORT"); port != "" {
		config.Port = port
		config.ServerPort = port
	}
	if jwtSecret := os.Getenv("JWT_SECRET"); jwtSecret != "" {
		config.JWTSecret = jwtSecret
	}
	if dbHost := os.Getenv("DB_HOST"); dbHost != "" {
		config.DBHost = dbHost
	}
	if dbPort := os.Getenv("DB_PORT"); dbPort != "" {
		config.DBPort = dbPort
	}
	if dbUser := os.Getenv("DB_USER"); dbUser != "" {
		config.DBUser = dbUser
	}
	if dbPassword := os.Getenv("DB_PASSWORD"); dbPassword != "" {
		config.DBPassword = dbPassword
	}
	if dbName := os.Getenv("DB_NAME"); dbName != "" {
		config.DBName = dbName
	}
	if corsOrigins := os.Getenv("CORS_ALLOW_ORIGINS"); corsOrigins != "" {
		config.CorsAllowOrigins = strings.Split(corsOrigins, ",")
	}
	if mediaPath := os.Getenv("MEDIA_PATH"); mediaPath != "" {
		config.MediaPath = mediaPath
	}
	if thumbnailPath := os.Getenv("THUMBNAIL_PATH"); thumbnailPath != "" {
		config.ThumbnailPath = thumbnailPath
	}
}
