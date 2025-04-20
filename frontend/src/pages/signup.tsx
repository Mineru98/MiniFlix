import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import useAuthStore from '@/application/store/auth';
import { useRegister } from '@/application/hooks/api/auth';
import { AxiosError } from 'axios';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    name?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const router = useRouter();
  const { isAuthenticated, setLoginState } = useAuthStore();
  
  const { mutate: register, isLoading, isError, error } = useRegister();
  
  // 마운트 시 로그인 상태 false로 설정
  useEffect(() => {
    setLoginState(false);
    
    // 이미 인증된 사용자는 홈 페이지로 리디렉션
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router, setLoginState]);
  
  const validateForm = useCallback(() => {
    const newErrors: {
      email?: string;
      name?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;
    
    // 이메일 유효성 검사
    if (!email) {
      newErrors.email = '이메일을 입력해주세요.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
      isValid = false;
    }
    
    // 이름 유효성 검사
    if (!name) {
      newErrors.name = '이름을 입력해주세요.';
      isValid = false;
    }
    
    // 비밀번호 유효성 검사
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
      isValid = false;
    }
    
    // 비밀번호 확인 유효성 검사
    if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  }, [email, name, password, confirmPassword]);
  
  const handleSignup = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      register(
        { email, name, password },
        {
          onSuccess: () => {
            // 회원가입 성공 시 로그인 페이지로 이동
            router.push('/login');
          },
          onError: (err: AxiosError) => {
            console.error('회원가입 실패:', err);
          }
        }
      );
    }
  }, [email, name, password, validateForm, register, router]);
  
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="flex flex-col">
        <div className="flex justify-center items-center p-6">
          <Link href="/" className="flex items-center">
            <Image 
              src="/images/netflix-logo.svg" 
              alt="MiniFlix" 
              width={120} 
              height={34} 
              priority
            />
          </Link>
        </div>
        
        <div className="flex justify-center">
          <div className="w-full max-w-md px-6 py-8">
            <form onSubmit={handleSignup} className="w-full">
              <h1 className="text-3xl font-bold mb-6">회원가입</h1>
              
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full bg-[rgba(22,22,22,0.7)] border ${errors.email ? 'border-red-500' : 'border-[rgba(128,128,128,0.7)]'} text-white py-4 px-3 rounded pt-6`}
                    required
                  />
                  <label 
                    htmlFor="email" 
                    className={`absolute left-3 ${email ? 'top-1 text-xs' : 'top-4'} text-[rgba(255,255,255,0.7)] transition-all z-10`}
                  >
                    이메일 주소
                  </label>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={`w-full bg-[rgba(22,22,22,0.7)] border ${errors.name ? 'border-red-500' : 'border-[rgba(128,128,128,0.7)]'} text-white py-4 px-3 rounded pt-6`}
                    required
                  />
                  <label 
                    htmlFor="name" 
                    className={`absolute left-3 ${name ? 'top-1 text-xs' : 'top-4'} text-[rgba(255,255,255,0.7)] transition-all z-10`}
                  >
                    이름
                  </label>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full bg-[rgba(22,22,22,0.7)] border ${errors.password ? 'border-red-500' : 'border-[rgba(128,128,128,0.7)]'} text-white py-4 px-3 rounded pt-6`}
                    required
                  />
                  <label 
                    htmlFor="password" 
                    className={`absolute left-3 ${password ? 'top-1 text-xs' : 'top-4'} text-[rgba(255,255,255,0.7)] transition-all z-10`}
                  >
                    비밀번호
                  </label>
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="relative">
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full bg-[rgba(22,22,22,0.7)] border ${errors.confirmPassword ? 'border-red-500' : 'border-[rgba(128,128,128,0.7)]'} text-white py-4 px-3 rounded pt-6`}
                    required
                  />
                  <label 
                    htmlFor="confirmPassword" 
                    className={`absolute left-3 ${confirmPassword ? 'top-1 text-xs' : 'top-4'} text-[rgba(255,255,255,0.7)] transition-all z-10`}
                  >
                    비밀번호 확인
                  </label>
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-[#E50914] text-white py-3 px-4 rounded font-medium mt-4 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? '처리중...' : '회원가입'}
              </button>
              
              {isError && (
                <div className="mt-4 p-3 bg-red-500 bg-opacity-20 border border-red-500 rounded">
                  <p className="text-red-500 text-sm">
                    {error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.'}
                  </p>
                </div>
              )}
              
              <div className="mt-6">
                <div className="flex">
                  <span className="text-[rgba(255,255,255,0.7)]">
                    이미 계정이 있으신가요?
                  </span>
                  <Link href="/login" className="text-white ml-1 font-medium">
                    로그인하세요.
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 