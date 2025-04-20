import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
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
          {children}
        </div>
      </div>
    </div>
  );
} 