import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import useAuthStore from '@/application/store/auth';
import { ChevronRight } from 'lucide-react';
import Image from 'next/image';
import styled from 'styled-components';

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

  return (
    <Container>
      <PageBackground>
        <Header>
          <LogoLink href="/">
            <Image 
              src="/images/account/netflix-logo.svg" 
              alt="Netflix" 
              width={90} 
              height={30} 
            />
          </LogoLink>
          <ProfileMenu>
            <Image 
              src="/images/account/profile-main.png" 
              alt="프로필" 
              width={32} 
              height={32} 
              style={{ borderRadius: '4px' }}
            />
            <Image 
              src="/images/account/down-arrow.svg" 
              alt="메뉴" 
              width={20} 
              height={20} 
            />
          </ProfileMenu>
        </Header>
      </PageBackground>

      <Navigation>
        <NavItem>개요</NavItem>
        <NavItem>멤버십</NavItem>
        <NavItem>보안</NavItem>
        <NavItem>디바이스</NavItem>
        <NavItemActive>프로필</NavItemActive>
      </Navigation>

      <MainContent>
        <Section>
          <SectionTitle>프로필</SectionTitle>

          <SectionContainer>
            <SectionHeading>자녀 보호 기능 및 접근 권한</SectionHeading>
            <CardContainer>
              <CardList>
                <CardItem>
                  <CardButton>
                    <CardLeft>
                      <IconContainer>
                        <Image 
                          src="/images/account/lock-icon.svg" 
                          alt="자녀 보호" 
                          width={24} 
                          height={24} 
                        />
                      </IconContainer>
                      <CardContent>
                        <CardTitle>자녀 보호 설정 조정</CardTitle>
                        <CardSubtitle>관람등급 설정, 콘텐츠 차단</CardSubtitle>
                      </CardContent>
                    </CardLeft>
                    <ArrowContainer>
                      <Image 
                        src="/images/account/right-arrow.svg" 
                        alt="상세보기" 
                        width={24} 
                        height={24} 
                      />
                    </ArrowContainer>
                  </CardButton>
                </CardItem>
              </CardList>
            </CardContainer>
          </SectionContainer>

          <SectionContainer>
            <SectionHeading>프로필 설정</SectionHeading>
            <CardContainer>
              <CardList>
                <CardItem>
                  <CardButton>
                    <CardLeft>
                      <ProfileImageContainer>
                        <Image 
                          src="/images/account/profile-image-1.png" 
                          alt="프로필" 
                          width={40} 
                          height={40} 
                          style={{ borderRadius: '4px' }}
                        />
                      </ProfileImageContainer>
                      <CardContent>
                        <ProfileRow>
                          <CardTitle>나</CardTitle>
                          <Badge>내 프로필</Badge>
                        </ProfileRow>
                      </CardContent>
                    </CardLeft>
                    <ArrowContainer>
                      <Image 
                        src="/images/account/right-arrow-0.svg" 
                        alt="상세보기" 
                        width={24} 
                        height={24} 
                      />
                    </ArrowContainer>
                  </CardButton>
                </CardItem>
                <Divider />
                <CardItem>
                  <CardButton>
                    <CardLeft>
                      <ProfileImageContainer>
                        <Image 
                          src="/images/account/profile-image-2.png" 
                          alt="프로필" 
                          width={40} 
                          height={40} 
                          style={{ borderRadius: '4px' }}
                        />
                      </ProfileImageContainer>
                      <CardContent>
                        <CardTitle>어머니</CardTitle>
                      </CardContent>
                    </CardLeft>
                    <ArrowContainer>
                      <Image 
                        src="/images/account/right-arrow-1.svg" 
                        alt="상세보기" 
                        width={24} 
                        height={24} 
                      />
                    </ArrowContainer>
                  </CardButton>
                </CardItem>
                <Divider />
                <CardItem>
                  <CardButton>
                    <CardLeft>
                      <ProfileImageContainer>
                        <Image 
                          src="/images/account/profile-image-3.png" 
                          alt="프로필" 
                          width={40} 
                          height={40} 
                          style={{ borderRadius: '4px' }}
                        />
                      </ProfileImageContainer>
                      <CardContent>
                        <CardTitle>아버지</CardTitle>
                      </CardContent>
                    </CardLeft>
                    <ArrowContainer>
                      <Image 
                        src="/images/account/right-arrow-2.svg" 
                        alt="상세보기" 
                        width={24} 
                        height={24} 
                      />
                    </ArrowContainer>
                  </CardButton>
                </CardItem>
                <Divider />
                <CardItem>
                  <CardButton>
                    <CardLeft>
                      <ProfileImageContainer>
                        <Image 
                          src="/images/account/profile-image-4.png" 
                          alt="프로필" 
                          width={40} 
                          height={40} 
                          style={{ borderRadius: '4px' }}
                        />
                      </ProfileImageContainer>
                      <CardContent>
                        <CardTitle>조카</CardTitle>
                      </CardContent>
                    </CardLeft>
                    <ArrowContainer>
                      <Image 
                        src="/images/account/right-arrow-3.svg" 
                        alt="상세보기" 
                        width={24} 
                        height={24} 
                      />
                    </ArrowContainer>
                  </CardButton>
                </CardItem>
              </CardList>
              <AddProfileContainer>
                <AddProfileButton>프로필 추가</AddProfileButton>
                <AddProfileNote>
                  같이 사는 이들을 위해 최대 5개의 프로필을 추가할 수 있습니다.
                </AddProfileNote>
              </AddProfileContainer>
            </CardContainer>
          </SectionContainer>
        </Section>
      </MainContent>
    </Container>
  );
};

