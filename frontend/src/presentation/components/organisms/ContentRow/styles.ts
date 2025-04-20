import styled from "styled-components";

export const RowContainer = styled.div`
  margin-bottom: 2rem;
`;

export const RowTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
`;

export const ContentContainer = styled.div`
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0.5rem 0;
  gap: 0.5rem;

  /* Hide scrollbar */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const LoadingContainer = styled.div`
  display: flex;
  gap: 1rem;
  padding: 0.5rem 0;
`;
