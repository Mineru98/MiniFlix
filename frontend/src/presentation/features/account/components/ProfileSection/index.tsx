import { FC } from 'react';
import Image from 'next/image';
import { 
  SectionContainer, 
  SectionHeading, 
  CardContainer, 
  CardList, 
  CardItem, 
  CardButton, 
  CardLeft, 
  ProfileImageContainer, 
  CardContent, 
  CardTitle, 
  ProfileRow, 
  Badge, 
  ArrowContainer, 
  Divider,
  AddProfileContainer,
  AddProfileButton,
  AddProfileNote 
} from '../../styles';

const ProfileSection: FC = () => {
  return (
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
  );
};

export default ProfileSection; 