import { FormEvent, useCallback, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import useAuthStore from '@/application/store/auth';
import { useLogin } from '@/application/hooks/api/auth';

export default function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { mutate: loginMutate, isLoading } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberLogin, setRememberLogin] = useState(false);
  
  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    loginMutate(
      { email, password },
      {
        onSuccess: (data) => {
          setAuth(data.data.user, data.data.token);
          toast.success('로그인에 성공했습니다');
          router.push('/');
        },
        onError: (error) => {
          toast.error('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
          console.error('Login error:', error);
        }
      }
    );
  }, [email, password, loginMutate, router, setAuth]);

  return (
    <div className="w-full max-w-md px-6 py-8">
      <form onSubmit={handleSubmit} className="w-full">
        <h1 className="text-3xl font-bold mb-6">로그인</h1>
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[rgba(22,22,22,0.7)] border border-[rgba(128,128,128,0.7)] text-white py-4 px-3 rounded pt-6"
              required
              data-testid="email-input"
            />
            <label 
              htmlFor="email" 
              className={`absolute left-3 ${email ? 'top-1 text-xs' : 'top-4'} text-[rgba(255,255,255,0.7)] transition-all z-10`}
            >
              이메일
            </label>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="relative">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[rgba(22,22,22,0.7)] border border-[rgba(128,128,128,0.7)] text-white py-4 px-3 rounded pt-6"
              required
              data-testid="password-input"
            />
            <label 
              htmlFor="password" 
              className={`absolute left-3 ${password ? 'top-1 text-xs' : 'top-4'} text-[rgba(255,255,255,0.7)] transition-all z-10`}
            >
              비밀번호
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full bg-[#E50914] text-white py-3 px-4 rounded font-medium mt-4"
          disabled={isLoading}
          data-testid="login-button"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
        
        <div className="flex justify-center mt-4">
          <p className="text-[rgba(255,255,255,0.7)]">또는</p>
        </div>
        
        <button
          type="button"
          className="w-full bg-[rgba(128,128,128,0.4)] text-white py-3 px-4 rounded font-medium mt-4"
        >
          로그인 코드 사용하기
        </button>
        
        <div className="flex justify-center mt-4">
          <span className="text-[rgba(255,255,255,0.7)] cursor-pointer">
            비밀번호를 잊으셨나요?
          </span>
        </div>
      </form>
      
      <div className="mt-6">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember-login"
              checked={rememberLogin}
              onChange={(e) => setRememberLogin(e.target.checked)}
              className="hidden"
              data-testid="remember-checkbox"
            />
            <div 
              className={`w-4 h-4 border rounded flex items-center justify-center ${rememberLogin ? 'bg-white' : 'border-white'}`}
              onClick={() => setRememberLogin(!rememberLogin)}
            >
              {rememberLogin && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="#000" />
                </svg>
              )}
            </div>
          </div>
          <label htmlFor="remember-login" className="text-white cursor-pointer">
            로그인 정보 저장
          </label>
        </div>
        
        <div className="mt-4 flex">
          <span className="text-[rgba(255,255,255,0.7)]">
            MiniFlix 회원이 아닌가요? 
          </span>
          <Link href="/signup" className="text-white ml-1 font-medium">
            지금 가입하세요.
          </Link>
        </div>
      </div>
    </div>
  );
} 