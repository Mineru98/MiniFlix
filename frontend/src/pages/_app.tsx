import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import SplashPage from '@/presentation/components/organisms/SplashPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import dynamic from 'next/dynamic';
import useAuthStore from '@/application/store/auth';
import { useRouter } from 'next/router';

// 클라이언트 사이드에서만 렌더링되도록 dynamic import 사용
const Header = dynamic(
  () => import('@/presentation/components/organisms/Header'),
  { ssr: false }
);

// NavigationBar도 클라이언트 사이드에서만 렌더링되도록 변경
const NavigationBar = dynamic(
  () => import('@/presentation/components/organisms/NavigationBar'),
  { ssr: false }
);

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5분
      },
    },
  }));

  // 클라이언트 측에서 동적으로 컴포넌트 렌더링을 위한 상태
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // 컴포넌트가 마운트되면 상태 업데이트
    setIsMounted(true);

    // 스플래시 화면 타이머
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2초 후에 로딩 상태를 false로 변경

    return () => clearTimeout(timer);
  }, []);

  // 스플래시 페이지 표시 여부 결정
  const shouldShowSplash = () => {
    if (!isLoading) return false;
    
    const path = router.pathname;
    if (!isAuthenticated) return true; // 비로그인 상태에서는 항상 표시
    
    // 로그인 상태에서는 '/' 또는 '/login' 경로일 때만 표시
    return path === '/' || path === '/login';
  };

  // 마운트되기 전에는 빈 페이지 또는 스플래시 화면만 표시
  if (!isMounted) {
    return (
      <QueryClientProvider client={queryClient}>
        <SplashPage isLoading={true} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      {shouldShowSplash() ? (
        <SplashPage isLoading={isLoading} />
      ) : (
        <>
          {isAuthenticated && <Header />}
          <Component {...pageProps} />
          {isAuthenticated && <NavigationBar />}
        </>
      )}
      <Toaster position="top-center" />
    </QueryClientProvider>
  );
} 