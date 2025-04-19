package model

import (
	"database/sql"
	"time"
)

// ViewingHistory 시청 기록 모델
type ViewingHistory struct {
	ID           int64     `db:"id" json:"id"`
	UserID       int64     `db:"user_id" json:"user_id"`
	ContentID    int64     `db:"content_id" json:"content_id"`
	WatchDuration int       `db:"watch_duration" json:"watch_duration"`
	LastPosition int       `db:"last_position" json:"last_position"`
	WatchedAt    time.Time `db:"watched_at" json:"watched_at"`
	IsCompleted  bool      `db:"is_completed" json:"is_completed"`
}

// ViewingHistoryRequest 시청 기록 요청 모델
type ViewingHistoryRequest struct {
	ContentID    int64 `json:"content_id" binding:"required"`
	LastPosition int   `json:"last_position" binding:"required"`
	WatchDuration int   `json:"watch_duration" binding:"required"`
	IsCompleted  bool  `json:"is_completed"`
}

// UpdateViewingHistory 시청 기록 업데이트
func UpdateViewingHistory(db *sql.DB, userID int64, req *ViewingHistoryRequest) error {
	// 현재 시간
	now := time.Now()

	// 기존 기록 확인
	var historyID int64
	var count int
	err := db.QueryRow(`
		SELECT COUNT(*), IFNULL(id, 0) FROM ViewingHistories 
		WHERE user_id = ? AND content_id = ?
	`, userID, req.ContentID).Scan(&count, &historyID)
	if err != nil {
		return err
	}

	// 기존 기록이 있으면 업데이트
	if count > 0 {
		_, err := db.Exec(`
			UPDATE ViewingHistories 
			SET watch_duration = ?, last_position = ?, watched_at = ?, is_completed = ?
			WHERE id = ?
		`, req.WatchDuration, req.LastPosition, now, req.IsCompleted, historyID)
		return err
	}

	// 기존 기록이 없으면 새로 생성
	_, err = db.Exec(`
		INSERT INTO ViewingHistories 
		(user_id, content_id, watch_duration, last_position, watched_at, is_completed) 
		VALUES (?, ?, ?, ?, ?, ?)
	`, userID, req.ContentID, req.WatchDuration, req.LastPosition, now, req.IsCompleted)
	return err
}

// GetViewingHistory 사용자의 시청 기록 조회
func GetViewingHistory(db *sql.DB, userID int64) ([]ViewingHistoryResponse, error) {
	rows, err := db.Query(`
		SELECT 
			vh.id, vh.content_id, vh.watch_duration, vh.last_position, vh.watched_at, vh.is_completed,
			c.title, c.thumbnail_url, c.duration
		FROM 
			ViewingHistories vh
		JOIN 
			Contents c ON vh.content_id = c.id
		WHERE 
			vh.user_id = ?
		ORDER BY 
			vh.watched_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	historyList := []ViewingHistoryResponse{}

	for rows.Next() {
		var history ViewingHistoryResponse
		if err := rows.Scan(
			&history.ID, &history.ContentID, &history.WatchDuration, &history.LastPosition, 
			&history.WatchedAt, &history.IsCompleted, &history.Title, &history.ThumbnailURL, &history.Duration,
		); err != nil {
			return nil, err
		}
		
		// 시청 진행률 계산 (퍼센트)
		if history.Duration > 0 {
			history.ProgressPercent = int(float64(history.WatchDuration) / float64(history.Duration) * 100)
			if history.ProgressPercent > 100 {
				history.ProgressPercent = 100
			}
		}
		
		historyList = append(historyList, history)
	}

	return historyList, nil
}

// ViewingHistoryResponse 시청 기록 응답 모델
type ViewingHistoryResponse struct {
	ID             int64     `json:"id"`
	ContentID      int64     `json:"content_id"`
	WatchDuration  int       `json:"watch_duration"`
	LastPosition   int       `json:"last_position"`
	WatchedAt      time.Time `json:"watched_at"`
	IsCompleted    bool      `json:"is_completed"`
	Title          string    `json:"title"`
	ThumbnailURL   string    `json:"thumbnail_url"`
	Duration       int       `json:"duration"`
	ProgressPercent int      `json:"progress_percent"`
} 