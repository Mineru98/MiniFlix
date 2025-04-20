import React, { useState, useCallback } from 'react';
import { Info, MoreVertical, Plus, ImageIcon } from 'lucide-react';
import { 
  CardContainer,
  CardImage,
  CardHoverOverlay,
  CardControls,
  ControlButton,
  EmptyCardImage
} from './styles';
import { ContentCardProps } from './types';
import { useToggleWishlist } from '@/application/hooks/api/wishlist/use_wishlist';
import { useQueryClient } from '@tanstack/react-query';
import { ApiQueryKeys } from '@/application/hooks/api/constants';
import { useRouter } from 'next/router';

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  fallbackImageUrl = 'https://via.assets.so/movie.png?id=1&q=95&w=160&h=220&fit=fill'
}) => {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(content.is_wishlisted);
  const hasOriginalImage = !!content.thumbnail_url && !imageError;
  const hasFallbackImage = !!fallbackImageUrl;
  
  // @ts-ignore - progress_percent는 콘텐츠 응답에 추가한 커스텀 속성
  const progressPercent = content.progress_percent;
  const hasProgress = typeof progressPercent === 'number' && progressPercent > 0;

  // 찜하기/취소 기능 추가
  const queryClient = useQueryClient();
  const { mutate: toggleWishlist, isLoading } = useToggleWishlist(content.id);
  
  // 찜하기/취소 핸들러
  const handleToggleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toggleWishlist(undefined, {
      onSuccess: (response) => {
        // 카드 상태 업데이트 (로컬 상태)
        setIsWishlisted(response.data.is_wishlisted);
        
        // 찜 목록 쿼리 무효화
        queryClient.invalidateQueries({ queryKey: [ApiQueryKeys.WISHLIST, 'list'] });
        // 전체 콘텐츠 쿼리 무효화 (필요한 경우)
        queryClient.invalidateQueries({ queryKey: ['contents'] });
      }
    });
  }, [toggleWishlist, queryClient, content.id]);

  // 콘텐츠 상세 페이지로 이동하는 핸들러
  const handleInfoClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/content/${content.id}`);
  }, [router, content.id]);

  return (
    <CardContainer 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasOriginalImage ? (
        <>
          <CardImage
            style={{ backgroundImage: `url(${content.thumbnail_url})` }}
            onError={() => setImageError(true)}
          />
          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div 
                className="h-full bg-red-600" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </>
      ) : hasFallbackImage ? (
        <>
          <CardImage
            style={{ backgroundImage: `url(${fallbackImageUrl})` }}
          />
          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div 
                className="h-full bg-red-600" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <EmptyCardImage>
            <ImageIcon size={32} className="text-gray-500" />
          </EmptyCardImage>
          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
              <div 
                className="h-full bg-red-600" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </>
      )}
      
      {isHovered && (
        <CardHoverOverlay className="flex flex-col justify-end">
          <div className="p-2">
            <h3 className="text-sm font-medium truncate">{content.title}</h3>
            <div className="text-xs text-gray-300 mt-1">
              {content.release_year > 0 && content.release_year}
              {hasProgress && (
                <span className="ml-1">{Math.round(progressPercent)}% 시청 완료</span>
              )}
            </div>
          </div>
          <CardControls>
            <ControlButton onClick={handleInfoClick}>
              <Info size={16} />
            </ControlButton>
            <ControlButton>
              <MoreVertical size={16} />
            </ControlButton>
            <ControlButton onClick={handleToggleWishlist} disabled={isLoading}>
              {isWishlisted ? (
                <div className="text-sm font-bold text-red-500">✓</div>
              ) : (
                <Plus size={16} className="hover:text-red-500" />
              )}
            </ControlButton>
          </CardControls>
        </CardHoverOverlay>
      )}
    </CardContainer>
  );
};

export default ContentCard; 