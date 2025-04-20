import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { 
  HeaderContainer, 
  Logo, 
  NavLinks,
  NavItem, 
  NavLink,
  RightSection,
  SearchButton,
  NotificationButton,
  ProfileSection,
  ProfileImage,
  ProfileDropdown
} from './styles';

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Logo>
        <Link href="/">
          <img src="/images/netflix-logo.svg" alt="Netflix" />
        </Link>
      </Logo>

      <NavLinks>
        <NavItem>
          <NavLink href="/" className="active">홈</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/series">시리즈</NavLink>
        </NavItem>
        <NavItem>
          <NavLink href="/movies">영화</NavLink>
        </NavItem>
      </NavLinks>

      <RightSection>
        <SearchButton>
          <Search size={20} />
        </SearchButton>
        <NotificationButton>
          <Bell size={20} />
        </NotificationButton>
        <ProfileSection>
          <ProfileImage src="/images/profile-avatar.png" alt="프로필" />
          <ChevronDown size={16} />
          <ProfileDropdown />
        </ProfileSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header; 