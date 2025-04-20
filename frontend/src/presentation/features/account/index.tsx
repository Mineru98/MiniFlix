import { useState, useCallback, FC } from 'react';
import { useUpdateUserProfile } from '@/application/hooks/api/user/use_profile';
import PasswordChangeModal from './components/PasswordChangeModal';
import NameChangeModal from './components/NameChangeModal';
import SecuritySection from './components/SecuritySection';
import ParentalControlSection from './components/ParentalControlSection';
import ProfileSection from './components/ProfileSection';
import { 
  Container,
  PageBackground,
  Navigation,
  NavItem,
  NavItemActive,
  MainContent,
  Section,
  SectionTitle,
} from './styles';

type TabType = '개요' | '멤버십' | '보안' | '디바이스' | '프로필';

const AccountView: FC = () => {
  // 탭 상태 관리
  const [activeTab, setActiveTab] = useState<TabType>('보안');
  
  // 상태 관리
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // API 훅 사용
  const { mutateAsync: updateProfile, isLoading } = useUpdateUserProfile();

  // 탭 변경 핸들러
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

  // 비밀번호 변경 모달 열기/닫기
  const openPasswordModal = useCallback(() => {
    setIsPasswordModalOpen(true);
    setError('');
    setSuccess('');
  }, []);

  const closePasswordModal = useCallback(() => {
    setIsPasswordModalOpen(false);
  }, []);

  // 이름 변경 모달 열기/닫기
  const openNameModal = useCallback(() => {
    setIsNameModalOpen(true);
    setError('');
    setSuccess('');
  }, []);

  const closeNameModal = useCallback(() => {
    setIsNameModalOpen(false);
  }, []);

  // 비밀번호 변경 처리
  const handlePasswordChange = useCallback(async (currentPassword: string, newPassword: string, confirmPassword: string) => {
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
  }, [updateProfile, closePasswordModal]);

  // 이름 변경 처리
  const handleNameChange = useCallback(async (currentPassword: string, newName: string) => {
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
  }, [updateProfile, closeNameModal]);

  // 현재 활성화된 탭에 따라 컨텐츠 렌더링
  const renderContent = () => {
    switch (activeTab) {
      case '보안':
        return (
          <>
            <SectionTitle>보안</SectionTitle>
            <SecuritySection 
              onOpenPasswordModal={openPasswordModal} 
              onOpenNameModal={openNameModal} 
            />
            <ParentalControlSection />
          </>
        );
      case '프로필':
        return (
          <>
            <SectionTitle>프로필</SectionTitle>
            <ProfileSection />
          </>
        );
      default:
        return (
          <SectionTitle>{activeTab} 페이지 준비 중입니다.</SectionTitle>
        );
    }
  };

  return (
    <Container>
      <PageBackground>
        {/* 이전 헤더는 제거됨 - Header 컴포넌트가 이 부분을 처리함 */}
      </PageBackground>

      <Navigation>
        <NavItem onClick={() => handleTabChange('개요')}>개요</NavItem>
        <NavItem onClick={() => handleTabChange('멤버십')}>멤버십</NavItem>
        {activeTab === '보안' ? (
          <NavItemActive>보안</NavItemActive>
        ) : (
          <NavItem onClick={() => handleTabChange('보안')}>보안</NavItem>
        )}
        <NavItem onClick={() => handleTabChange('디바이스')}>디바이스</NavItem>
        {activeTab === '프로필' ? (
          <NavItemActive>프로필</NavItemActive>
        ) : (
          <NavItem onClick={() => handleTabChange('프로필')}>프로필</NavItem>
        )}
      </Navigation>

      <MainContent>
        <Section>
          {renderContent()}
        </Section>
      </MainContent>

      {/* 모달 컴포넌트 */}
      <PasswordChangeModal
        isOpen={isPasswordModalOpen}
        onClose={closePasswordModal}
        onSubmit={handlePasswordChange}
        isLoading={isLoading}
        error={error}
        success={success}
      />

      <NameChangeModal
        isOpen={isNameModalOpen}
        onClose={closeNameModal}
        onSubmit={handleNameChange}
        isLoading={isLoading}
        error={error}
        success={success}
      />
    </Container>
  );
};

export default AccountView; 