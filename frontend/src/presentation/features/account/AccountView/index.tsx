import { useState, useCallback, FC } from 'react';
import Image from 'next/image';
import { useUpdateUserProfile } from '@/application/hooks/api/user/use_profile';
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
  AddProfileNote,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalCloseButton,
  ModalBody,
  FormGroup,
  Label,
  Input,
  ErrorMessage,
  ModalFooter,
  SubmitButton,
  CancelButton
} from './styles';

const AccountView: FC = () => {
  // 상태 관리
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API 훅 사용
  const { mutateAsync: updateProfile, isLoading } = useUpdateUserProfile();

  // 비밀번호 변경 모달 열기/닫기
  const openPasswordModal = useCallback(() => {
    setIsPasswordModalOpen(true);
    setError('');
    setSuccess('');
  }, []);

  const closePasswordModal = useCallback(() => {
    setIsPasswordModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  }, []);

  // 이름 변경 모달 열기/닫기
  const openNameModal = useCallback(() => {
    setIsNameModalOpen(true);
    setError('');
    setSuccess('');
  }, []);

  const closeNameModal = useCallback(() => {
    setIsNameModalOpen(false);
    setNewName('');
  }, []);

  // 비밀번호 변경 처리
  const handlePasswordChange = useCallback(async () => {
    try {
      setError('');
      
      // 유효성 검사
      if (!currentPassword) {
        setError('현재 비밀번호를 입력해주세요.');
        return;
      }
      
      if (!newPassword) {
        setError('새 비밀번호를 입력해주세요.');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setError('새 비밀번호가 일치하지 않습니다.');
        return;
      }
      
      if (newPassword.length < 8) {
        setError('비밀번호는 8자 이상이어야 합니다.');
        return;
      }
      
      // API 호출
      await updateProfile({
        current_password: currentPassword,
        new_password: newPassword
      });
      
      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setTimeout(() => {
        closePasswordModal();
        setSuccess('');
      }, 1500);
    } catch (error) {
      setError('비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
    }
  }, [currentPassword, newPassword, confirmPassword, updateProfile, closePasswordModal]);

  // 이름 변경 처리
  const handleNameChange = useCallback(async () => {
    try {
      setError('');
      
      // 유효성 검사
      if (!currentPassword) {
        setError('현재 비밀번호를 입력해주세요.');
        return;
      }
      
      if (!newName) {
        setError('새 이름을 입력해주세요.');
        return;
      }
      
      // API 호출
      await updateProfile({
        current_password: currentPassword,
        name: newName
      });
      
      setSuccess('이름이 성공적으로 변경되었습니다.');
      setTimeout(() => {
        closeNameModal();
        setSuccess('');
      }, 1500);
    } catch (error) {
      setError('이름 변경에 실패했습니다. 현재 비밀번호를 확인해주세요.');
    }
  }, [currentPassword, newName, updateProfile, closeNameModal]);

  return (
    <Container>
      <PageBackground>
        {/* 이전 헤더는 제거됨 - Header 컴포넌트가 이 부분을 처리함 */}
      </PageBackground>

      <Navigation>
        <NavItem>개요</NavItem>
        <NavItem>멤버십</NavItem>
        <NavItemActive>보안</NavItemActive>
        <NavItem>디바이스</NavItem>
        <NavItem>프로필</NavItem>
      </Navigation>

      <MainContent>
        <Section>
          <SectionTitle>보안</SectionTitle>

          <SectionContainer>
            <SectionHeading>계정 보안</SectionHeading>
            <CardContainer>
              <CardList>
                <CardItem>
                  <CardButton onClick={openPasswordModal}>
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
                  <CardButton onClick={openNameModal}>
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

      {/* 비밀번호 변경 모달 */}
      {isPasswordModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>비밀번호 변경</ModalTitle>
              <ModalCloseButton onClick={closePasswordModal}>
                <Image 
                  src="/images/common/close-icon.svg" 
                  alt="닫기" 
                  width={24} 
                  height={24} 
                />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <div style={{ color: 'green', marginBottom: '15px' }}>{success}</div>}
              
              <FormGroup>
                <Label htmlFor="currentPassword">현재 비밀번호</Label>
                <Input 
                  id="currentPassword"
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호 입력"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="newPassword">새 비밀번호</Label>
                <Input 
                  id="newPassword"
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="새 비밀번호 입력 (8자 이상)"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="새 비밀번호 재입력"
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={closePasswordModal}>취소</CancelButton>
              <SubmitButton 
                onClick={handlePasswordChange} 
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '변경하기'}
              </SubmitButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}

      {/* 이름 변경 모달 */}
      {isNameModalOpen && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>이름 변경</ModalTitle>
              <ModalCloseButton onClick={closeNameModal}>
                <Image 
                  src="/images/common/close-icon.svg" 
                  alt="닫기" 
                  width={24} 
                  height={24} 
                />
              </ModalCloseButton>
            </ModalHeader>
            <ModalBody>
              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <div style={{ color: 'green', marginBottom: '15px' }}>{success}</div>}
              
              <FormGroup>
                <Label htmlFor="newName">새 이름</Label>
                <Input 
                  id="newName"
                  type="text" 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="변경할 이름 입력"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="currentPasswordForName">비밀번호 확인</Label>
                <Input 
                  id="currentPasswordForName"
                  type="password" 
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호 입력"
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <CancelButton onClick={closeNameModal}>취소</CancelButton>
              <SubmitButton 
                onClick={handleNameChange} 
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '변경하기'}
              </SubmitButton>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AccountView; 