import React from 'react';
import Image from 'next/image';
import { SplashPageProps } from './types';
import { SplashPageContainer, LogoContainer } from './styles';

const SplashPage: React.FC<SplashPageProps> = ({ isLoading }) => {
  return (
    <SplashPageContainer>
      <LogoContainer>
        <Image 
          src="/images/netflix-logo.svg" 
          alt="MiniFlix 로고" 
          width={200} 
          height={200}
          priority
        />
      </LogoContainer>
    </SplashPageContainer>
  );
};

export default SplashPage; 