package service

import (
	"database/sql"
	"errors"
	"log"
	"time"

	"backend/model"
)

// ContentService 콘텐츠 관련 서비스
type ContentService struct {
	DB *sql.DB
}

// NewContentService 새 ContentService 생성
func NewContentService(db *sql.DB) *ContentService {
	return &ContentService{
		DB: db,
	}
}

// GetStreamingURL 콘텐츠 스트리밍 URL 조회
func (s *ContentService) GetStreamingURL(contentID int64, userID int64) (*model.StreamingResponse, error) {
	// 콘텐츠 정보 조회
	var videoURL string
	var duration int
	err := s.DB.QueryRow(`
		SELECT video_url, duration
		FROM Contents
		WHERE id = ?
	`, contentID).Scan(&videoURL, &duration)
	if err != nil {
		log.Printf("콘텐츠 정보 조회 실패: %v", err)
		return nil, errors.New("콘텐츠를 찾을 수 없습니다")
	}

	// 시청 기록 조회 (마지막 시청 위치)
	var lastPosition sql.NullInt64
	err = s.DB.QueryRow(`
		SELECT last_position
		FROM ViewingHistories
		WHERE user_id = ? AND content_id = ?
		ORDER BY watched_at DESC
		LIMIT 1
	`, userID, contentID).Scan(&lastPosition)

	// 결과 구성
	response := &model.StreamingResponse{
		ContentID:    contentID,
		StreamingURL: videoURL,
		Duration:     duration,
		LastPosition: 0,
	}

	// 마지막 시청 위치가 있으면 설정
	if err == nil && lastPosition.Valid {
		response.LastPosition = int(lastPosition.Int64)
	}

	// 현재 시청 기록 생성 또는 업데이트 (시청 시작 시점)
	now := time.Now()
	_, err = s.DB.Exec(`
		INSERT INTO ViewingHistories 
		(user_id, content_id, watch_duration, last_position, watched_at, is_completed)
		VALUES (?, ?, 0, ?, ?, false)
		ON DUPLICATE KEY UPDATE
		last_position = VALUES(last_position), watched_at = VALUES(watched_at), is_completed = VALUES(is_completed)
	`, userID, contentID, response.LastPosition, now)

	if err != nil {
		log.Printf("시청 기록 초기화 실패: %v", err)
		// 실패해도 스트리밍은 계속 진행
	}

	return response, nil
}

// UpdatePlaybackPosition 재생 위치 업데이트
func (s *ContentService) UpdatePlaybackPosition(userID int64, req *model.PlaybackPositionRequest) error {
	// 현재 시간
	now := time.Now()

	// 시청 기록 업데이트
	_, err := s.DB.Exec(`
		UPDATE ViewingHistories
		SET last_position = ?, watch_duration = ?, watched_at = ?, is_completed = ?
		WHERE user_id = ? AND content_id = ?
	`, req.CurrentPosition, req.WatchDuration, now, req.IsCompleted, userID, req.ContentID)

	if err != nil {
		log.Printf("재생 위치 업데이트 실패: %v", err)
		return errors.New("재생 위치 업데이트 실패")
	}

	return nil
}

// SaveFinalPosition 최종 재생 위치 저장
func (s *ContentService) SaveFinalPosition(userID int64, req *model.FinalPositionRequest) error {
	// 현재 시간
	now := time.Now()

	// 최종 시청 기록 업데이트
	_, err := s.DB.Exec(`
		UPDATE ViewingHistories
		SET last_position = ?, watch_duration = ?, watched_at = ?, is_completed = ?
		WHERE user_id = ? AND content_id = ?
	`, req.FinalPosition, req.WatchDuration, now, req.IsCompleted, userID, req.ContentID)

	if err != nil {
		log.Printf("최종 재생 위치 저장 실패: %v", err)
		return errors.New("최종 재생 위치 저장 실패")
	}

	return nil
}
