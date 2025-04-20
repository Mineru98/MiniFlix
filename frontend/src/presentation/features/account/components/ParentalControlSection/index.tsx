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
  IconContainer, 
  CardContent, 
  CardTitle, 
  CardSubtitle, 
  ArrowContainer
} from '../../styles';

const ParentalControlSection: FC = () => {
  return (
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
  );
};

export default ParentalControlSection; 