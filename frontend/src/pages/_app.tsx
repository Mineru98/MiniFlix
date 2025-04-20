import React, { useState, useEffect } from 'react';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import SplashPage from '@/presentation/components/organisms/SplashPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000, // 5분
      },
    },
  }));

  useEffect(() => {
    // 실제 앱에서는 초기 데이터 로딩이나 인증 상태 확인 등을 여기서 처리할 수 있습니다
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000); // 2초 후에 로딩 상태를 false로 변경

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {isLoading && <SplashPage isLoading={isLoading} />}
      <Component {...pageProps} />
    </QueryClientProvider>
  );
} 