import React, { useState } from 'react';
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

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  fallbackImageUrl = 'https://via.assets.so/movie.png?id=1&q=95&w=160&h=220&fit=fill'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasOriginalImage = !!content.thumbnail_url && !imageError;
  const hasFallbackImage = !!fallbackImageUrl;
  
  // @ts-ignore - progress_percent는 콘텐츠 응답에 추가한 커스텀 속성
  const progressPercent = content.progress_percent;
  const hasProgress = typeof progressPercent === 'number' && progressPercent > 0;

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
            <ControlButton>
              <Info size={16} />
            </ControlButton>
            <ControlButton>
              <MoreVertical size={16} />
            </ControlButton>
            <ControlButton>
              {content.is_wishlisted ? (
                <div className="text-sm font-bold">✓</div>
              ) : (
                <Plus size={16} />
              )}
            </ControlButton>
          </CardControls>
        </CardHoverOverlay>
      )}
    </CardContainer>
  );
};

export default ContentCard; 