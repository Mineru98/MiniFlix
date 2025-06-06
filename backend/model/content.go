package model

import (
	"database/sql"
	"time"
)

// Content 콘텐츠 모델
// @Description 콘텐츠 정보를 담는 모델
type Content struct {
	ID           int64     `db:"id" json:"id"`
	Title        string    `db:"title" json:"title" binding:"required"`
	Description  string    `db:"description" json:"description"`
	ThumbnailURL string    `db:"thumbnail_url" json:"thumbnail_url"`
	VideoURL     string    `db:"video_url" json:"video_url"`
	Duration     int       `db:"duration" json:"duration"`
	ReleaseYear  int       `db:"release_year" json:"release_year"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	UpdatedAt    time.Time `db:"updated_at" json:"updated_at"`
	Genres       []Genre   `json:"genres"`
	IsWishlisted bool      `json:"is_wishlisted"`
}

// ContentListResponse 콘텐츠 목록 응답용 모델
// @Description 콘텐츠 목록 조회 응답에 사용되는 모델
type ContentListResponse struct {
	ID           int64    `json:"id"`
	Title        string   `json:"title"`
	ThumbnailURL string   `json:"thumbnail_url"`
	ReleaseYear  int      `json:"release_year"`
	Genres       []string `json:"genres"`
	IsWishlisted bool     `json:"is_wishlisted"`
}

// ContentDetailResponse 콘텐츠 상세 응답용 모델
// @Description 콘텐츠 상세 정보 조회 응답에 사용되는 모델
type ContentDetailResponse struct {
	ID           int64   `json:"id"`
	Title        string  `json:"title"`
	Description  string  `json:"description"`
	ThumbnailURL string  `json:"thumbnail_url"`
	VideoURL     string  `json:"video_url"`
	Duration     int     `json:"duration"`
	ReleaseYear  int     `json:"release_year"`
	Genres       []Genre `json:"genres"`
	IsWishlisted bool    `json:"is_wishlisted"`
	LastPosition int     `json:"last_position"`
}

// Genre 장르 모델
// @Description 장르 정보를 담는 모델
type Genre struct {
	ID          int64  `db:"id" json:"id"`
	Name        string `db:"name" json:"name" binding:"required"`
	Description string `db:"description" json:"description"`
}

// ContentGenre 콘텐츠-장르 매핑 모델
// @Description 콘텐츠와 장르 간의 매핑 정보를 담는 모델
type ContentGenre struct {
	ID        int64 `db:"id" json:"id"`
	ContentID int64 `db:"content_id" json:"content_id"`
	GenreID   int64 `db:"genre_id" json:"genre_id"`
}

// @Description 장르별 콘텐츠 필터링 요청 DTO
type GenreFilterRequest struct {
	GenreID int64 `json:"genre_id" binding:"required"`
}

// GetContentList 콘텐츠 목록 조회
func GetContentList(db *sql.DB, userID int64, page, size int) (*PageInfo, error) {
	// 페이징 설정
	if page < 0 {
		page = 0
	}
	if size <= 0 {
		size = 10
	}
	offset := page * size

	// 전체 콘텐츠 수 조회
	var totalElements int
	err := db.QueryRow("SELECT COUNT(*) FROM Contents").Scan(&totalElements)
	if err != nil {
		return nil, err
	}

	// 기본 콘텐츠 쿼리 (페이징 적용)
	rows, err := db.Query(`
		SELECT 
			c.id, c.title, c.thumbnail_url, c.release_year
		FROM 
			Contents c
		ORDER BY 
			c.release_year DESC, c.title ASC
		LIMIT ? OFFSET ?
	`, size, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	contentList := []ContentListResponse{}
	contentIDs := []int64{}

	// 기본 콘텐츠 정보 읽기
	for rows.Next() {
		var content ContentListResponse
		if err := rows.Scan(&content.ID, &content.Title, &content.ThumbnailURL, &content.ReleaseYear); err != nil {
			return nil, err
		}
		contentList = append(contentList, content)
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
		contentList[i].Genres = genres
	}

	// 로그인한 사용자가 있는 경우 찜 정보 조회
	if userID > 0 {
		for i, contentID := range contentIDs {
			var count int
			err := db.QueryRow(`
				SELECT 
					COUNT(*)
				FROM 
					Wishlists
				WHERE 
					user_id = ? AND content_id = ?
			`, userID, contentID).Scan(&count)

			if err != nil {
				return nil, err
			}

			contentList[i].IsWishlisted = count > 0
		}
	}

	// 페이징 정보 구성
	totalPages := (totalElements + size - 1) / size // 올림 계산
	numberOfElements := len(contentList)

	pageInfo := &PageInfo{
		Content: contentList,
		Pageable: Pageable{
			PageNumber: page,
			PageSize:   size,
			Offset:     offset,
		},
		TotalPages:       totalPages,
		TotalElements:    totalElements,
		Last:             page >= totalPages-1,
		Size:             size,
		Number:           page,
		NumberOfElements: numberOfElements,
		First:            page == 0,
		Empty:            numberOfElements == 0,
	}

	return pageInfo, nil
}

// GetContentDetail 콘텐츠 상세 정보 조회
func GetContentDetail(db *sql.DB, contentID, userID int64) (*ContentDetailResponse, error) {
	// 콘텐츠 기본 정보 조회
	var content ContentDetailResponse
	err := db.QueryRow(`
		SELECT 
			id, title, description, thumbnail_url, video_url, duration, release_year
		FROM 
			Contents
		WHERE 
			id = ?
	`, contentID).Scan(
		&content.ID, &content.Title, &content.Description,
		&content.ThumbnailURL, &content.VideoURL, &content.Duration, &content.ReleaseYear,
	)

	if err != nil {
		return nil, err
	}

	// 장르 정보 조회
	genreRows, err := db.Query(`
		SELECT 
			g.id, g.name, g.description
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
	defer genreRows.Close()

	var genres []Genre
	for genreRows.Next() {
		var genre Genre
		if err := genreRows.Scan(&genre.ID, &genre.Name, &genre.Description); err != nil {
			return nil, err
		}
		genres = append(genres, genre)
	}
	content.Genres = genres

	// 로그인한 사용자가 있는 경우 추가 정보 조회
	if userID > 0 {
		// 찜 상태 조회
		var wishlistCount int
		err := db.QueryRow(`
			SELECT 
				COUNT(*)
			FROM 
				Wishlists
			WHERE 
				user_id = ? AND content_id = ?
		`, userID, contentID).Scan(&wishlistCount)
		if err != nil {
			return nil, err
		}
		content.IsWishlisted = wishlistCount > 0

		// 시청 위치 조회
		var lastPosition sql.NullInt64
		err = db.QueryRow(`
			SELECT 
				last_position
			FROM 
				ViewingHistories
			WHERE 
				user_id = ? AND content_id = ?
			ORDER BY 
				watched_at DESC
			LIMIT 1
		`, userID, contentID).Scan(&lastPosition)
		if err != nil && err != sql.ErrNoRows {
			return nil, err
		}

		if lastPosition.Valid {
			content.LastPosition = int(lastPosition.Int64)
		}
	}

	return &content, nil
}

