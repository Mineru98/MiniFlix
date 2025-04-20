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
  ArrowContainer, 
  Divider 
} from '../../styles';
import { SecuritySectionProps } from './types';

const SecuritySection: FC<SecuritySectionProps> = ({ 
  onOpenPasswordModal, 
  onOpenNameModal 
}) => {
  return (
    <SectionContainer>
      <SectionHeading>계정 보안</SectionHeading>
      <CardContainer>
        <CardList>
          <CardItem>
            <CardButton onClick={onOpenPasswordModal}>
              <CardLeft>
                <IconContainer>
                  <Image 
                    src="/images/account/lock-icon.svg" 
                    alt="비밀번호 변경" 
                    width={24} 
                    height={24} 
                  />
                </IconContainer>
                <CardContent>
                  <CardTitle>비밀번호 변경</CardTitle>
                  <CardSubtitle>계정 비밀번호 업데이트</CardSubtitle>
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
          <Divider />
          <CardItem>
            <CardButton onClick={onOpenNameModal}>
              <CardLeft>
                <IconContainer>
                  <Image 
                    src="/images/account/lock-icon.svg" 
                    alt="이름 변경" 
                    width={24} 
                    height={24} 
                  />
                </IconContainer>
                <CardContent>
                  <CardTitle>이름 변경</CardTitle>
                  <CardSubtitle>계정 이름 업데이트</CardSubtitle>
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

export default SecuritySection; 