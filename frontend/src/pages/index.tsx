// src/pages/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/application/store/auth';
import { useQuery } from '@tanstack/react-query';
import { getAllContents, getContentsByGenre, getAllGenres } from '@/infrastructure/api';
import Banner from '@/presentation/components/organisms/Banner';
import ContentRow from '@/presentation/components/organisms/ContentRow';
import { Image } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // 1) 컴포넌트가 클라이언트에서 마운트된 직후 플래그를 true 로 설정
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2) 마운트 완료 후, 미인증 시 로그인 페이지로 리디렉트
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // 모든 콘텐츠 데이터 가져오기
  const { data: contentsData, isLoading: isContentsLoading } = useQuery({
    queryKey: ['contents'],
    queryFn: getAllContents,
    enabled: mounted && isAuthenticated
  });

  // 장르 데이터 가져오기
  const { data: genresData } = useQuery({
    queryKey: ['genres'],
    queryFn: getAllGenres,
    enabled: mounted && isAuthenticated
  });

  // 장르 ID 찾기 (여기에서는 첫 번째와 두 번째 장르 사용)
  const actionGenreId = genresData?.data?.[0]?.id || 1;
  const comedyGenreId = genresData?.data?.[1]?.id || 2;

  // 첫 번째 장르 콘텐츠 가져오기
  const { data: actionContents, isLoading: isActionLoading } = useQuery({
    queryKey: ['contents', 'genre', actionGenreId],
    queryFn: () => getContentsByGenre(actionGenreId),
    enabled: mounted && isAuthenticated && !!actionGenreId
  });

  // 두 번째 장르 콘텐츠 가져오기
  const { data: comedyContents, isLoading: isComedyLoading } = useQuery({
    queryKey: ['contents', 'genre', comedyGenreId],
    queryFn: () => getContentsByGenre(comedyGenreId),
    enabled: mounted && isAuthenticated && !!comedyGenreId
  });

  // 배너용 콘텐츠 (첫 번째 콘텐츠)
  const bannerContent = contentsData?.data?.[0];
  
  // 계속 시청하기 (최근에 시청한 콘텐츠를 보여줘야 하지만, 지금은 임의로 일부 콘텐츠만 표시)
  const continueWatchingContents = contentsData?.data?.slice(0, 4) || [];

  // 인기 콘텐츠 (첫 번째 장르 콘텐츠 또는 기본 콘텐츠)
  const popularContents = actionContents?.data || contentsData?.data?.slice(0, 8) || [];
  
  // 오리지널 콘텐츠 (두 번째 장르 콘텐츠 또는 다른 콘텐츠)
  const originalContents = comedyContents?.data || contentsData?.data?.slice(8, 16) || [];

  // 장르 이름 가져오기
  const actionGenreName = genresData?.data?.find(genre => genre.id === actionGenreId)?.name || '인기 콘텐츠';
  const comedyGenreName = genresData?.data?.find(genre => genre.id === comedyGenreId)?.name || 'MiniFlix 오리지널';

  // 3) 마운트 전(서버 사이드 렌더/클라이언트 하이드레이션 전)에는
  //    서버와 클라이언트가 동일한 로딩 화면을 렌더링
  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-xl">로딩 중...</p>
      </main>
    );
  }

  // 4) 마운트 후, 인증되지 않은 상태라면 아무것도 렌더링하지 않음
  //    (리디렉트가 실행 중이므로 사용자에게는 보이지 않음)
  if (!isAuthenticated) {
    return null;
  }

  // 5) 인증된 사용자에게만 홈 화면 렌더
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* 배너 섹션 */}
      <Banner 
        content={bannerContent || {
          id: 1,
          title: "MiniFlix 오리지널",
          description: "콘텐츠를 불러올 수 없습니다.",
          thumbnail_url: ""
        }} 
      />
      
      {/* 컨텐츠 행 섹션 */}
      <div className="px-4 -mt-16 relative z-10 pb-20">
        <ContentRow 
          title="계속 시청하기" 
          contents={continueWatchingContents}
          isLoading={isContentsLoading}
          emptyIcon={<Image size={48} />}
        />
        
        <ContentRow 
          title={actionGenreName} 
          contents={popularContents}
          isLoading={isContentsLoading || isActionLoading}
          emptyIcon={<Image size={48} />}
        />
        
        <ContentRow 
          title={comedyGenreName} 
          contents={originalContents}
          isLoading={isContentsLoading || isComedyLoading}
          emptyIcon={<Image size={48} />}
        />
      </div>
    </main>
  );
}
