import React from 'react';
import { ContentListResponse } from '@/infrastructure/api';
import ContentCard from '@/presentation/components/molecules/ContentCard';
import { RowContainer, RowTitle, ContentContainer, LoadingContainer } from './styles';

interface ContentRowProps {
  title: string;
  contents: ContentListResponse[];
  isLoading?: boolean;
  emptyIcon?: React.ReactNode;
}

const ContentRow: React.FC<ContentRowProps> = ({ 
  title, 
  contents, 
  isLoading = false,
  emptyIcon
}) => {
  return (
    <RowContainer>
      <RowTitle>{title}</RowTitle>
      
      <ContentContainer>
        {isLoading ? (
          <LoadingContainer>
            <div className="w-32 h-48 bg-gray-800 animate-pulse rounded"></div>
            <div className="w-32 h-48 bg-gray-800 animate-pulse rounded"></div>
            <div className="w-32 h-48 bg-gray-800 animate-pulse rounded"></div>
            <div className="w-32 h-48 bg-gray-800 animate-pulse rounded"></div>
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
                <p className="text-sm text-gray-500">콘텐츠를 불러올 수 없습니다.</p>
              </div>
            )}
          </LoadingContainer>
        )}
      </ContentContainer>
    </RowContainer>
  );
};

export default ContentRow; 