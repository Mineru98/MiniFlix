package helper

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"backend/config"
)

// JWTClaims JWT 클레임 구조체
type JWTClaims struct {
	UserID int64  `json:"user_id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

// GenerateToken JWT 토큰 생성
func GenerateToken(userID int64, name, email string, cfg *config.Config) (string, error) {
	// 클레임 생성
	claims := JWTClaims{
		UserID: userID,
		Name:   name,
		Email:  email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * time.Duration(cfg.JWTExpireHours))),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "miniflix",
			Subject:   email,
		},
	}

	// 토큰 생성
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// 서명
	tokenString, err := token.SignedString([]byte(cfg.JWTSecret))
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken JWT 토큰 유효성 검증
func ValidateToken(tokenString string, cfg *config.Config) (*JWTClaims, error) {
	// 토큰 파싱
	token, err := jwt.ParseWithClaims(tokenString, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		// HMAC 방식의 서명 방식 확인
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("유효하지 않은 서명 방식")
		}
		return []byte(cfg.JWTSecret), nil
	})

	if err != nil {
		return nil, err
	}

	// 클레임 추출
	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("유효하지 않은 토큰")
} 