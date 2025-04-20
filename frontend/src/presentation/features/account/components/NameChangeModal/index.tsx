import { FC, useState } from 'react';
import Modal from '../Modal';
import SuccessMessage from '../SuccessMessage';
import { FormGroup, Label, Input, ErrorMessage, SubmitButton, CancelButton } from '../../styles';
import { NameChangeModalProps } from './types';
const NameChangeModal: FC<NameChangeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  success,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newName, setNewName] = useState('');

  const handleSubmit = async () => {
    await onSubmit(currentPassword, newName);
  };

  const resetFields = () => {
    setCurrentPassword('');
    setNewName('');
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
    <Modal isOpen={isOpen} onClose={handleClose} title="이름 변경" footer={footer}>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <SuccessMessage message={success} />
      
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
    </Modal>
  );
};

export default NameChangeModal; 