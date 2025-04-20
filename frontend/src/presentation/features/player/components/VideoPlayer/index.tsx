import React, { useEffect, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { useRouter } from 'next/router';
import { 
  usePlayerStore 
} from '@/application/store';
import { VideoPlayerProps } from './types';
import { 
  VideoPlayerContainer,
  VideoWrapper,
  BackButton
} from './styles';
import VideoControls from '../VideoControls';

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  streamingUrl, 
  lastPosition,
  contentId,
  onUpdatePlayback,
  onSaveFinalPosition,
  onUpdateHistory
}) => {
  const router = useRouter();
  const playerRef = useRef<ReactPlayer>(null);
  const [showControls, setShowControls] = React.useState(false);
  const [isSeeking, setIsSeeking] = React.useState(false);

  // Player 상태
  const {
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    setCurrentTime,
    setDuration,
    setIsPlaying,
  } = usePlayerStore();
  
  // 주기적인 재생 위치 업데이트 (30초마다)
  useEffect(() => {
    if (!contentId || !isPlaying) return;

    const interval = setInterval(() => {
      if (playerRef.current && !isSeeking) {
        const currentPosition = playerRef.current.getCurrentTime();
        onUpdatePlayback({
          content_id: contentId,
          current_position: currentPosition,
          watch_duration: 30, // 30초마다 업데이트
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [contentId, isPlaying, onUpdatePlayback, isSeeking]);

  // 페이지 언마운트 시 최종 위치 저장
  useEffect(() => {
    return () => {
      if (contentId && playerRef.current) {
        const finalPosition = playerRef.current.getCurrentTime();
        const videoDuration = playerRef.current.getDuration();
        
        // 최종 재생 위치 저장
        onSaveFinalPosition({
          content_id: contentId,
          final_position: finalPosition,
          watch_duration: finalPosition, // 전체 시청 시간
          is_completed: finalPosition > videoDuration * 0.9, // 90% 이상 시청 시 완료로 처리
        });
        
        // 시청 기록 업데이트
        onUpdateHistory({
          content_id: contentId,
          last_position: finalPosition,
          watch_duration: finalPosition,
          is_completed: finalPosition > videoDuration * 0.9,
        });
      }
    };
  }, [contentId, onSaveFinalPosition, onUpdateHistory]);

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

  return (
    <VideoPlayerContainer
      onMouseMove={handleMouseMove}
    >
      <VideoWrapper>
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
            <BackButton onClick={handleBack}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </BackButton>
            
            <VideoControls 
              playerRef={playerRef}
              isSeeking={isSeeking}
              setIsSeeking={setIsSeeking}
              currentTime={currentTime}
              duration={duration}
              isPlaying={isPlaying}
              playbackRate={playbackRate}
              togglePlay={togglePlay}
            />
          </>
        )}
      </VideoWrapper>
    </VideoPlayerContainer>
  );
};

export default VideoPlayer; 