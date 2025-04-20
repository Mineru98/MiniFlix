import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/application/store/auth';
import { useQuery } from '@tanstack/react-query';
import { ContentListResponse, getAllContents, getAllGenres } from '@/infrastructure/api';
import { useContentsByGenres } from '@/application/hooks/api/content';
import { useViewingHistory } from '@/application/hooks/api/content';
import { useWishlists } from '@/application/hooks/api/wishlist/use_wishlist';
import Banner from '@/presentation/components/organisms/Banner';
import ContentRow from '@/presentation/components/organisms/ContentRow';
import { Image, Heart } from 'lucide-react';

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
  const {
    data: contentsData,
  } = useQuery({
    queryKey: ['contents'],
    queryFn: getAllContents,
    enabled: mounted && isAuthenticated,
  });

  // 시청 기록 데이터 가져오기
  const {
    inProgressContents,
    isLoading: isViewingHistoryLoading,
  } = useViewingHistory({
    enabled: mounted && isAuthenticated,
    limit: 6, // 최대 6개까지 표시
  });

  // 찜 목록 데이터 가져오기
  const {
    data: wishlistsData,
    isLoading: isWishlistsLoading,
  } = useWishlists();

  // 장르 데이터 가져오기
  const { data: genresData, isLoading: isGenresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getAllGenres,
    enabled: mounted && isAuthenticated,
  });

  // 실제 콘텐츠 배열을 꺼내서 contentsList 로 관리
  const contentsList = Array.isArray(contentsData?.data) ? contentsData.data : [];
  
  // 실제 장르 배열 관리
  const genresList = Array.isArray(genresData?.data) ? genresData.data : [];

  // 배너용 콘텐츠 (첫 번째 콘텐츠)
  const bannerContent = contentsList[0] || {
    id: 1,
    title: 'MiniFlix 오리지널',
    description: '콘텐츠를 불러올 수 없습니다.',
    thumbnail_url: '',
  };

  // 계속 시청하기 콘텐츠 - 시청 기록에서 가져옴 (ContentListResponse 타입에 맞춤)
  const continueWatchingContents: ContentListResponse[] = inProgressContents.map(item => ({
    id: item.content_id,
    title: item.title,
    thumbnail_url: item.thumbnail_url,
    release_year: 0, // 시청 기록에는 없는 정보이므로 기본값 설정
    genres: [], // 시청 기록에는 없는 정보이므로 빈 배열로 설정
    is_wishlisted: false, // 시청 기록에는 없는 정보이므로 기본값 설정
    // 추가 정보 - 커스텀 속성
    description: `${Math.round(item.progress_percent)}% 시청 완료`,
    progress_percent: item.progress_percent,
  }));

  // 찜 목록 콘텐츠
  const wishlistContents: ContentListResponse[] = wishlistsData?.data || [];

  // 여러 장르의 콘텐츠를 병렬로 가져오기 (장르 데이터가 로드된 후에만)
  const genreQueries = useContentsByGenres(genresList, {
    enabled: mounted && isAuthenticated && !isGenresLoading && genresList.length > 0,
    pagination: { page: 0, size: 10 },
  });

  // 3) 마운트 전에는 로딩 화면
  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-xl">로딩 중...</p>
      </main>
    );
  }

  // 4) 인증되지 않은 경우 아무것도 렌더링 안 함
  if (!isAuthenticated) {
    return null;
  }

  // 5) 인증된 사용자에게만 홈 화면 렌더
  return (
    <main className="flex min-h-screen flex-col bg-black text-white">
      {/* 배너 섹션 */}
      <Banner content={bannerContent} />

      {/* 컨텐츠 행 섹션 */}
      <div className="px-4 -mt-16 relative z-10 pb-20">
        <ContentRow
          title="계속 시청하기"
          contents={continueWatchingContents}
          isLoading={isViewingHistoryLoading}
          emptyIcon={<Image size={48} />}
          emptyMessage="아직 시청한 콘텐츠가 없습니다"
        />

        {/* 찜 목록 콘텐츠 행 */}
        <ContentRow
          title="내가 찜한 콘텐츠"
          contents={wishlistContents}
          isLoading={isWishlistsLoading}
          emptyIcon={<Heart size={48} />}
          emptyMessage="아직 찜한 콘텐츠가 없습니다"
        />

        {/* 장르별 콘텐츠 행 */}
        {genresList.map((genre, index) => {
          const genreQuery = genreQueries[index];
          const genreContents = genreQuery?.data?.data?.content || [];

          return (
            <ContentRow
              key={genre.id}
              title={`${genre.name} - ${genre.description}`}
              contents={genreContents}
              isLoading={genreQuery?.isLoading || isGenresLoading}
              emptyIcon={<Image size={48} />}
            />
          );
        })}
      </div>
    </main>
  );
}
