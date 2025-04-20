import React from 'react';
import { Toaster } from 'react-hot-toast';
import { ProviderProps } from '../types';

const ToastProvider = ({ children }: ProviderProps) => {
  return (
    <React.Fragment>
      {children}
      <Toaster position="top-center" />
    </React.Fragment>
  );
};

export default ToastProvider; 