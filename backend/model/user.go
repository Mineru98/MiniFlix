package model

import (
	"database/sql"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// User 사용자 모델
// @Description 사용자 정보를 저장하는 모델
type User struct {
	ID        int64     `db:"id" json:"id"`                                    // 사용자 고유 ID
	Email     string    `db:"email" json:"email" binding:"required,email"`     // 사용자 이메일(로그인 ID)
	Password  string    `db:"password_hash" json:"-" binding:"required,min=6"` // 암호화된 비밀번호
	Name      string    `db:"name" json:"name" binding:"required"`             // 사용자 이름
	CreatedAt time.Time `db:"created_at" json:"created_at"`                    // 가입일시
	UpdatedAt time.Time `db:"updated_at" json:"updated_at"`                    // 정보 수정일시
	IsActive  bool      `db:"is_active" json:"is_active"`                      // 계정 활성화 상태
}

// UserResponse 사용자 응답 모델 (비밀번호 제외)
// @Description 클라이언트에 반환하는 사용자 정보 모델
type UserResponse struct {
	ID        int64     `json:"id"`         // 사용자 고유 ID
	Email     string    `json:"email"`      // 사용자 이메일
	Name      string    `json:"name"`       // 사용자 이름
	CreatedAt time.Time `json:"created_at"` // 가입일시
	IsActive  bool      `json:"is_active"`  // 계정 활성화 상태
}

// LoginRequest 로그인 요청 모델
// @Description 로그인 시 클라이언트에서 전송하는 데이터 모델
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"` // 사용자 이메일
	Password string `json:"password" binding:"required"`    // 사용자 비밀번호
}

// LoginResponse 로그인 응답 모델
// @Description 로그인 성공 시 반환되는 데이터 모델
type LoginResponse struct {
	Token string       `json:"token"` // JWT 토큰
	User  UserResponse `json:"user"`  // 사용자 정보
}

// RegisterRequest 회원가입 요청 모델
// @Description 회원가입 시 클라이언트에서 전송하는 데이터 모델
type RegisterRequest struct {
	Email    string `json:"email" binding:"required,email"`    // 사용자 이메일
	Password string `json:"password" binding:"required,min=6"` // 사용자 비밀번호 (최소 6자)
	Name     string `json:"name" binding:"required"`           // 사용자 이름
}

// UpdateProfileRequest 사용자 정보 업데이트 요청 모델
// @Description 사용자 정보 업데이트 시 클라이언트에서 전송하는 데이터 모델
type UpdateProfileRequest struct {
	Name            string `json:"name"`                                // 변경할 사용자 이름
	CurrentPassword string `json:"current_password" binding:"required"` // 현재 비밀번호
	NewPassword     string `json:"new_password"`                        // 새 비밀번호 (변경하지 않을 경우 빈 문자열)
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
func CreateUser(db *sql.DB, user *RegisterRequest) (*User, error) {
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
func UpdateUser(db *sql.DB, id int64, update *UpdateProfileRequest) error {
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