// SearchContents 콘텐츠 검색 (페이징 지원)
func SearchContents(db *sql.DB, query string, userID int64, page, size int) (*PageInfo, error) {
	// 페이징 설정
	if page < 0 {
		page = 0
	}
	if size <= 0 {
		size = 10
	}
	offset := page * size

	// 전체 검색 결과 수 조회
	var totalElements int
	err := db.QueryRow(`
		SELECT COUNT(*) 
		FROM Contents c
		WHERE c.title LIKE ?
	`, "%"+query+"%").Scan(&totalElements)
	if err != nil {
		return nil, err
	}

	// 검색 쿼리 실행 (페이징 적용)
	rows, err := db.Query(`
		SELECT 
			c.id, c.title, c.thumbnail_url, c.release_year
		FROM 
			Contents c
		WHERE 
			c.title LIKE ?
		ORDER BY 
			c.release_year DESC, c.title ASC
		LIMIT ? OFFSET ?
	`, "%"+query+"%", size, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	contentList := []ContentListResponse{}
	contentIDs := []int64{}

	// 기본 콘텐츠 정보 읽기
	for rows.Next() {
		var content ContentListResponse
		if err := rows.Scan(&content.ID, &content.Title, &content.ThumbnailURL, &content.ReleaseYear); err != nil {
			return nil, err
		}
		contentList = append(contentList, content)
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
		contentList[i].Genres = genres
	}

	// 로그인한 사용자가 있는 경우 찜 정보 조회
	if userID > 0 {
		for i, contentID := range contentIDs {
			var count int
			err := db.QueryRow(`
				SELECT 
					COUNT(*)
				FROM 
					Wishlists
				WHERE 
					user_id = ? AND content_id = ?
			`, userID, contentID).Scan(&count)

			if err != nil {
				return nil, err
			}

			contentList[i].IsWishlisted = count > 0
		}
	}

	// 페이징 정보 구성
	totalPages := (totalElements + size - 1) / size // 올림 계산
	numberOfElements := len(contentList)

	pageInfo := &PageInfo{
		Content: contentList,
		Pageable: Pageable{
			PageNumber: page,
			PageSize:   size,
			Offset:     offset,
		},
		TotalPages:       totalPages,
		TotalElements:    totalElements,
		Last:             page >= totalPages-1,
		Size:             size,
		Number:           page,
		NumberOfElements: numberOfElements,
		First:            page == 0,
		Empty:            numberOfElements == 0,
	}

	return pageInfo, nil
}

// GetContentsByGenre 장르별 콘텐츠 조회 (페이징 지원)
func GetContentsByGenre(db *sql.DB, genreID, userID int64, page, size int) (*PageInfo, error) {
	// 페이징 설정
	if page < 0 {
		page = 0
	}
	if size <= 0 {
		size = 10
	}
	offset := page * size

	// 전체 장르별 콘텐츠 수 조회
	var totalElements int
	err := db.QueryRow(`
		SELECT COUNT(*) 
		FROM Contents c
		JOIN ContentGenres cg ON c.id = cg.content_id
		WHERE cg.genre_id = ?
	`, genreID).Scan(&totalElements)
	if err != nil {
		return nil, err
	}

	// 장르별 콘텐츠 쿼리 실행 (페이징 적용)
	rows, err := db.Query(`
		SELECT 
			c.id, c.title, c.thumbnail_url, c.release_year
		FROM 
			Contents c
		JOIN 
			ContentGenres cg ON c.id = cg.content_id
		WHERE 
			cg.genre_id = ?
		ORDER BY 
			c.release_year DESC, c.title ASC
		LIMIT ? OFFSET ?
	`, genreID, size, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	contentList := []ContentListResponse{}
	contentIDs := []int64{}

	// 기본 콘텐츠 정보 읽기
	for rows.Next() {
		var content ContentListResponse
		if err := rows.Scan(&content.ID, &content.Title, &content.ThumbnailURL, &content.ReleaseYear); err != nil {
			return nil, err
		}
		contentList = append(contentList, content)
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
		contentList[i].Genres = genres
	}

	// 로그인한 사용자가 있는 경우 찜 정보 조회
	if userID > 0 {
		for i, contentID := range contentIDs {
			var count int
			err := db.QueryRow(`
				SELECT 
					COUNT(*)
				FROM 
					Wishlists
				WHERE 
					user_id = ? AND content_id = ?
			`, userID, contentID).Scan(&count)

			if err != nil {
				return nil, err
			}

			contentList[i].IsWishlisted = count > 0
		}
	}

	// 페이징 정보 구성
	totalPages := (totalElements + size - 1) / size // 올림 계산
	numberOfElements := len(contentList)

	pageInfo := &PageInfo{
		Content: contentList,
		Pageable: Pageable{
			PageNumber: page,
			PageSize:   size,
			Offset:     offset,
		},
		TotalPages:       totalPages,
		TotalElements:    totalElements,
		Last:             page >= totalPages-1,
		Size:             size,
		Number:           page,
		NumberOfElements: numberOfElements,
		First:            page == 0,
		Empty:            numberOfElements == 0,
	}

	return pageInfo, nil
}
