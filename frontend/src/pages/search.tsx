import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/application/store/auth';
import useContentSearchStore from '@/application/store/content-search';
import { useSearchContents } from '@/application/hooks/api/content';
import { FileQuestion } from 'lucide-react';
import ContentRow from '@/presentation/components/organisms/ContentRow';
import { debounce } from 'es-toolkit/compat';
import SearchBar from '@/presentation/components/features/search';
import { SearchPagination } from '@/presentation/components/features/search/types';
import { SEARCH_CONSTANTS } from '@/presentation/components/features/search/constants';

const SearchPage = () => {
  const router = useRouter();
  const { q, page = '0', size = '10' } = router.query;
  const { isAuthenticated } = useAuthStore();
  const { searchQuery, setSearchQuery, clearSearchQuery } = useContentSearchStore();
  const [mounted, setMounted] = useState(false);
  const [localQuery, setLocalQuery] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // 페이지네이션 상태
  const pagination: SearchPagination = {
    page: parseInt(page as string, 10) || SEARCH_CONSTANTS.DEFAULT_PAGE,
    size: parseInt(size as string, 10) || SEARCH_CONSTANTS.DEFAULT_SIZE
  };

  // 컴포넌트가 클라이언트에서 마운트된 직후 플래그를 true로 설정
  useEffect(() => {
    setMounted(true);
  }, []);

  // 모바일 여부 감지
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < SEARCH_CONSTANTS.MOBILE_BREAKPOINT);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 마운트 완료 후, 미인증 시 로그인 페이지로 리디렉트
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // URL 쿼리 매개변수에서 검색어 가져오기
  useEffect(() => {
    if (q && typeof q === 'string') {
      setSearchQuery(q);
      setLocalQuery(q);
    }
  }, [q, setSearchQuery]);

  // 검색어로 콘텐츠 검색
  const { data: searchResults, isLoading: isSearching } = useSearchContents(
    searchQuery || (typeof q === 'string' ? q : ''),
    pagination
  );

  // 검색 실행 (디바운스 없는 일반 검색)
  const handleSearch = useCallback(() => {
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      router.push(`/search?q=${encodeURIComponent(localQuery)}&page=0&size=${pagination.size}`);
    }
  }, [localQuery, setSearchQuery, router, pagination.size]);

  // 디바운스된 검색 함수 (300ms 지연)
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim()) {
        setSearchQuery(query);
        router.push(`/search?q=${encodeURIComponent(query)}&page=0&size=${pagination.size}`);
      }
    }, SEARCH_CONSTANTS.DEBOUNCE_TIMEOUT),
    [setSearchQuery, router, pagination.size]
  );

  // 엔터 키 처리
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // 검색어 입력 처리
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setLocalQuery(newQuery);
    
    // 모바일에서는 디바운스된 자동 검색 실행
    if (isMobile && newQuery.length > SEARCH_CONSTANTS.MIN_QUERY_LENGTH) {
      debouncedSearch(newQuery);
    }
  }, [isMobile, debouncedSearch]);

  // 검색어 지우기
  const handleClearSearch = useCallback(() => {
    setLocalQuery('');
    clearSearchQuery();
    router.push('/search');
  }, [clearSearchQuery, router]);

  // 마운트 전에는 서버와 클라이언트가 동일한 로딩 화면을 렌더링
  if (!mounted) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <p className="text-xl">로딩 중...</p>
      </main>
    );
  }

  // 인증되지 않은 상태라면 아무것도 렌더링하지 않음
  if (!isAuthenticated) {
    return null;
  }

  // 현재 검색어
  const currentQuery = searchQuery || (typeof q === 'string' ? q : '');
  
  // 검색 결과 데이터 (페이징 응답 구조에 맞춰 변경)
  const searchResultsContent = searchResults?.data?.content || [];
  const totalResults = searchResults?.data?.totalElements || 0;

  return (
    <main className="flex min-h-screen flex-col bg-black text-white pt-20">
      <div className="px-4 pb-20">
        <SearchBar
          query={localQuery}
          onSearch={handleSearch}
          onInputChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClear={handleClearSearch}
        />
        
        {currentQuery ? (
          <React.Fragment>
            <ContentRow 
              title={`"${currentQuery}" 검색 결과 (${totalResults})`}
              contents={searchResultsContent}
              isLoading={isSearching}
              emptyIcon={<FileQuestion size={48} />}
            />
            
            {/* 페이지네이션 UI가 필요하다면 여기에 추가 */}
          </React.Fragment>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <p>검색어를 입력하세요</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchPage; 