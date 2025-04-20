import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import ReactPlayer from 'react-player';
import { 
  useStreaming, 
  useUpdatePlaybackPosition, 
  useSaveFinalPosition, 
  useUpdateViewingHistory 
} from '@/application/hooks/api/content/use_streaming';
import { usePlayerStore } from '@/application/store';
import useAuthStore from '@/application/store/auth';
import Head from 'next/head';

// 비디오 플레이어 스타일
const VideoPlayerContainer = `
  w-full h-screen bg-black flex flex-col items-center justify-center relative
`;

const VideoWrapper = `
  w-full h-full relative
`;

const ControlsOverlay = `
  absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent transition-opacity duration-300
`;

const ProgressBar = `
  w-full h-1 bg-gray-800 cursor-pointer group
`;

const ProgressFill = `
  h-full bg-red-600
`;

const ControlsRow = `
  flex items-center justify-between text-white mt-2
`;

const ControlButton = `
  p-2 hover:text-gray-400 flex items-center gap-1 text-sm
`;

const SpeedButton = `
  p-2 hover:text-gray-400 text-sm flex items-center gap-1
`;

const SubtitleButton = `
  p-2 hover:text-gray-400 text-sm flex items-center gap-1
`;

const BackButton = `
  absolute top-4 left-4 text-white p-2 hover:text-gray-300
`;

const VideoPlayer = () => {
  const router = useRouter();
  const { id } = router.query;
  const contentId = parseInt(id as string);
  const { isAuthenticated } = useAuthStore();
  const playerRef = useRef<ReactPlayer>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [showControls, setShowControls] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isSeeking, setIsSeeking] = useState(false);

  // Player 상태
  const {
    currentTime,
    duration,
    isPlaying,
    setCurrentTime,
    setDuration,
    setIsPlaying,
    setPlaybackRate: setStorePlaybackRate,
  } = usePlayerStore();

  // API 훅
  const { data: streamingData, isLoading } = useStreaming(contentId);
  const { mutate: updatePlayback } = useUpdatePlaybackPosition(contentId);
  const { mutate: saveFinal } = useSaveFinalPosition(contentId);
  const { mutate: updateHistory } = useUpdateViewingHistory(contentId);

  // 컴포넌트 마운트 플래그 설정
  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트 후 인증 확인 및 리디렉션
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // 주기적인 재생 위치 업데이트 (30초마다)
  useEffect(() => {
    if (!contentId || !isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current && !isSeeking) {
        const currentPosition = playerRef.current.getCurrentTime();
        updatePlayback({
          content_id: contentId,
          current_position: currentPosition,
          watch_duration: 30, // 30초마다 업데이트
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [contentId, isPlaying, updatePlayback, isSeeking]);

  // 페이지 언마운트 시 최종 위치 저장
  useEffect(() => {
    return () => {
      if (contentId && playerRef.current) {
        const finalPosition = playerRef.current.getCurrentTime();
        const videoDuration = playerRef.current.getDuration();
        
        // 최종 재생 위치 저장
        saveFinal({
          content_id: contentId,
          final_position: finalPosition,
          watch_duration: finalPosition, // 전체 시청 시간
          is_completed: finalPosition > videoDuration * 0.9, // 90% 이상 시청 시 완료로 처리
        });
        
        // 시청 기록 업데이트
        updateHistory({
          content_id: contentId,
          last_position: finalPosition,
          watch_duration: finalPosition,
          is_completed: finalPosition > videoDuration * 0.9,
        });
      }
    };
  }, [contentId, saveFinal, updateHistory]);

  // 컨트롤 표시 토글
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    // 3초 후 컨트롤 숨김
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // 재생/일시정지 토글
  const togglePlay = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying, setIsPlaying]);

  // 뒤로가기
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  // 재생 속도 변경
  const handlePlaybackRateChange = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    
    setPlaybackRate(newRate);
    setStorePlaybackRate(newRate);
  }, [playbackRate, setStorePlaybackRate]);

  // 프로그레스바 클릭 처리
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !playerRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * duration;
    
    setCurrentTime(seekTime);
    playerRef.current.seekTo(seekTime);
  }, [duration, setCurrentTime]);

  // 비디오 재생 진행 이벤트
  const handleProgress = useCallback(({ played, playedSeconds }: { played: number, playedSeconds: number }) => {
    if (!isSeeking) {
      setCurrentTime(playedSeconds);
    }
  }, [isSeeking, setCurrentTime]);

  // 비디오 로드 완료 이벤트
  const handleDuration = useCallback((duration: number) => {
    setDuration(duration);
  }, [setDuration]);

  // 마운트 전에는 로딩 화면
  if (!mounted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-xl">로딩 중...</p>
      </div>
    );
  }

  // 인증되지 않은 경우 아무것도 렌더링 안 함
  if (!isAuthenticated) {
    return null;
  }

  // 스트리밍 정보 로딩 중
  if (isLoading || !streamingData?.data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-xl">비디오 로딩 중...</p>
      </div>
    );
  }

  const streamingUrl = streamingData.data.streaming_url;
  const lastPosition = streamingData.data.last_position || 0;

  // 시간 형식 변환 (초 -> 분:초)
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <>
      <Head>
        <title>시청 중 - MiniFlix</title>
      </Head>
      
      <div 
        className={VideoPlayerContainer}
        onMouseMove={handleMouseMove}
      >
        <div className={VideoWrapper}>
          <ReactPlayer
            ref={playerRef}
            url={streamingUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            playbackRate={playbackRate}
            controls={false}
            onProgress={handleProgress}
            onDuration={handleDuration}
            progressInterval={500}
            onReady={() => {
              // 마지막 시청 위치로 이동
              if (lastPosition > 0 && playerRef.current) {
                playerRef.current.seekTo(lastPosition);
              }
              // 자동 재생
              setIsPlaying(true);
            }}
            onClick={togglePlay}
            style={{ backgroundColor: '#000000' }}
          />
          
          {showControls && (
            <>
              <div className={BackButton} onClick={handleBack}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </div>
              
              <div className={ControlsOverlay}>
                <div 
                  className={ProgressBar}
                  onClick={handleProgressClick}
                  ref={progressRef}
                >
                  <div 
                    className={ProgressFill} 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  />
                </div>
                
                <div className={ControlsRow}>
                  <div className="flex items-center">
                    <button className={ControlButton} onClick={togglePlay}>
                      {isPlaying ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="6" y="4" width="4" height="16"></rect>
                          <rect x="14" y="4" width="4" height="16"></rect>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                      )}
                    </button>
                    
                    <span className="text-white ml-3">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center">
                    <button className={SpeedButton} onClick={handlePlaybackRateChange}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 5L5 19"></path>
                        <circle cx="6.5" cy="6.5" r="2.5"></circle>
                        <circle cx="17.5" cy="17.5" r="2.5"></circle>
                      </svg>
                      <span>Speed ({playbackRate}x)</span>
                    </button>
                    
                    <button className={SubtitleButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect>
                        <polyline points="17 2 12 7 7 2"></polyline>
                      </svg>
                      <span>Audio & Subtitles</span>
                    </button>
                    
                    <button className={ControlButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                      <span>Episodes</span>
                    </button>
                    
                    <button className={ControlButton}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <polygon points="8 8 16 12 8 16 8 8"></polygon>
                      </svg>
                      <span>Next Episode</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default VideoPlayer; 