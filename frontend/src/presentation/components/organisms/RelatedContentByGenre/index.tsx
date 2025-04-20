import React, { useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useContentsByGenres } from '@/application/hooks/api/content/use_content_by_genres';
import { RelatedContentByGenreProps } from './types';
import { 
  RelatedContent, 
  ThumbnailItem, 
  LoadingState, 
  ErrorState,
  GenreSection,
  GenreTitle 
} from './styles';

const RelatedContentByGenre: React.FC<RelatedContentByGenreProps> = ({ genres, currentContentId }) => {
  const router = useRouter();
  const genreQueries = useContentsByGenres(genres, {
    pagination: { page: 1, size: 10 },
  });

  const handleContentClick = useCallback((contentId: number) => {
    router.push(`/content/${contentId}`);
  }, [router]);

  // 로딩 중인지 확인
  const isLoading = genreQueries.some(query => query.isLoading);
  
  // 모든 쿼리가 에러인지 확인
  const isAllError = genreQueries.length > 0 && genreQueries.every(query => query.isError);
  
  // 데이터가 없는지 확인
  const hasNoData = genreQueries.length === 0 || 
    genreQueries.every(query => !query.data || query.data.data.content.length === 0);

  // 장르별 콘텐츠 그룹화
  const contentsByGenre = useMemo(() => {
    if (isLoading || isAllError || hasNoData) {
      return [];
    }

    return genreQueries
      .map((query, index) => {
        if (!query.data || query.data.data.content.length === 0) {
          return null;
        }

        const genre = genres[index];
        const contents = query.data.data.content
          // 현재 보고 있는 콘텐츠는 제외
          .filter(content => content.id !== currentContentId)
          // 최대 5개로 제한
          .slice(0, 5);

        return contents.length > 0 ? { genre, contents } : null;
      })
      .filter(Boolean);
  }, [genreQueries, genres, currentContentId]);

  if (isLoading) {
    return <LoadingState>콘텐츠를 불러오는 중...</LoadingState>;
  }

  if (isAllError) {
    return <ErrorState>콘텐츠를 불러올 수 없습니다.</ErrorState>;
  }

  if (hasNoData || contentsByGenre.length === 0) {
    return <ErrorState>비슷한 콘텐츠가 없습니다.</ErrorState>;
  }

  return (
    <div className="mt-8">
      <h3 className="text-white text-lg font-medium mb-3">비슷한 콘텐츠</h3>
      
      {contentsByGenre.map(group => (
        <GenreSection key={group!.genre.id}>
          <GenreTitle>{group!.genre.name}</GenreTitle>
          <RelatedContent>
            {group!.contents.map((content) => (
              <ThumbnailItem 
                key={content.id} 
                style={{ backgroundImage: `url(${content.thumbnail_url})` }}
                onClick={() => handleContentClick(content.id)}
              >
                <div className="content-title">{content.title}</div>
              </ThumbnailItem>
            ))}
          </RelatedContent>
        </GenreSection>
      ))}
    </div>
  );
};

export default RelatedContentByGenre; 