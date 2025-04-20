import styled, { css, keyframes } from "styled-components";

// 백 버튼 애니메이션 키프레임 정의
const slideDownAnimation = keyframes`
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideUpAnimation = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-50px);
    opacity: 0;
  }
`;

// 컨트롤 오버레이 애니메이션 키프레임 정의
const slideUpControlsAnimation = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const slideDownControlsAnimation = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(100%);
    opacity: 0;
  }
`;

export const VideoPlayerContainer = styled.div`
  width: 100%;
  height: 100vh;
  background-color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const VideoWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
`;

export const BackButton = styled.button<{ isVisible: boolean }>`
  position: absolute;
  top: 20px;
  left: 20px;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;

  ${(props) =>
    props.isVisible
      ? css`
          animation: ${slideDownAnimation} 0.3s ease forwards;
        `
      : css`
          animation: ${slideUpAnimation} 0.3s ease forwards;
        `}

  &:hover {
    opacity: 0.8;
  }
`;

export const ControlsOverlay = styled.div<{ isVisible: boolean }>`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px;
  background-image: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.8) 0%,
    transparent 100%
  );

  ${(props) =>
    props.isVisible
      ? css`
          animation: ${slideUpControlsAnimation} 0.3s ease forwards;
        `
      : css`
          animation: ${slideDownControlsAnimation} 0.3s ease forwards;
        `}
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  position: relative;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background-color: #e50914;
  position: absolute;
  top: 0;
  left: 0;
`;

export const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  color: white;
`;

export const ControlButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px;
  font-size: 14px;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }
`;

export const TimeDisplay = styled.span`
  color: white;
  margin-left: 12px;
  font-size: 14px;
`;
