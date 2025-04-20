import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/application/store/auth';
import { useQuery } from '@tanstack/react-query';
import { getAllGenres } from '@/infrastructure/api';
import { useContentsByGenres } from '@/application/hooks/api/content';
import ContentRow from '@/presentation/components/organisms/ContentRow';
import { Image } from 'lucide-react';

export default function SeriesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // 컴포넌트가 클라이언트에서 마운트된 직후 플래그를 true로 설정
  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트 완료 후, 미인증 시 로그인 페이지로 리디렉트
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // 장르 데이터 가져오기
  const { data: genresData, isLoading: isGenresLoading } = useQuery({
    queryKey: ['genres'],
    queryFn: getAllGenres,
    enabled: mounted && isAuthenticated,
  });

  // 실제 장르 배열 관리
  const genresList = Array.isArray(genresData?.data) ? genresData.data : [];

  // 여러 장르의 콘텐츠를 병렬로 가져오기 (장르 데이터가 로드된 후에만)
  const genreQueries = useContentsByGenres(genresList, {
    enabled: mounted && isAuthenticated && !isGenresLoading && genresList.length > 0,
    pagination: { page: 0, size: 10 },
  });

  // 마운트 전에는 로딩 화면
  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-xl">로딩 중...</p>
      </main>
    );
  }

  // 인증되지 않은 경우 아무것도 렌더링 안 함
  if (!isAuthenticated) {
    return null;
  }

  return (
    <main className="flex min-h-screen flex-col bg-black text-white pt-20">
      <div className="px-4 pb-20">
        <h1 className="text-3xl font-bold mt-4 mb-6">시리즈</h1>
        
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