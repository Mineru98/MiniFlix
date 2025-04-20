import styled, { keyframes } from "styled-components";

const slideUpAnimation = keyframes`
  from {
    transform: translateY(20px);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const DetailContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 50;
  overflow-y: auto;
  padding: 5vh 0;
`;

export const DetailContent = styled.div`
  position: relative;
  width: 100%;
  max-width: 850px;
  margin: 0 auto;
  background-color: #181818;
  border-radius: 8px;
  overflow: hidden;
  animation: ${slideUpAnimation} 0.4s ease-out forwards;
`;

export const HeroSection = styled.div`
  position: relative;
  width: 100%;
  height: 450px;
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;

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
  top: 15px;
  right: 15px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s;

  &:hover {
    background-color: rgba(0, 0, 0, 0.9);
  }
`;

export const ContentInfoSection = styled.div`
  padding: 2rem;
  position: relative;
  margin-top: -80px;
  z-index: 10;
`;

export const ContentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
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
  gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;

  &.primary {
    background-color: white;
    color: black;
    &:hover {
      background-color: rgba(255, 255, 255, 0.8);
    }
  }

  &.secondary {
    background-color: rgba(255, 255, 255, 0.3);
    color: white;
    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
`;

export const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: rgba(42, 42, 42, 0.7);
  border: 2px solid rgba(255, 255, 255, 0.5);
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(42, 42, 42, 0.9);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
`;

export const ErrorWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 400px;
  color: white;
  padding: 20px;
  text-align: center;
`;
