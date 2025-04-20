package model

// 표준 응답 구조체 정의
// @Description 표준 API 응답 구조체
type ApiResponse struct {
	Success bool        `json:"success" example:"true"`
	Data    interface{} `json:"data"`
}

// 배열 데이터를 포함하는 응답 구조체
// @Description 배열 데이터를 포함하는 API 응답 구조체
type ArrayResponse struct {
	Success bool        `json:"success" example:"true"`
	Data    interface{} `json:"data"`
}

// 에러 응답 구조체
// @Description 에러 API 응답 구조체
type ErrorResponse struct {
	Error string `json:"error" example:"오류 메시지"`
}

// 페이징 메타데이터를 포함한 응답 구조체
// @Description 페이징 메타데이터를 포함한 API 응답 구조체
type PagingResponse struct {
	Success bool        `json:"success" example:"true"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data"`
}

// 페이징 정보
// @Description 페이징 정보 구조체
type PageInfo struct {
	Content          interface{} `json:"content"`
	Pageable         Pageable    `json:"pageable"`
	TotalPages       int         `json:"totalPages"`
	TotalElements    int         `json:"totalElements"`
	Last             bool        `json:"last"`
	Size             int         `json:"size"`
	Number           int         `json:"number"`
	NumberOfElements int         `json:"numberOfElements"`
	First            bool        `json:"first"`
	Empty            bool        `json:"empty"`
}

// 페이징 세부 정보
// @Description 페이징 세부 정보 구조체
type Pageable struct {
	PageNumber int `json:"pageNumber"`
	PageSize   int `json:"pageSize"`
	Offset     int `json:"offset"`
}
