import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ProviderProps } from '../types';

const ToastProvider = ({ children }: ProviderProps) => {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
};

export default ToastProvider; 