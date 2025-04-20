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
