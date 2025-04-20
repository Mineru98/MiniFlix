import styled from "styled-components";

export const GenreSection = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const GenreTitle = styled.h4`
  font-size: 1rem;
  font-weight: 500;
  color: #e5e5e5;
  margin-bottom: 0.75rem;
  padding-left: 0.25rem;
`;

export const RelatedContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  width: 100%;
`;

export const ThumbnailItem = styled.div`
  position: relative;
  aspect-ratio: 16/9;
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.2s ease-in-out;
  overflow: hidden;

  &:hover {
    transform: scale(1.05);

    .content-title {
      opacity: 1;
    }
  }

  .content-title {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    font-size: 0.875rem;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

export const LoadingState = styled.div`
  width: 100%;
  padding: 2rem 0;
  text-align: center;
  color: #fff;
  font-size: 1rem;
`;

export const ErrorState = styled.div`
  width: 100%;
  padding: 2rem 0;
  text-align: center;
  color: #fff;
  font-size: 1rem;
`;
