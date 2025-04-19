package test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"backend/config"
	"backend/helper"
	"backend/model"
	"backend/route"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockContentService는 ContentService를 모킹하기 위한 구조체
type MockContentService struct {
	mock.Mock
}

func (m *MockContentService) GetStreamingURL(contentID int64, userID int64) (*model.StreamingResponse, error) {
	args := m.Called(contentID, userID)
	if args.Get(0) == nil {
		return nil, args.Error(1)
	}
	return args.Get(0).(*model.StreamingResponse), args.Error(1)
}

func (m *MockContentService) UpdatePlaybackPosition(req *model.PlaybackPositionRequest, userID int64) error {
	args := m.Called(req, userID)
	return args.Error(0)
}

func (m *MockContentService) SaveFinalPosition(req *model.FinalPositionRequest, userID int64) error {
	args := m.Called(req, userID)
	return args.Error(0)
}

// setupTestRouter 테스트용 라우터 설정
func setupTestRouterWithMock(cfg *config.Config, contentService *MockContentService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	apiGroup := router.Group("/api")

	// 콘텐츠 라우트 설정 (모의 서비스 사용)
	route.SetupContentRoutesWithMockService(apiGroup, cfg, contentService)

	return router
}

// createAuthHeader JWT 토큰으로 인증 헤더 생성
func createAuthHeader(userID int64, cfg *config.Config) string {
	// 테스트용 토큰 생성
	token, _ := helper.GenerateToken(userID, "테스트사용자", "test@example.com", cfg)
	return fmt.Sprintf("Bearer %s", token)
}

