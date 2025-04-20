import { FC, useState } from 'react';
import Modal from '../Modal';
import SuccessMessage from '../SuccessMessage';
import { FormGroup, Label, Input, ErrorMessage, SubmitButton, CancelButton } from '../../styles';
import { PasswordChangeModalProps } from './types';

const PasswordChangeModal: FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  success,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    await onSubmit(currentPassword, newPassword, confirmPassword);
  };

  const resetFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetFields();
    onClose();
  };

  const footer = (
    <>
      <CancelButton onClick={handleClose}>취소</CancelButton>
      <SubmitButton onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? '처리 중...' : '변경하기'}
      </SubmitButton>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="비밀번호 변경" footer={footer}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <SuccessMessage message={success} />
      
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
    </Modal>
  );
};

export default PasswordChangeModal; 