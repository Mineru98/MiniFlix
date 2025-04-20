import React, { useState } from 'react';
import { ContentListResponse } from '@/infrastructure/api';
import { Info, MoreVertical, Plus, ImageIcon } from 'lucide-react';
import { 
  CardContainer,
  CardImage,
  CardHoverOverlay,
  CardControls,
  ControlButton,
  EmptyCardImage
} from './styles';

interface ContentCardProps {
  content: ContentListResponse;
  fallbackImageUrl?: string;
}

const ContentCard: React.FC<ContentCardProps> = ({ 
  content, 
  fallbackImageUrl = 'https://via.assets.so/movie.png?id=1&q=95&w=160&h=220&fit=fill'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasOriginalImage = !!content.thumbnail_url && !imageError;
  const hasFallbackImage = !!fallbackImageUrl;

  return (
    <CardContainer 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {hasOriginalImage ? (
        <CardImage
          style={{ backgroundImage: `url(${content.thumbnail_url})` }}
          onError={() => setImageError(true)}
        />
      ) : hasFallbackImage ? (
        <CardImage
          style={{ backgroundImage: `url(${fallbackImageUrl})` }}
        />
      ) : (
        <EmptyCardImage>
          <ImageIcon size={32} className="text-gray-500" />
        </EmptyCardImage>
      )}
      
      {isHovered && (
        <CardHoverOverlay className="flex flex-col justify-end">
          <div className="p-2">
            <h3 className="text-sm font-medium truncate">{content.title}</h3>
            <div className="text-xs text-gray-300 mt-1">{content.release_year}</div>
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