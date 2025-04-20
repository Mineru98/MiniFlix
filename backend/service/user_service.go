package service

import (
	"database/sql"
	"errors"

	"backend/model"

	"github.com/jmoiron/sqlx"
)

// UserService 사용자 관련 서비스 로직을 담당하는 구조체
type UserService struct {
	DB *sqlx.DB
}

// NewUserService 새로운 UserService 인스턴스 생성
func NewUserService(db *sqlx.DB) *UserService {
	return &UserService{
		DB: db,
	}
}

// CheckEmailExists 이메일 중복 확인
func (s *UserService) CheckEmailExists(email string) (bool, error) {
	var count int
	err := s.DB.Get(&count, "SELECT COUNT(*) FROM Users WHERE email = ?", email)
	if err != nil {
		return false, err
	}
	return count > 0, nil
}

// Register 새로운 사용자 등록
func (s *UserService) Register(req *model.RegisterRequest) (*model.User, error) {
	// 이메일 중복 확인
	exists, err := s.CheckEmailExists(req.Email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("이미 등록된 이메일입니다")
	}

	// 사용자 생성
	user, err := model.CreateUser(s.DB.DB, req)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserByEmail 이메일로 사용자 조회
func (s *UserService) GetUserByEmail(email string) (*model.User, error) {
	user, err := model.GetUserByEmail(s.DB.DB, email)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// GetUserByID ID로 사용자 조회
func (s *UserService) GetUserByID(id int64) (*model.User, error) {
	user, err := model.GetUserByID(s.DB.DB, id)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// UpdateUserInfo 사용자 정보 업데이트
func (s *UserService) UpdateUserInfo(id int64, req *model.UpdateProfileRequest) error {
	// 현재 비밀번호 확인을 위해 사용자 조회
	user, err := model.GetUserByID(s.DB.DB, id)
	if err != nil {
		return err
	}

	// 현재 비밀번호 확인
	if !model.CheckPasswordHash(req.CurrentPassword, user.Password) {
		return errors.New("현재 비밀번호가 일치하지 않습니다")
	}

	// 사용자 정보 업데이트
	err = model.UpdateUser(s.DB.DB, id, req)
	if err != nil {
		return err
	}

	return nil
}

// ValidateLogin 로그인 정보 검증
func (s *UserService) ValidateLogin(req *model.LoginRequest) (*model.User, error) {
	// 사용자 조회
	user, err := model.GetUserByEmail(s.DB.DB, req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("이메일 또는 비밀번호가 올바르지 않습니다")
		}
		return nil, err
	}

	// 계정 활성화 상태 확인
	if !user.IsActive {
		return nil, errors.New("비활성화된 계정입니다")
	}

	// 비밀번호 확인
	if !model.CheckPasswordHash(req.Password, user.Password) {
		return nil, errors.New("이메일 또는 비밀번호가 올바르지 않습니다")
	}

	return user, nil
}
