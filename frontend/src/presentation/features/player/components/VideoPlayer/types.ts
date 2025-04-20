import ReactPlayer from "react-player";

export interface VideoPlayerProps {
  streamingUrl: string;
  lastPosition: number;
  contentId: number;
  onUpdatePlayback: (data: {
    content_id: number;
    current_position: number;
    watch_duration: number;
  }) => void;
  onSaveFinalPosition: (data: {
    content_id: number;
    final_position: number;
    watch_duration: number;
    is_completed: boolean;
  }) => void;
  onUpdateHistory: (data: {
    content_id: number;
    last_position: number;
    watch_duration: number;
    is_completed: boolean;
  }) => void;
}

export interface VideoControlsProps {
  playerRef: React.RefObject<ReactPlayer>;
  isSeeking: boolean;
  setIsSeeking: React.Dispatch<React.SetStateAction<boolean>>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  togglePlay: () => void;
  isVisible: boolean;
}
