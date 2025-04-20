import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/application/store/auth';
import AccountView from '@/presentation/features/account';

const AccountPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // 컴포넌트 마운트 플래그 설정
  useEffect(() => {
    setMounted(true);
  }, []);

  // 마운트 후 인증 확인 및 리디렉션
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, router]);

  // 마운트 전에는 렌더링하지 않음
  if (!mounted || !isAuthenticated) {
    return null;
  }

  return <AccountView />;
};

export default AccountPage; 