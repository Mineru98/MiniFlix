import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Bell, ChevronDown, X, Settings, User, HelpCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import useContentSearchStore from '@/application/store/content-search';
import useAuthStore from '@/application/store/auth';
import { searchContents } from '@/infrastructure/api';
import { useQuery } from '@tanstack/react-query';
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
  ProfileDropdown,
  SearchContainer,
  SearchInput,
  SearchResults,
  SearchResultItem,
  CloseButton,
  DropdownItem,
  DropdownDivider
} from './styles';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const router = useRouter();
  const [showSearch, setShowSearch] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const { searchQuery, setSearchQuery, clearSearchQuery, setIsSearching } = useContentSearchStore();
  const { clearAuth } = useAuthStore();

  // 반응형 처리를 위한 윈도우 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // 초기 설정
    handleResize();
    
    // 리사이즈 이벤트 리스너 등록
    window.addEventListener('resize', handleResize);
    
    // 클린업
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 검색창 및 프로필 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      
      if (
        profileDropdownRef.current && 
        !profileDropdownRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-profile-section]')
      ) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 검색창 열기/닫기
  const toggleSearch = () => {
    if (isMobile) {
      // 모바일에서는 검색 페이지로 이동 (검색어가 있으면 쿼리로 전달)
      if (searchQuery) {
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      } else {
        router.push('/search');
      }
    } else {
      // 데스크탑에서는 검색창 토글
      setShowSearch(!showSearch);
      if (!showSearch) {
        // 검색창이 열리면 포커스
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  };

  // 프로필 드롭다운 토글
  const toggleProfileDropdown = useCallback(() => {
    setShowProfileDropdown(prev => !prev);
  }, []);

  // 검색어 변경 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // 로그아웃 처리 함수
  const handleSignOut = useCallback(() => {
    clearAuth();
    router.push('/login');
  }, [clearAuth, router]);

  // 검색 결과 가져오기
  const { data: searchResults } = useQuery({
    queryKey: ['search-preview', searchQuery],
    queryFn: () => searchContents(searchQuery, { page: 0, size: 5 }),
    enabled: !isMobile && showSearch && !!searchQuery && searchQuery.length > 1,
  });

  // 검색 결과 데이터 (페이징 응답 구조에 맞춰 변경)
  const searchResultsContent = searchResults?.data?.content || [];

  // 검색 결과 아이템 클릭 핸들러
  const handleResultClick = (contentId: number) => {
    router.push(`/content/${contentId}`);
    setShowSearch(false);
    clearSearchQuery();
  };

  return (
    <HeaderContainer className={className}>
      <Logo>
        <Link href="/">
          <img src="/images/netflix-logo.svg" alt="MiniFlix" />
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
        <SearchButton onClick={toggleSearch}>
          <Search size={20} />
        </SearchButton>
        
        {/* 데스크탑 검색 드롭다운 */}
        {!isMobile && showSearch && (
          <SearchContainer ref={searchRef}>
            <div className="flex items-center">
              <Search size={16} className="text-gray-400 mr-2" />
              <SearchInput
                ref={inputRef}
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="제목, 인물, 장르"
              />
              {searchQuery && (
                <CloseButton onClick={() => clearSearchQuery()}>
                  <X size={16} />
                </CloseButton>
              )}
            </div>
            
            {searchQuery && searchQuery.length > 1 && (
              <SearchResults>
                {searchResultsContent.map((content) => (
                  <SearchResultItem 
                    key={content.id}
                    onClick={() => handleResultClick(content.id)}
                  >
                    <div className="w-10 h-10 bg-gray-700 mr-2 rounded overflow-hidden">
                      {content.thumbnail_url && (
                        <img 
                          src={content.thumbnail_url} 
                          alt={content.title} 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <span>{content.title}</span>
                  </SearchResultItem>
                ))}
                <SearchResultItem onClick={() => {
                  router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                  setShowSearch(false);
                }}>
                  <Search size={16} className="mr-2" />
                  <span>"{searchQuery}" 전체 결과 보기</span>
                </SearchResultItem>
              </SearchResults>
            )}
          </SearchContainer>
        )}
        
        <NotificationButton>
          <Bell size={20} />
        </NotificationButton>
        <ProfileSection 
          onClick={toggleProfileDropdown} 
          data-profile-section
        >
          <ProfileImage src="/images/profile-avatar.png" alt="프로필" />
          <ChevronDown size={16} />
          <ProfileDropdown 
            ref={profileDropdownRef}
            className={showProfileDropdown ? 'active' : ''}
          >
            <DropdownItem>
              <Settings size={16} className="mr-2" />
              <span>앱 설정</span>
            </DropdownItem>
            <Link href="/account">
              <DropdownItem>
                <User size={16} className="mr-2" />
                <span>계정</span>
              </DropdownItem>
            </Link>
            <DropdownItem>
              <HelpCircle size={16} className="mr-2" />
              <span>도움말</span>
            </DropdownItem>
            <DropdownDivider />
            <DropdownItem onClick={handleSignOut}>
              <LogOut size={16} className="mr-2" />
              <span>로그아웃</span>
            </DropdownItem>
          </ProfileDropdown>
        </ProfileSection>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header; 