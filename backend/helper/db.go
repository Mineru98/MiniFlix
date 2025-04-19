package helper

import (
	"fmt"
	"log"

	_ "github.com/go-sql-driver/mysql"
	"backend/config"
	"github.com/jmoiron/sqlx"
)

// DB 싱글톤 인스턴스
var db *sqlx.DB

// GetDB 데이터베이스 연결 반환 (싱글톤 패턴)
func GetDB(cfg *config.Config) (*sqlx.DB, error) {
	if db != nil {
		return db, nil
	}

	// 데이터베이스 연결 문자열 생성
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	// 데이터베이스 연결
	var err error
	db, err = sqlx.Connect("mysql", dsn)
	if err != nil {
		log.Printf("데이터베이스 연결 실패: %v", err)
		return nil, err
	}

	// 연결 설정
	db.SetMaxOpenConns(20)
	db.SetMaxIdleConns(10)

	// 연결 테스트
	if err := db.Ping(); err != nil {
		log.Printf("데이터베이스 ping 실패: %v", err)
		return nil, err
	}

	log.Println("데이터베이스에 성공적으로 연결되었습니다")
	return db, nil
}

// CloseDB 데이터베이스 연결 종료
func CloseDB() {
	if db != nil {
		db.Close()
		db = nil
		log.Println("데이터베이스 연결이 종료되었습니다")
	}
} 