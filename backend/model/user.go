package model

import (
	"database/sql"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// User 사용자 모델
type User struct {
	ID        int64        `db:"id" json:"id"`
	Email     string       `db:"email" json:"email" binding:"required,email"`
	Password  string       `db:"password_hash" json:"-" binding:"required,min=6"`
	Name      string       `db:"name" json:"name" binding:"required"`
	CreatedAt time.Time    `db:"created_at" json:"created_at"`
	UpdatedAt time.Time    `db:"updated_at" json:"updated_at"`
	IsActive  bool         `db:"is_active" json:"is_active"`
}

// UserResponse 사용자 응답 모델 (비밀번호 제외)
type UserResponse struct {
	ID        int64     `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
	IsActive  bool      `json:"is_active"`
}

// UserLoginRequest 로그인 요청 모델
type UserLoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

// UserRegisterRequest 회원가입 요청 모델
type UserRegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	Name     string `json:"name" binding:"required"`
}

// UserUpdateRequest 사용자 정보 업데이트 요청 모델
type UserUpdateRequest struct {
	Name            string `json:"name"`
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password"`
}

// ToUserResponse User 모델을 UserResponse로 변환
func (u *User) ToUserResponse() UserResponse {
	return UserResponse{
		ID:        u.ID,
		Email:     u.Email,
		Name:      u.Name,
		CreatedAt: u.CreatedAt,
		IsActive:  u.IsActive,
	}
}

// HashPassword 비밀번호 해싱
func HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	return string(bytes), err
}

// CheckPasswordHash 비밀번호 해시 확인
func CheckPasswordHash(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

// CreateUser 새 사용자 생성
func CreateUser(db *sql.DB, user *UserRegisterRequest) (*User, error) {
	// 비밀번호 해시
	hashedPassword, err := HashPassword(user.Password)
	if err != nil {
		return nil, err
	}

	// 현재 시간
	now := time.Now()

	// 새 사용자 생성
	result, err := db.Exec(
		"INSERT INTO Users (email, password_hash, name, created_at, updated_at, is_active) VALUES (?, ?, ?, ?, ?, ?)",
		user.Email, hashedPassword, user.Name, now, now, true,
	)
	if err != nil {
		return nil, err
	}

	// 생성된 ID 가져오기
	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}

	// 생성된 사용자 반환
	return &User{
		ID:        id,
		Email:     user.Email,
		Password:  hashedPassword,
		Name:      user.Name,
		CreatedAt: now,
		UpdatedAt: now,
		IsActive:  true,
	}, nil
}

// GetUserByEmail 이메일로 사용자 조회
func GetUserByEmail(db *sql.DB, email string) (*User, error) {
	user := &User{}
	err := db.QueryRow(
		"SELECT id, email, password_hash, name, created_at, updated_at, is_active FROM Users WHERE email = ?",
		email,
	).Scan(&user.ID, &user.Email, &user.Password, &user.Name, &user.CreatedAt, &user.UpdatedAt, &user.IsActive)

	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByID ID로 사용자 조회
func GetUserByID(db *sql.DB, id int64) (*User, error) {
	user := &User{}
	err := db.QueryRow(
		"SELECT id, email, password_hash, name, created_at, updated_at, is_active FROM Users WHERE id = ?",
		id,
	).Scan(&user.ID, &user.Email, &user.Password, &user.Name, &user.CreatedAt, &user.UpdatedAt, &user.IsActive)

	if err != nil {
		return nil, err
	}

	return user, nil
}

// UpdateUser 사용자 정보 업데이트
func UpdateUser(db *sql.DB, id int64, update *UserUpdateRequest) error {
	// 현재 시간
	now := time.Now()

	// 새 비밀번호가 있는 경우
	if update.NewPassword != "" {
		// 비밀번호 해시
		hashedPassword, err := HashPassword(update.NewPassword)
		if err != nil {
			return err
		}

		_, err = db.Exec(
			"UPDATE Users SET name = ?, password_hash = ?, updated_at = ? WHERE id = ?",
			update.Name, hashedPassword, now, id,
		)
		return err
	}

	// 이름만 업데이트하는 경우
	_, err := db.Exec(
		"UPDATE Users SET name = ?, updated_at = ? WHERE id = ?",
		update.Name, now, id,
	)
	return err
} 