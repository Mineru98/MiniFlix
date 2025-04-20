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
  overflow: hidden;
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
  display: none;

  ${ProfileSection}:hover & {
    display: block;
  }
`;
