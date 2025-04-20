import React from 'react';
import Image from 'next/image';
import { 
  Container,
  PageBackground,
  Navigation,
  NavItem,
  NavItemActive,
  MainContent,
  Section,
  SectionTitle,
  SectionContainer,
  SectionHeading,
  CardContainer,
  CardList,
  CardItem,
  CardButton,
  CardLeft,
  IconContainer,
  ProfileImageContainer,
  CardContent,
  CardTitle,
  CardSubtitle,
  ArrowContainer,
  ProfileRow,
  Badge,
  Divider,
  AddProfileContainer,
  AddProfileButton,
  AddProfileNote
} from './styles';

const AccountView: React.FC = () => {
  return (
    <Container>
      <PageBackground>
        {/* 이전 헤더는 제거됨 - Header 컴포넌트가 이 부분을 처리함 */}
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

export default AccountView; 