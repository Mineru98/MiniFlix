import { FC } from 'react';
import { MessageContainer } from './styles';
import { SuccessMessageProps } from './types';

const SuccessMessage: FC<SuccessMessageProps> = ({ message }) => {
  if (!message) return null;
  
  return (
    <MessageContainer>{message}</MessageContainer>
  );
};

export default SuccessMessage; 