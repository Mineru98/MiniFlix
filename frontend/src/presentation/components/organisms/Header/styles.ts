import styled from "styled-components";
import Link from "next/link";

export const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  align-items: center;
  background-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.78) 0%,
    rgba(0, 0, 0, 0) 100%
  );
  padding: 0.75rem 4%;
  z-index: 100;
  transition: background-color 0.3s;
  height: 68px;

  @media (max-width: 768px) {
    padding: 0.5rem 3%;
    height: 56px;
  }
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1.5rem;

  img {
    width: 92px;
    height: auto;
  }
`;

export const NavLinks = styled.ul`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
`;

export const NavItem = styled.li`
  margin: 0 0.5rem;
`;

export const NavLink = styled(Link)`
  color: #e5e5e5;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 400;
  transition: color 0.2s;
  padding: 0.3rem 0;
  white-space: nowrap;

  &.active {
    color: white;
    font-weight: 500;
  }

  &:hover {
    color: #b3b3b3;
  }
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
  position: relative;
`;

export const SearchButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  margin-right: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const NotificationButton = styled.button`
  background: transparent;
  border: none;
  color: white;
  margin-right: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: -2px;
    right: -2px;
    width: 8px;
    height: 8px;
    background-color: #e50914;
    border-radius: 50%;
    display: block;
  }
`;

export const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  cursor: pointer;
  padding: 0.2rem;
`;

export const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 4px;
  margin-right: 0.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const ProfileDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background-color: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  min-width: 180px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  z-index: 999;
  visibility: hidden;
  opacity: 0;
  transform: translateY(-10px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease,
    visibility 0.15s;
  pointer-events: none;

  ${ProfileSection}:hover & {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }

  &.active {
    visibility: visible;
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

export const DropdownItem = styled.div<{ as?: string }>`
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  color: #e5e5e5;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    background-color 0.2s,
    color 0.2s;
  text-decoration: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

export const DropdownDivider = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.15);
  margin: 0.5rem 0;
`;

export const SearchContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 300px;
  background-color: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 3px;
  padding: 1rem;
  z-index: 10;
  margin-top: 0.5rem;
`;

export const SearchInput = styled.input`
  width: 100%;
  background: transparent;
  border: none;
  color: white;
  font-size: 0.9rem;
  outline: none;
  padding: 0.5rem 0;
`;

export const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.5rem;

  &:hover {
    color: white;
  }
`;

export const SearchResults = styled.div`
  margin-top: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
`;

export const SearchResultItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem 0.5rem;
  cursor: pointer;
  border-radius: 3px;
  font-size: 0.9rem;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;
