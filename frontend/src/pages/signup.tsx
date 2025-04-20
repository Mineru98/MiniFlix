import { useRouter } from 'next/router';
import { useEffect } from 'react';
import useAuthStore from '@/application/store/auth';
import SignupForm from '@/presentation/features/auth/signup/SignupForm';

export default function SignupPage() {
  const router = useRouter();
  const { isAuthenticated, setLoginState } = useAuthStore();
  
  // 마운트 시 로그인 상태 false로 설정
  useEffect(() => {
    setLoginState(false);
    
    // 이미 인증된 사용자는 홈 페이지로 리디렉션
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router, setLoginState]);

  return (
    <div className="min-h-screen bg-black text-white">
      <SignupForm />
    </div>
  );
} 