// 스타일 컴포넌트
const Container = styled.div`
  background-color: #fafafa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const PageBackground = styled.div`
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  height: 56px;
  max-width: 100%;
`;

const LogoLink = styled.a`
  display: flex;
  align-items: center;
  height: 28px;
`;

const ProfileMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const Navigation = styled.nav`
  display: flex;
  padding: 0 16px;
  background-color: #fafafa;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  overflow-x: auto;
  white-space: nowrap;
`;

const NavItem = styled.a`
  padding: 10px 10px 12.5px;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
`;

const NavItemActive = styled(NavItem)`
  color: #000;
  font-weight: 500;
  border-bottom: 4px solid #E50914;
`;

const MainContent = styled.main`
  padding: 24px 16px 56px;
  display: flex;
  flex-direction: column;
`;

const Section = styled.section`
  width: 100%;
`;

const SectionTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 1px;
  color: #000;
  line-height: 1.2;
`;

const SectionContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const SectionHeading = styled.h2`
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 12px;
  color: #333;
`;

const CardContainer = styled.div`
  background: #fff;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

const CardList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 4px;
`;

const CardItem = styled.div`
  padding: 8px 0;
  border-radius: 4px;
  width: 100%;
`;

const CardButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 12px 0 10px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
`;

const CardLeft = styled.div`
  display: flex;
  align-items: center;
`;

const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const ProfileImageContainer = styled.div`
  width: 42px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #000;
`;

const CardSubtitle = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
  margin-top: 4px;
`;

const ArrowContainer = styled.div`
  display: flex;
  align-items: center;
`;

const ProfileRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const Badge = styled.div`
  background-color: #BCD8FF;
  padding: 4px 5px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
`;

const Divider = styled.div`
  height: 1.5px;
  background-color: rgba(128, 128, 128, 0.2);
  margin-left: 16px;
  width: calc(100% - 16px);
`;

const AddProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0 4px 17px;
  width: 100%;
`;

const AddProfileButton = styled.button`
  background-color: rgba(128, 128, 128, 0.3);
  color: #000;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 4px;
  width: 100%;
  border: none;
  cursor: pointer;
  text-align: center;
`;

const AddProfileNote = styled.p`
  font-size: 13px;
  color: rgba(0, 0, 0, 0.7);
  text-align: center;
  line-height: 1.2;
`;

export default AccountPage; 