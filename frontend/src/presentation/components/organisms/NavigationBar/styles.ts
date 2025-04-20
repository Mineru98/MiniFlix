import styled from "styled-components";

export const NavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #121212;
  padding: 0.75rem 0;
  z-index: 50;
`;

export const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #8c8787;
  cursor: pointer;
  transition: color 0.2s;
  width: 80px;
  height: 60px;
  justify-content: center;

  &.active {
    color: white;
  }

  &:hover {
    color: #d2d2d2;
  }
`;

export const NavText = styled.span`
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  margin-top: 0.3rem;
  text-transform: uppercase;
`;

export const IconWrapper = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
`;

export const NotificationBadge = styled.div`
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #e50914;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 0.6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
`;
