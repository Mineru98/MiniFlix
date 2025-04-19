package model

import (
	"database/sql"
	"time"
)

// Wishlist 찜 목록 모델
type Wishlist struct {
	ID        int64     `db:"id" json:"id"`
	UserID    int64     `db:"user_id" json:"user_id"`
	ContentID int64     `db:"content_id" json:"content_id"`
	CreatedAt time.Time `db:"created_at" json:"created_at"`
}

// ToggleWishlist 찜하기/취소하기
func ToggleWishlist(db *sql.DB, userID, contentID int64) (bool, error) {
	// 현재 찜 상태 확인
	var count int
	err := db.QueryRow(`
		SELECT COUNT(*) FROM Wishlists 
		WHERE user_id = ? AND content_id = ?
	`, userID, contentID).Scan(&count)
	if err != nil {
		return false, err
	}

	// 이미 찜한 경우 (취소)
	if count > 0 {
		_, err := db.Exec(`
			DELETE FROM Wishlists 
			WHERE user_id = ? AND content_id = ?
		`, userID, contentID)
		return false, err
	}

	// 찜하지 않은 경우 (추가)
	_, err = db.Exec(`
		INSERT INTO Wishlists (user_id, content_id, created_at) 
		VALUES (?, ?, ?)
	`, userID, contentID, time.Now())
	return true, err
}

// GetWishlist 사용자의 찜 목록 조회
func GetWishlist(db *sql.DB, userID int64) ([]ContentListResponse, error) {
	rows, err := db.Query(`
		SELECT 
			c.id, c.title, c.thumbnail_url, c.release_year
		FROM 
			Contents c
		JOIN 
			Wishlists w ON c.id = w.content_id
		WHERE 
			w.user_id = ?
		ORDER BY 
			w.created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	wishlist := []ContentListResponse{}
	contentIDs := []int64{}

	// 기본 콘텐츠 정보 읽기
	for rows.Next() {
		var content ContentListResponse
		if err := rows.Scan(&content.ID, &content.Title, &content.ThumbnailURL, &content.ReleaseYear); err != nil {
			return nil, err
		}
		content.IsWishlisted = true // 찜 목록이므로 모두 true
		wishlist = append(wishlist, content)
		contentIDs = append(contentIDs, content.ID)
	}

	// 각 콘텐츠의 장르 정보 조회
	for i, contentID := range contentIDs {
		genreRows, err := db.Query(`
			SELECT 
				g.name
			FROM 
				Genres g
			JOIN 
				ContentGenres cg ON g.id = cg.genre_id
			WHERE 
				cg.content_id = ?
		`, contentID)
		if err != nil {
			return nil, err
		}

		var genres []string
		for genreRows.Next() {
			var genreName string
			if err := genreRows.Scan(&genreName); err != nil {
				genreRows.Close()
				return nil, err
			}
			genres = append(genres, genreName)
		}
		genreRows.Close()
		wishlist[i].Genres = genres
	}

	return wishlist, nil
} 