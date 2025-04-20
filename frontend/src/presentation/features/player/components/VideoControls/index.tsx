import React, { useRef, useCallback } from 'react';
import { Play, Pause, Volume2, Settings } from 'lucide-react';
import { VideoControlsProps } from '../VideoPlayer/types';
import { usePlayerStore } from '@/application/store';
import {
  ControlsOverlay,
  ProgressBar,
  ProgressFill,
  ControlsRow,
  ControlButton,
  TimeDisplay
} from '../VideoPlayer/styles';

const VideoControls: React.FC<VideoControlsProps> = ({
  playerRef,
  isSeeking,
  setIsSeeking,
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  togglePlay
}) => {
  const progressRef = useRef<HTMLDivElement>(null);
  const { setPlaybackRate } = usePlayerStore();

  // 프로그레스바 클릭 처리
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !playerRef.current) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const seekTime = pos * duration;
    
    setIsSeeking(true);
    playerRef.current.seekTo(seekTime);
    setTimeout(() => setIsSeeking(false), 100);
  }, [duration, playerRef, setIsSeeking]);

  // 재생 속도 변경
  const handlePlaybackRateChange = useCallback(() => {
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];
    
    setPlaybackRate(newRate);
  }, [playbackRate, setPlaybackRate]);

  // 시간 형식 변환 (초 -> 분:초)
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }, []);

  return (
    <ControlsOverlay>
      <ProgressBar
        onClick={handleProgressClick}
        ref={progressRef}
      >
        <ProgressFill
          style={{ width: `${(currentTime / duration) * 100}%` }}
        />
      </ProgressBar>
      
      <ControlsRow>
        <div className="flex items-center">
          <ControlButton onClick={togglePlay}>
            {isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} />
            )}
          </ControlButton>
          
          <TimeDisplay>
            {formatTime(currentTime)} / {formatTime(duration)}
          </TimeDisplay>
        </div>
        
        <div className="flex items-center">
          <ControlButton onClick={handlePlaybackRateChange}>
            <Settings size={16} />
            <span>Speed ({playbackRate}x)</span>
          </ControlButton>
          
          <ControlButton>
            <Volume2 size={16} />
          </ControlButton>
        </div>
      </ControlsRow>
    </ControlsOverlay>
  );
};

export default VideoControls; 