import React, { useState, useCallback } from 'react';
import { PlayCircle, Plus, Info, ImageIcon } from 'lucide-react';
import { BannerContainer, BannerOverlay, BannerImage, BannerContent, 
  BannerTitle, BannerRank, BannerControls } from './styles';
import { BannerProps } from './types';
import { useRouter } from 'next/router';

const Banner: React.FC<BannerProps> = ({ 
  content, 
  fallbackImageUrl = 'https://via.assets.so/movie.png?id=1&q=95&w=160&h=220&fit=fill'
}) => {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const hasOriginalImage = !!content.thumbnail_url && !imageError;
  const hasFallbackImage = !!fallbackImageUrl;

  const handlePlayClick = useCallback(() => {
    router.push(`/watch/${content.id}`);
  }, [router, content.id]);

  return (
    <BannerContainer>
      {hasOriginalImage ? (
        <BannerImage 
          style={{ backgroundImage: `url(${content.thumbnail_url})` }}
          onError={() => setImageError(true)}
        />
      ) : hasFallbackImage ? (
        <BannerImage
          style={{ backgroundImage: `url(${fallbackImageUrl})` }}
        />
      ) : (
        <BannerImage className="bg-gray-800 flex items-center justify-center">
          <ImageIcon size={64} className="text-gray-600" />
        </BannerImage>
      )}
      <BannerOverlay />
      
      <BannerContent>
        <BannerRank>#{Math.floor(Math.random() * 10) + 1} in Korea Today</BannerRank>
        <BannerTitle>{content.title || 'Movie Title'}</BannerTitle>
        
        <BannerControls>
          <button 
            className="bg-white text-black flex items-center gap-2 px-6 py-2 rounded"
            onClick={handlePlayClick}
          >
            <PlayCircle size={20} />
            <span>재생</span>
          </button>
          
          <button className="bg-gray-600 bg-opacity-70 text-white flex items-center gap-2 px-4 py-2 rounded">
            <Plus size={20} />
            <span>위시리스트</span>
          </button>
          
          <button className="bg-gray-600 bg-opacity-70 text-white flex items-center gap-2 px-4 py-2 rounded">
            <Info size={20} />
            <span>정보</span>
          </button>
        </BannerControls>
      </BannerContent>
    </BannerContainer>
  );
};

export default Banner; 