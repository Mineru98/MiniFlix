import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/application/store/auth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // 비인증 사용자는 로그인 페이지로 리디렉션
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // 인증된 사용자를 위한 홈 페이지
  if (isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col bg-black text-white">
        <h1 className="text-4xl font-bold p-6">MiniFlix</h1>
        <div className="flex-1 p-6">
          <p className="text-xl">로그인에 성공하였습니다. 홈 화면입니다.</p>
        </div>
      </main>
    );
  }

  // 리디렉션 중 보여줄 로딩 상태
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
      <p className="text-xl">로딩 중...</p>
    </main>
  );
} 