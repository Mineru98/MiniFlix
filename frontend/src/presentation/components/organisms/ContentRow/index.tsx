import React from 'react';
import ContentCard from '@/presentation/components/molecules/ContentCard';
import { RowContainer, RowTitle, ContentContainer, LoadingContainer } from './styles';
import { ContentRowProps } from './types';
const ContentRow: React.FC<ContentRowProps> = ({ 
  title, 
  contents, 
  isLoading = false,
  emptyIcon,
  emptyMessage = '콘텐츠를 불러올 수 없습니다.'
}) => {
  return (
    <RowContainer>
      <RowTitle>{title}</RowTitle>
      
      <ContentContainer>
        {isLoading ? (
          <LoadingContainer>
            <div className="w-40 h-60 bg-gray-800 animate-pulse rounded aspect-[2/3]"></div>
            <div className="w-40 h-60 bg-gray-800 animate-pulse rounded aspect-[2/3]"></div>
            <div className="w-40 h-60 bg-gray-800 animate-pulse rounded aspect-[2/3]"></div>
            <div className="w-40 h-60 bg-gray-800 animate-pulse rounded aspect-[2/3]"></div>
          </LoadingContainer>
        ) : contents.length > 0 ? (
          contents.map((content) => (
            <ContentCard 
              key={content.id} 
              content={content} 
            />
          ))
        ) : (
          <LoadingContainer>
            {emptyIcon && (
              <div className="flex flex-col items-center justify-center p-4">
                <div className="text-gray-500 mb-2">{emptyIcon}</div>
                <p className="text-sm text-gray-500">{emptyMessage}</p>
              </div>
            )}
          </LoadingContainer>
        )}
      </ContentContainer>
    </RowContainer>
  );
};

export default ContentRow; 