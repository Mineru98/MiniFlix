import styled from "styled-components";

export const DetailContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  background-color: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  overflow-y: auto;
`;

export const DetailContent = styled.div`
  max-width: 950px;
  margin: 5vh auto;
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
`;

export const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background-size: cover;
  background-position: center top;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 150px;
    background-image: linear-gradient(to top, #000, transparent);
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(33, 33, 33, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;

  &:hover {
    background: rgba(55, 55, 55, 0.8);
  }
`;

export const ContentInfoSection = styled.div`
  padding: 20px;
  position: relative;
  margin-top: -80px;
  z-index: 10;
`;

export const ContentActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
`;

export const RelatedContent = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 20px 0;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #141414;
  }

  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 3px;
  }
`;

export const ThumbnailItem = styled.div`
  flex: 0 0 auto;
  width: 200px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;

  &.primary {
    background-color: #e50913;
    color: white;
    border: none;

    &:hover {
      background-color: #f40612;
    }
  }

  &.secondary {
    background-color: rgba(255, 255, 255, 0.15);
    color: white;
    border: none;

    &:hover {
      background-color: rgba(255, 255, 255, 0.25);
    }
  }
`;

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.15);
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    background-color: rgba(255, 255, 255, 0.25);
  }
`;

export const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
`;

export const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 300px;
  color: white;
  padding: 20px;
  text-align: center;
`;