// TestContentStreaming 콘텐츠 스트리밍 테스트
func TestContentStreaming(t *testing.T) {
	// 테스트 환경 설정
	SetupTestDatabase(t)
	defer TeardownTestDatabase(t)

	// 설정 로드
	cfg := config.LoadConfig()
	cfg.JWTSecret = "test_secret_key"
	cfg.JWTExpireHours = 24

	// 모의 콘텐츠 서비스 생성
	mockContentService := new(MockContentService)

	// 테스트용 라우터 설정 (모의 서비스 사용)
	router := setupTestRouterWithMock(cfg, mockContentService)

	// 테스트 사용자 ID
	userID := int64(1)

	// 테스트 콘텐츠 ID
	contentID := int64(1)

	// 1. 콘텐츠 스트리밍 요청 테스트
	t.Run("1. 스트리밍 URL 요청", func(t *testing.T) {
		// 모의 응답 설정
		streamingResp := &model.StreamingResponse{
			ContentID:    contentID,
			StreamingURL: "https://example.com/stream/test.mp4",
			LastPosition: 0,
		}
		mockContentService.On("GetStreamingURL", contentID, userID).Return(streamingResp, nil)

		// 요청 생성
		req, _ := http.NewRequest("GET", fmt.Sprintf("/api/contents/%d/stream", contentID), nil)
		req.Header.Set("Authorization", createAuthHeader(userID, cfg))

		// 응답 기록
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// 상태 코드 확인
		assert.Equal(t, http.StatusOK, w.Code)

		// 응답 파싱
		var response model.StreamingResponse
		err := json.Unmarshal(w.Body.Bytes(), &response)

		// 응답 검증
		assert.NoError(t, err)
		assert.Equal(t, contentID, response.ContentID)
		assert.NotEmpty(t, response.StreamingURL)
	})

	// 2. 주기적 재생 위치 업데이트 테스트
	t.Run("2. 재생 위치 주기적 업데이트", func(t *testing.T) {
		// 재생 중 현재 위치 (30초 지점)
		currentPosition := 30
		watchDuration := 30

		// 요청 데이터 구성
		playbackReq := model.PlaybackPositionRequest{
			ContentID:       contentID,
			CurrentPosition: currentPosition,
			WatchDuration:   watchDuration,
			IsCompleted:     false,
		}

		// 모의 동작 설정
		mockContentService.On("UpdatePlaybackPosition", &playbackReq, userID).Return(nil)

		// JSON으로 변환
		reqBody, _ := json.Marshal(playbackReq)

		// 요청 생성
		req, _ := http.NewRequest("POST", fmt.Sprintf("/api/contents/%d/playback", contentID), bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", createAuthHeader(userID, cfg))

		// 응답 기록
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// 상태 코드 확인
		assert.Equal(t, http.StatusOK, w.Code)

		// 응답 확인
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)

		// 메시지 확인
		assert.Contains(t, response["message"], "재생 위치가 업데이트되었습니다")
	})

	// 3. 여러 번의 주기적 업데이트 시뮬레이션
	t.Run("3. 여러 번의 주기적 업데이트", func(t *testing.T) {
		// 여러 시간 간격으로 업데이트 시뮬레이션
		intervals := []int{60, 90, 120, 150, 180}

		for i, currentPosition := range intervals {
			// 요청 데이터 구성
			playbackReq := model.PlaybackPositionRequest{
				ContentID:       contentID,
				CurrentPosition: currentPosition,
				WatchDuration:   currentPosition, // 간단하게 같은 값으로 가정
				IsCompleted:     false,
			}

			// 모의 동작 설정
			mockContentService.On("UpdatePlaybackPosition", &playbackReq, userID).Return(nil)

			// JSON으로 변환
			reqBody, _ := json.Marshal(playbackReq)

			// 요청 생성
			req, _ := http.NewRequest("POST", fmt.Sprintf("/api/contents/%d/playback", contentID), bytes.NewBuffer(reqBody))
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Authorization", createAuthHeader(userID, cfg))

			// 응답 기록
			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			// 상태 코드 확인
			assert.Equal(t, http.StatusOK, w.Code, "시뮬레이션 "+strconv.Itoa(i)+"번째 업데이트 실패")
		}
	})

	// 4. 최종 재생 위치 저장 테스트
	t.Run("4. 최종 재생 위치 저장", func(t *testing.T) {
		// 최종 재생 위치
		finalPosition := 200
		totalWatchDuration := 200

		// 요청 데이터 구성
		finalReq := model.FinalPositionRequest{
			ContentID:     contentID,
			FinalPosition: finalPosition,
			WatchDuration: totalWatchDuration,
			IsCompleted:   true, // 시청 완료
		}

		// 모의 동작 설정
		mockContentService.On("SaveFinalPosition", &finalReq, userID).Return(nil)

		// JSON으로 변환
		reqBody, _ := json.Marshal(finalReq)

		// 요청 생성
		req, _ := http.NewRequest("POST", fmt.Sprintf("/api/contents/%d/final-position", contentID), bytes.NewBuffer(reqBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", createAuthHeader(userID, cfg))

		// 응답 기록
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// 상태 코드 확인
		assert.Equal(t, http.StatusOK, w.Code)

		// 응답 확인
		var response map[string]interface{}
		json.Unmarshal(w.Body.Bytes(), &response)

		// 메시지 확인
		assert.Contains(t, response["message"], "최종 재생 위치가 저장되었습니다")
	})

	// 5. 비로그인 사용자가 스트리밍 요청 시 실패 테스트
	t.Run("5. 비로그인 사용자 접근 거부", func(t *testing.T) {
		// 요청 생성 (인증 헤더 없음)
		req, _ := http.NewRequest("GET", fmt.Sprintf("/api/contents/%d/stream", contentID), nil)

		// 응답 기록
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// 상태 코드 확인 (401 Unauthorized 예상)
		assert.Equal(t, http.StatusUnauthorized, w.Code)
	})

	// 6. 스트리밍 후 다시 접속 시 마지막 위치 조회 테스트
	t.Run("6. 마지막 시청 위치 조회", func(t *testing.T) {
		// 기존 모의 호출 제거 및 새 모의 서비스 설정
		mockContentService = new(MockContentService)

		// 모의 응답 설정 (마지막 위치 포함)
		streamingResp := &model.StreamingResponse{
			ContentID:    contentID,
			StreamingURL: "https://example.com/stream/test.mp4",
			LastPosition: 200, // 이전에 저장했던 위치
		}
		mockContentService.On("GetStreamingURL", contentID, userID).Return(streamingResp, nil)

		// 라우터 재설정 (새 모의 서비스 사용)
		router = setupTestRouterWithMock(cfg, mockContentService)

		// 요청 생성
		req, _ := http.NewRequest("GET", fmt.Sprintf("/api/contents/%d/stream", contentID), nil)
		req.Header.Set("Authorization", createAuthHeader(userID, cfg))

		// 응답 기록
		w := httptest.NewRecorder()
		router.ServeHTTP(w, req)

		// 상태 코드 확인
		assert.Equal(t, http.StatusOK, w.Code)

		// 응답 로그 출력 (디버깅용)
		t.Logf("응답 본문: %s", w.Body.String())

		// JSON에서 직접 LastPosition 필드 확인
		var respMap map[string]interface{}
		err := json.Unmarshal(w.Body.Bytes(), &respMap)
		assert.NoError(t, err, "JSON 파싱 오류")

		// LastPosition이 존재하는지 확인
		lastPosition, exists := respMap["last_position"]
		assert.True(t, exists, "응답에 last_position 필드가 없음")

		// float64로 변환된 LastPosition 값
		lastPositionFloat, ok := lastPosition.(float64)
		assert.True(t, ok, "last_position을 숫자로 변환할 수 없음")

		// 예상값과 실제값 비교
		t.Logf("예상 LastPosition: %d, 실제 LastPosition: %.0f", streamingResp.LastPosition, lastPositionFloat)
		assert.Equal(t, float64(streamingResp.LastPosition), lastPositionFloat, "LastPosition 불일치")

		// 표준 모델로 파싱
		var response model.StreamingResponse
		json.Unmarshal(w.Body.Bytes(), &response)

		// 응답 모델 필드 검증
		assert.Equal(t, contentID, response.ContentID, "ContentID 불일치")
		assert.Equal(t, streamingResp.StreamingURL, response.StreamingURL, "StreamingURL 불일치")
		assert.Equal(t, streamingResp.LastPosition, response.LastPosition, "LastPosition 불일치")
	})
}
