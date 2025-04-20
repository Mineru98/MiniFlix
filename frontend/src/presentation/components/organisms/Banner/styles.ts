import styled from "styled-components";

export const BannerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 60vh;
  min-height: 400px;
  overflow: hidden;
`;

export const BannerImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  z-index: 1;
`;

export const BannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.6) 40%,
    rgba(0, 0, 0, 0.95) 90%,
    rgba(0, 0, 0, 1) 100%
  );
  z-index: 2;
`;

export const BannerContent = styled.div`
  position: absolute;
  bottom: 30%;
  left: 5%;
  width: 90%;
  z-index: 3;
  color: white;
`;

export const BannerRank = styled.div`
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
`;

export const BannerTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
`;

export const BannerControls = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
`;
