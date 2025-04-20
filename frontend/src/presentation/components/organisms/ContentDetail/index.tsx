import React, { useCallback, useState, useEffect } from 'react';
import { X, Play, Download, Plus, Share, ThumbsUp } from 'lucide-react';
import { useRouter } from 'next/router';
import { useContentDetail } from '@/application/hooks/api/content/use_content_detail';
import { ContentDetailProps, ContentDetailViewProps } from './types';
import {
  DetailContainer,
  DetailContent,
  HeroSection,
  CloseButton,
  ContentInfoSection,
  ContentActions,
  ActionButton,
  IconButton,
  LoadingWrapper,
  ErrorWrapper
} from './styles';
import { formatMinutesToHoursAndMinutes } from '@/infrastructure/helper/time_format';
import { useToggleWishlist } from '@/application/hooks/api/wishlist/use_wishlist';
import RelatedContentByGenre from '../RelatedContentByGenre';

const ContentDetailView: React.FC<ContentDetailViewProps> = ({ content, isLoading, isError }) => {
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(content?.is_wishlisted);
  
  const contentId = content?.id;
  const { mutate: toggleWishlist, isLoading: isWishlistLoading } = useToggleWishlist(
    contentId || 0
  );

  useEffect(() => {
    if (content) {
      setIsWishlisted(content.is_wishlisted);
    }
  }, [content]);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  const handlePlayClick = useCallback(() => {
    if (content?.id) {
      router.push(`/watch/${content.id}`);
    }
  }, [router, content?.id]);

  const handleWishlistToggle = useCallback(() => {
    if (contentId) {
      toggleWishlist(undefined, {
        onSuccess: (data) => {
          setIsWishlisted(data.data.is_wishlisted);
        }
      });
    }
  }, [contentId, toggleWishlist]);

  if (isLoading) {
    return (
      <DetailContainer>
        <DetailContent>
          <LoadingWrapper>
            <div className="text-white">로딩 중...</div>
          </LoadingWrapper>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </DetailContent>
      </DetailContainer>
    );
  }

  if (isError || !content) {
    return (
      <DetailContainer>
        <DetailContent>
          <ErrorWrapper>
            <div className="text-xl mb-4">콘텐츠를 불러올 수 없습니다</div>
            <button 
              className="bg-white text-black px-4 py-2 rounded-md"
              onClick={handleClose}
            >
              닫기
            </button>
          </ErrorWrapper>
        </DetailContent>
      </DetailContainer>
    );
  }

  const formattedDuration = formatMinutesToHoursAndMinutes(content.duration);

  return (
    <DetailContainer>
      <DetailContent>
        <HeroSection style={{ backgroundImage: `url(${content.thumbnail_url})` }}>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </HeroSection>
        
        <ContentInfoSection>
          <h1 className="text-3xl font-bold text-white mb-2">{content.title}</h1>
          
          <div className="flex items-center gap-3 text-sm mb-4">
            <span className="text-green-500 font-medium">91% 매치</span>
            <span className="text-gray-300">{content.release_year}</span>
            <span className="bg-gray-800 px-1 py-0.5 text-xs border border-gray-600">15+</span>
            <span className="text-gray-300">{formattedDuration}</span>
            <span className="border border-gray-600 px-1 py-0.5 text-xs">HD</span>
          </div>
          
          <p className="text-white mb-4">{content.description}</p>
          
          <ContentActions>
            <ActionButton className="primary" onClick={handlePlayClick}>
              <Play size={16} />
              재생
            </ActionButton>
            <ActionButton className="secondary">
              <Download size={16} />
              다운로드
            </ActionButton>
            <IconButton onClick={handleWishlistToggle} disabled={isWishlistLoading}>
              {isWishlisted ? (
                <div className="text-sm font-bold text-red-500">✓</div>
              ) : (
                <Plus size={16} />
              )}
            </IconButton>
            <IconButton>
              <ThumbsUp size={16} />
            </IconButton>
            <IconButton>
              <Share size={16} />
            </IconButton>
          </ContentActions>
          
          {/* 장르 기반 비슷한 콘텐츠 */}
          {content.genres && content.genres.length > 0 && (
            <RelatedContentByGenre 
              genres={content.genres} 
              currentContentId={content.id} 
            />
          )}
        </ContentInfoSection>
      </DetailContent>
    </DetailContainer>
  );
};

const ContentDetail: React.FC<ContentDetailProps> = ({ contentId }) => {
  const { data, isLoading, isError } = useContentDetail(contentId);
  
  return (
    <ContentDetailView 
      content={data?.data}
      isLoading={isLoading}
      isError={isError}
    />
  );
};

export default ContentDetail; 