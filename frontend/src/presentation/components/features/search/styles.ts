import styled from "styled-components";

// 검색 컨테이너 스타일
export const SearchBarContainer = styled.div`
  width: 100%;
  position: relative;
  margin-bottom: 1.5rem;
`;

export const SearchInputWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  padding: 0.5rem 1rem;
`;

export const SearchInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  font-size: 1rem;
  outline: none;
  padding: 0.5rem 0;
`;

export const SearchIconButton = styled.button`
  background: transparent;
  border: none;
  color: gray;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
`;

export const ClearButton = styled.button`
  background: transparent;
  border: none;
  color: gray;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;

  &:hover {
    color: white;
  }
`;
