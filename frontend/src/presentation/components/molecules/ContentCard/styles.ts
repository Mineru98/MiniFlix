import styled from "styled-components";
import { ImageIcon } from "lucide-react";

export const CardContainer = styled.div`
  position: relative;
  min-width: 160px;
  height: 220px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: scale(1.05);
    z-index: 10;
  }
`;

export const CardImage = styled.div`
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
`;

export const EmptyCardImage = styled.div`
  width: 100%;
  height: 100%;
  background-color: #333;
  display: flex;
  justify-content: center;
  align-items: center;

  &::before {
    content: "";
    width: 32px;
    height: 32px;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    filter: opacity(0.5);
  }
`;

export const CardHoverOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0.8) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.1) 100%
  );
  opacity: 0;
  transition: opacity 0.3s;
  color: white;
  z-index: 1;

  ${CardContainer}:hover & {
    opacity: 1;
  }
`;

export const CardControls = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  background-color: #121212;
`;

export const ControlButton = styled.button`
  width: 28px;
  height: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: #2a2a2a;
  color: white;

  &:hover {
    background-color: #333;
  }
`;
