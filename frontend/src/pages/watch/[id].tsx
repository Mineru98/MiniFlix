import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  useStreaming, 
  useUpdatePlaybackPosition, 
  useSaveFinalPosition, 
  useUpdateViewingHistory 
} from '@/application/hooks/api/content/use_streaming';
import useAuthStore from '@/application/store/auth';
import VideoPlayer from '@/presentation/features/player/components/VideoPlayer';

const WatchPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const contentId = parseInt(id as string);
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

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

  return (
    <React.Fragment>
      <Head>
        <title>시청 중 - MiniFlix</title>
      </Head>
      
      <VideoPlayer 
        streamingUrl={streamingUrl}
        lastPosition={lastPosition}
        contentId={contentId}
        onUpdatePlayback={updatePlayback}
        onSaveFinalPosition={saveFinal}
        onUpdateHistory={updateHistory}
      />
    </React.Fragment>
  );
};

export default WatchPage; 