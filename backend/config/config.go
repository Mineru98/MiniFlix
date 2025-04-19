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
	Env              string   `json:"env"`
	Host             string   `json:"host"`
	Port             string   `json:"port"`
	JWTSecret        string   `json:"jwt_secret"`
	JWTExpireHours   int      `json:"jwt_expire_hours"`
	DBHost           string   `json:"db_host"`
	DBPort           string   `json:"db_port"`
	DBUser           string   `json:"db_user"`
	DBPassword       string   `json:"db_password"`
	DBName           string   `json:"db_name"`
	CorsAllowOrigins []string `json:"cors_allow_origins"`
	MediaPath        string   `json:"media_path"`
	ThumbnailPath    string   `json:"thumbnail_path"`
}

// LoadConfig 환경에 따른 설정 파일 로드
func LoadConfig() (*Config, error) {
	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development" // 기본값은 개발 환경
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
			return nil, err
		}
		configFile = filepath.Join(dir, configFile)
	}

	file, err := os.Open(configFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	var config Config
	decoder := json.NewDecoder(file)
	if err := decoder.Decode(&config); err != nil {
		return nil, err
	}

	// 환경 변수로 설정 덮어쓰기
	overrideConfigFromEnv(&config)

	// 환경 설정
	config.Env = env

	return &config, nil
}

// 환경 변수에서 설정 값 덮어쓰기
func overrideConfigFromEnv(config *Config) {
	if host := os.Getenv("HOST"); host != "" {
		config.Host = host
	}
	if port := os.Getenv("PORT"); port != "" {
		config.Port = port
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